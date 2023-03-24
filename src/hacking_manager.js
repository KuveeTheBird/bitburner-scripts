import {gatherBotnetServers} from "/utils/functions/gatherBotnetServers";
import {gatherAttackableServers} from "/utils/functions/gatherAttackableServers";
import {getAttackVectors} from "/utils/functions/getAttackVectors";
import {getUnpreparedAttackableServers} from "/utils/functions/getUnpreparedAttackableServers";
import {gatherAttackData} from "/utils/functions/gatherAttackData";
import {
    DISPATCHER_TIME_INTERVAL,
    MIN_TIME_BETWEEN_ATTACKS_START,
    TIME_BETWEEN_ATTACK_PHASES
} from "/settings/Settings";
import {AttackableServer} from "/utils/data/AttackableServer";
import {ScriptTiming} from "/utils/data/ScriptTiming";
import {ATTACK_TYPE_GROW, ATTACK_TYPE_HACK, ATTACK_TYPE_WEAKEN, TICK} from "/constants/BatchAttack";
import ScriptTimingCollection from "/utils/data/Collections/ScriptTimingCollection";

function calculateHackThreads(attackableServer, hackRatio) {
    let hackThreads = attackableServer.calculateHackThreads(hackRatio);
    let hackWeakenThreads = attackableServer.calculateHackWeakenThreads(hackRatio);
    let growThreads = attackableServer.calculateReGrowThreads(hackRatio);
    let growWeakenThreads = attackableServer.calculateReGrowWeakenThreads(hackRatio);
    return {hackThreads, hackWeakenThreads, growThreads, growWeakenThreads};
}

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');

    while (true) {
        ns.run('utils/networkDiscovery.js');

        await prepareServers(ns);

        let botnetServerCollection = await gatherBotnetServers(ns);
        let attackVectors = await getAttackVectors(ns, botnetServerCollection);

        if (attackVectors.length > 0) {
            let mainAttackVector = attackVectors[0];
            let scriptTimingCollection = new ScriptTimingCollection(ns);
            let attackableServer = new AttackableServer(ns, mainAttackVector.name);
            ns.print('Starting batch attack:');
            ns.print(JSON.stringify(mainAttackVector, undefined, 2));

            let runCount = 0;

            let hackRatio = mainAttackVector.hackRatio;
            let maxRunCount = 100;
            let hackingLevel = ns.getHackingLevel();
            if (hackingLevel < 900) {
                maxRunCount = 10 * Math.ceil(hackingLevel / 100);
            }
            while (runCount <= maxRunCount) {
                runCount++;
                botnetServerCollection = await gatherBotnetServers(ns);
                while (botnetServerCollection.getAvailableAttackThreads() < mainAttackVector.totalThreads) {
                    await ns.asleep(TIME_BETWEEN_ATTACK_PHASES);
                    botnetServerCollection = await gatherBotnetServers(ns);
                }

                let timeBetweenAttacksStart = mainAttackVector.timeBetweenAttacksStart;

                await waitUntilScriptsDontConflict(ns, attackableServer, scriptTimingCollection, timeBetweenAttacksStart);

                let {hackDelay, hackWeakenDelay, growDelay, growWeakenDelay, waitTime} = calculateDelays(attackableServer, timeBetweenAttacksStart);
                let {hackThreads, hackWeakenThreads, growThreads, growWeakenThreads} = calculateHackThreads(attackableServer, hackRatio);

                await botnetServerCollection.hackTargetWithDelay(attackableServer, hackThreads, hackDelay);
                let hackScriptTiming = new ScriptTiming(attackableServer, ATTACK_TYPE_HACK, hackThreads, hackDelay, attackableServer.hackTime);

                await botnetServerCollection.weakenTargetWithDelay(attackableServer, hackWeakenThreads, hackWeakenDelay);
                let hackWeakenScriptTiming = new ScriptTiming(attackableServer, ATTACK_TYPE_WEAKEN, hackWeakenThreads, hackWeakenDelay, attackableServer.weakenTime, hackScriptTiming);
                scriptTimingCollection.add(hackWeakenScriptTiming);

                await botnetServerCollection.growTargetWithDelay(attackableServer, growThreads, growDelay);
                let growScriptTiming = new ScriptTiming(attackableServer, ATTACK_TYPE_GROW, growThreads, growDelay, attackableServer.growTime);

                await botnetServerCollection.weakenTargetWithDelay(attackableServer, growWeakenThreads, growWeakenDelay);
                let growWeakenScriptTiming = new ScriptTiming(attackableServer, ATTACK_TYPE_WEAKEN, growWeakenThreads, growWeakenDelay, attackableServer.weakenTime, growScriptTiming);
                scriptTimingCollection.add(growWeakenScriptTiming);

                await ns.asleep(waitTime);
            }
        }
        ns.print('------------------------------------------');
        ns.printf('Dispatcher finished, sleeping for %s seconds before starting again.', DISPATCHER_TIME_INTERVAL / 1000);
        ns.print('------------------------------------------');

        await ns.sleep(DISPATCHER_TIME_INTERVAL);
    }
}

/** @param {NS} ns */
async function prepareServers(ns) {
    let botnetServerCollection = await gatherBotnetServers(ns);
    let attackableServers = gatherAttackableServers(ns);
    let weakenAttackDataCollection = gatherAttackData(ns, botnetServerCollection);

    botnetServerCollection.sortByDesc('currentThreadCapacity');
    let unpreparedAttackableServers = getUnpreparedAttackableServers(ns, attackableServers);

    for (let attackableServer of unpreparedAttackableServers) {
        await botnetServerCollection.fullyWeakenTarget(attackableServer, weakenAttackDataCollection);
    }
    await ns.asleep(10);

    let growAttackDataCollection = gatherAttackData(ns, botnetServerCollection);
    for (let attackableServer of unpreparedAttackableServers) {
        if (attackableServer.securityDiff === 0) {
            await botnetServerCollection.fullyGrowTarget(attackableServer, growAttackDataCollection);
        }
    }
}

function calculateDelays(attackableServer, timeBetweenAttacksStart) {
    let hackDelay = attackableServer.weakenTime - attackableServer.hackTime - TIME_BETWEEN_ATTACK_PHASES;
    let hackWeakenDelay = 0;
    let growDelay = attackableServer.weakenTime - attackableServer.growTime + TIME_BETWEEN_ATTACK_PHASES;
    let growWeakenDelay = TIME_BETWEEN_ATTACK_PHASES * 2;
    let waitTime = timeBetweenAttacksStart > MIN_TIME_BETWEEN_ATTACKS_START ? timeBetweenAttacksStart : MIN_TIME_BETWEEN_ATTACKS_START;
    return {hackDelay, hackWeakenDelay, growDelay, growWeakenDelay, waitTime};
}

/** @param {NS} ns
 * @param {AttackableServer} attackableServer
 * @param {ScriptTimingCollection} scriptTimingCollection
 * @param {number} timeBetweenAttacksStart
 */
async function waitUntilScriptsDontConflict(ns, attackableServer, scriptTimingCollection, timeBetweenAttacksStart) {
    while (true) {
        scriptTimingCollection.cleanup();
        let now = Date.now()
        let delay;
        let {hackDelay, hackWeakenDelay, growDelay, growWeakenDelay, waitTime} = calculateDelays(attackableServer, timeBetweenAttacksStart);

        //IF HACK START CONFLICTS -> WAIT AND CONTINUE
        let hackScriptStart = now + hackDelay;
        delay = await scriptTimingCollection.incearseDelayToAvoidConflictBy(attackableServer, hackScriptStart);
        if (delay > 0) {
            await ns.asleep(delay);
            continue;
        }

        //IF HACK END CONFLICTS -> WAIT AND CONTINUE
        let hackScriptEnd = hackScriptStart + attackableServer.hackTime;
        delay = await scriptTimingCollection.incearseDelayToAvoidConflictBy(attackableServer, hackScriptEnd);
        if (delay > 0) {
            await ns.asleep(delay);
            continue;
        }

        //IF HACKWEAKEN START CONFLICTS -> WAIT AND CONTINUE
        let hackWeakenScriptStart = now + hackWeakenDelay;
        delay = await scriptTimingCollection.incearseDelayToAvoidConflictBy(attackableServer, hackWeakenScriptStart);
        if (delay > 0) {
            await ns.asleep(delay);
            continue
        }

        //IF HACKWEAKEN END CONFLICTS -> WAIT AND CONTINUE
        let hackWeakenScriptEnd = hackWeakenScriptStart + attackableServer.weakenTime;
        delay = await scriptTimingCollection.incearseDelayToAvoidConflictBy(attackableServer, hackWeakenScriptEnd);
        if (delay > 0) {
            await ns.asleep(delay);
            continue
        }

        //IF GROW START CONFLICTS -> WAIT AND CONTINUE
        let growScriptStart = now + growDelay;
        delay = await scriptTimingCollection.incearseDelayToAvoidConflictBy(attackableServer, growScriptStart);
        if (delay > 0) {
            await ns.asleep(delay);
            continue;
        }

        //IF GROW END CONFLICTS -> WAIT AND CONTINUE
        let growScriptEnd = growScriptStart + attackableServer.growTime;
        delay = await scriptTimingCollection.incearseDelayToAvoidConflictBy(attackableServer, growScriptEnd);
        if (delay > 0) {
            await ns.asleep(delay);
            continue;
        }

        //IF GROWWEAKEN START CONFLICTS -> WAIT AND CONTINUE
        let growWeakenScriptStart = now + growWeakenDelay;
        delay = await scriptTimingCollection.incearseDelayToAvoidConflictBy(attackableServer, growWeakenScriptStart);
        if (delay > 0) {
            await ns.asleep(delay);
            continue;
        }

        //IF GROWWEAKEN END CONFLICTS -> WAIT AND CONTINUE
        let growWeakenScriptEnd = growWeakenScriptStart + attackableServer.weakenTime;
        delay = await scriptTimingCollection.incearseDelayToAvoidConflictBy(attackableServer, growWeakenScriptEnd);
        if (delay > 0) {
            await ns.asleep(delay);
            continue;
        }
        break
    }
}