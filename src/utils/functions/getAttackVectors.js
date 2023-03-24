import {gatherAttackableServers} from "/utils/functions/gatherAttackableServers";
import {gatherAttackData} from "/utils/functions/gatherAttackData";
import {
    ATTACK_TYPE_GROW,
    ATTACK_TYPE_HACK,
    ATTACK_TYPE_PREPARE_GROW,
    ATTACK_TYPE_PREPARE_WEAKEN, ATTACK_TYPE_WEAKEN
} from "/constants/BatchAttack";
import * as CONSTANTS from "/constants/BatchAttack";
import {TIME_BETWEEN_ATTACK_PHASES} from "/settings/Settings";
import {AttackableServer} from "/utils/data/AttackableServer";

/**
 * @param {NS} ns
 * @param {BotnetServerCollection} botnetServerCollection
 * @return {*[]}
 */
export async function getAttackVectors(ns, botnetServerCollection) {
    let bestAttackParams = [];

    let attackDataCollection = gatherAttackData(ns, botnetServerCollection);
    if (attackDataCollection.getThreadsByAttackType([ATTACK_TYPE_PREPARE_GROW, ATTACK_TYPE_PREPARE_WEAKEN, ATTACK_TYPE_HACK, ATTACK_TYPE_GROW, ATTACK_TYPE_WEAKEN]) > 0) {
        ns.printf('Won\'t start attacking until preparation is ongoing.');
        return bestAttackParams;
    }

    let attackableServers = gatherAttackableServers(ns);
    let botnetThreadCapacity = botnetServerCollection.getAvailableAttackThreads();

    let minTimeBetweenAttacksStart = 10 * TIME_BETWEEN_ATTACK_PHASES;
    for (let attackableServer of attackableServers) {
        let attackThreads = attackDataCollection.getThreadsByAttackableServerAndAttackType(attackableServer, [ATTACK_TYPE_HACK, ATTACK_TYPE_GROW, ATTACK_TYPE_WEAKEN]);
        if (attackThreads > 0) {
            ns.printf('Already attacking: %s', attackableServer.name);
        } else {
            let hackRatio = 0.95;
            let bestAttackParam;
            while (hackRatio > 0) {
                let attackParams = calculateAttackParams(ns, attackableServer, hackRatio);
                hackRatio -= 0.05;
                let parralelAttacksCount = Math.floor(botnetThreadCapacity / attackParams.totalThreads);
                if (parralelAttacksCount <= 0) {
                    continue
                }

                let timeBetweenAttacksStart = Math.ceil(attackParams.weakenTime / (parralelAttacksCount));
                if (timeBetweenAttacksStart < minTimeBetweenAttacksStart) {
                    timeBetweenAttacksStart = minTimeBetweenAttacksStart;
                }
                let secondsBetweenAttacksStart = timeBetweenAttacksStart/1000;
                let moneyPerSec = attackParams.moneyPerBatch / secondsBetweenAttacksStart;
                let moneyMillionPerSec = Math.round(moneyPerSec / 1000 / 1000) + 'm$';

                attackParams['parralelAttacksCount'] = parralelAttacksCount;
                attackParams['timeBetweenAttacksStart'] = timeBetweenAttacksStart;
                attackParams['secondsBetweenAttacksStart'] = secondsBetweenAttacksStart;
                attackParams['moneyPerSec'] = moneyPerSec;
                attackParams['moneyMillionPerSec'] = moneyMillionPerSec;

                if (typeof bestAttackParam === 'undefined' || moneyPerSec > bestAttackParam.moneyPerSec) {
                    bestAttackParam = attackParams;
                }
            }
            // if (typeof bestAttackParam !== 'undefined' && bestAttackParams.timeBetweenAttacksStart >= (minTimeBetweenAttacksStart * 4)) {
            if (typeof bestAttackParam !== 'undefined') {
                bestAttackParams.push(bestAttackParam);
            }
        }
    }

    bestAttackParams.sort(function(a, b) {
        return b.moneyPerSec - a.moneyPerSec;
        // return b.timeBetweenAttacksStart - a.timeBetweenAttacksStart;
    });

    return bestAttackParams.slice(0, 10);
}

/**
 *
 * @param {NS} ns
 * @param {AttackableServer} attackableServer
 * @param {number} hackRatio
 * @return {{totalThreads: *, hackWeakenThreads: (*|number), weakenTime: (*|((server: Server, player: Person) => number)), hackThreads: (*|number), hackTime: (*|((server: Server, player: Person) => number)), growTime: (*|((server: Server, player: Person) => number)), moneyPerBatch: number, growThreads: (*|number), growWeakenThreads: (*|number)}}
 */
export function calculateAttackParams(ns, attackableServer, hackRatio) {
    let growThreads = attackableServer.calculateReGrowThreads(hackRatio);
    let hackThreads = attackableServer.calculateHackThreads(hackRatio);
    let growWeakenThreads = attackableServer.calculateReGrowWeakenThreads(hackRatio);
    let hackWeakenThreads = attackableServer.calculateHackWeakenThreads(hackRatio);

    let growTime = attackableServer.growTime;
    let hackTime = attackableServer.hackTime;
    let weakenTime = attackableServer.weakenTime;

    let totalThreads = growThreads + hackThreads + growWeakenThreads + hackWeakenThreads;
    let moneyPerBatch = attackableServer.maxMoney * hackRatio;

    return {
        'name': attackableServer.name,
        'hackRatio': hackRatio,

        'growThreads': growThreads,
        'hackThreads': hackThreads,
        'growWeakenThreads': growWeakenThreads,
        'hackWeakenThreads': hackWeakenThreads,

        'hackTime': hackTime,
        'growTime': growTime,
        'weakenTime': weakenTime,

        'totalThreads': totalThreads,
        'moneyPerBatch': moneyPerBatch,
    };
}