import {MIN_TIME_BETWEEN_ATTACKS_START, TIME_BETWEEN_ATTACK_PHASES} from "/settings/Settings";
import {ScriptTiming} from "/utils/data/ScriptTiming";
import {ATTACK_TYPE_GROW, ATTACK_TYPE_HACK, ATTACK_TYPE_WEAKEN} from "/constants/BatchAttack";
import {BotnetServer} from "/utils/data/BotnetServer";
import {AttackableServer} from "/utils/data/AttackableServer";
import ScriptTimingCollection from "/utils/data/Collections/ScriptTimingCollection";

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    let portNumber = ns.args[0];

    let portHandle = ns.getPortHandle(portNumber);
    let pid = portHandle.read();
    let attackInformationString = portHandle.peek();

    if (ns.pid !== pid) {
        ns.alert('INVALID PID FOR SINGLE_ATTACK_MANAGER');
    }

    let attackInformation = JSON.parse(attackInformationString);
    ns.print(JSON.stringify(attackInformation, undefined, 2));

    let lastPids = await manageBatchAttacks(ns, attackInformation);


    ns.printf('Waiting for the last scripts to end.');
    let wait = true;
    while (wait) {
        await ns.asleep(1000);
        wait = false;
        for (let pid of lastPids) {
            if (ns.isRunning(pid)) {
                ns.printf('Pid: %s is still running', pid);
                wait = true;
                break;
            }
        }
    }
}

async function manageBatchAttacks(ns, attackInformation) {
    let attackableServer = new AttackableServer(ns, attackInformation.name);

    let batchReservationKeys = Object.keys(attackInformation.batchReservations);
    let scriptTimingCollection = new ScriptTimingCollection(ns);
    let lastPids = [];
    ns.printf('Starting attack with %s batches against %s.', attackInformation.availableBatchCapacity, attackableServer.name);
    for (let i of batchReservationKeys) {
        let batchReservation = attackInformation.batchReservations[i];
        let botnetServerName = batchReservation.name;
        let numberOfBatches = batchReservation.reservedBatches;

        let botnetServer = new BotnetServer(ns, botnetServerName);

        ns.printf('Starting %s batches on %s', numberOfBatches, botnetServer.name)
        for (let batchNumber = 0 ; batchNumber < numberOfBatches ; batchNumber++) {
            ns.printf('Starting batch #%s on %s', batchNumber, botnetServer.name)
            lastPids = await attackServer(ns, botnetServer, attackableServer, scriptTimingCollection, attackInformation);
        }

    }

    return lastPids;
}

/**
 * @param {NS} ns
 * @param {BotnetServer} botnetServer
 * @param {AttackableServer} attackableServer
 * @param {ScriptTimingCollection} scriptTimingCollection
 * @param attackInformation
 */
async function attackServer(ns, botnetServer, attackableServer, scriptTimingCollection, attackInformation) {
    let timeBetweenAttacksStart = attackInformation.timeBetweenAttacksStart;
    let hackRatio = attackInformation.hackRatio;
    let pids = [];

    await waitUntilScriptsDontConflict(ns, attackableServer, scriptTimingCollection, timeBetweenAttacksStart);

    let {hackDelay, hackWeakenDelay, growDelay, growWeakenDelay, waitTime} = calculateDelays(attackableServer, timeBetweenAttacksStart);
    let {hackThreads, hackWeakenThreads, growThreads, growWeakenThreads} = calculateHackThreads(attackableServer, hackRatio);

    pids.push(await botnetServer.hackTargetWithDelay(attackableServer, hackThreads, hackDelay));
    let hackScriptTiming = new ScriptTiming(attackableServer, ATTACK_TYPE_HACK, hackThreads, hackDelay, attackableServer.hackTime);

    pids.push(await botnetServer.weakenTargetWithDelay(attackableServer, hackWeakenThreads, hackWeakenDelay));
    let hackWeakenScriptTiming = new ScriptTiming(attackableServer, ATTACK_TYPE_WEAKEN, hackWeakenThreads, hackWeakenDelay, attackableServer.weakenTime, hackScriptTiming);
    scriptTimingCollection.add(hackWeakenScriptTiming);

    pids.push(await botnetServer.growTargetWithDelay(attackableServer, growThreads, growDelay));
    let growScriptTiming = new ScriptTiming(attackableServer, ATTACK_TYPE_GROW, growThreads, growDelay, attackableServer.growTime);

    pids.push(await botnetServer.weakenTargetWithDelay(attackableServer, growWeakenThreads, growWeakenDelay));
    let growWeakenScriptTiming = new ScriptTiming(attackableServer, ATTACK_TYPE_WEAKEN, growWeakenThreads, growWeakenDelay, attackableServer.weakenTime, growScriptTiming);
    scriptTimingCollection.add(growWeakenScriptTiming);

    await ns.asleep(waitTime);
    return pids;
}

function calculateHackThreads(attackableServer, hackRatio) {
    let hackThreads = attackableServer.calculateHackThreads(hackRatio);
    let hackWeakenThreads = attackableServer.calculateHackWeakenThreads(hackRatio);
    let growThreads = attackableServer.calculateReGrowThreads(hackRatio);
    let growWeakenThreads = attackableServer.calculateReGrowWeakenThreads(hackRatio);
    return {hackThreads, hackWeakenThreads, growThreads, growWeakenThreads};
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