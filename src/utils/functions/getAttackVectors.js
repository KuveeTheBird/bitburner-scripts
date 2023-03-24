import {gatherAttackableServers} from "/utils/functions/gatherAttackableServers";
import {gatherAttackData} from "/utils/functions/gatherAttackData";
import {
    ATTACK_TYPE_GROW,
    ATTACK_TYPE_HACK,
    ATTACK_TYPE_PREPARE_GROW,
    ATTACK_TYPE_PREPARE_WEAKEN,
    ATTACK_TYPE_WEAKEN
} from "/constants/BatchAttack";
import {MIN_TIME_BETWEEN_ATTACKS_START} from "/settings/Settings";
import {AttackableServer} from "/utils/data/AttackableServer";
import {gatherBotnetServers} from "/utils/functions/gatherBotnetServers";

/**
 * @param {NS} ns
 * @param {BotnetServerCollection} botnetServerCollection
 * @return {*[]}
 */
export async function getAttackVectors(ns) {
    let botnetServerCollection = await gatherBotnetServers(ns);
    let bestAttackParams = [];

    let attackDataCollection = gatherAttackData(ns, botnetServerCollection);
    if (attackDataCollection.getThreadsByAttackType([ATTACK_TYPE_PREPARE_GROW, ATTACK_TYPE_PREPARE_WEAKEN, ATTACK_TYPE_HACK, ATTACK_TYPE_GROW, ATTACK_TYPE_WEAKEN]) > 0) {
        ns.printf('Won\'t start attacking until preparation is ongoing.');
        return bestAttackParams;
    }

    let attackableServers = gatherAttackableServers(ns);

    for (let attackableServer of attackableServers) {
        let attackThreads = attackDataCollection.getThreadsByAttackableServerAndAttackType(attackableServer, [ATTACK_TYPE_HACK, ATTACK_TYPE_GROW, ATTACK_TYPE_WEAKEN]);
        if (attackThreads > 0) {
            ns.printf('Already attacking: %s', attackableServer.name);
        } else {
            let hackRatio = 0.95;
            let bestAttackParam;
            while (hackRatio > 0) {
                let attackParams = calculateAttackVector(ns, attackableServer, hackRatio, botnetServerCollection);

                if (typeof bestAttackParam === 'undefined' || attackParams.moneyPerSec > bestAttackParam.moneyPerSec) {
                    bestAttackParam = attackParams;
                }
                hackRatio -= 0.05;
            }

            if (typeof bestAttackParam !== 'undefined') {
                bestAttackParams.push(bestAttackParam);
            }
        }
    }

    bestAttackParams.sort(function(a, b) {
        return b.moneyPerSec - a.moneyPerSec;
    });

    return bestAttackParams.slice(0, 10);
}

/**
 *
 * @param {NS} ns
 * @param {AttackableServer} attackableServer
 * @param {number} hackRatio
 * @param {BotnetServerCollection} botnetServerCollection
 */
export function calculateAttackVector(ns, attackableServer, hackRatio, botnetServerCollection) {
    let botnetThreadCapacity = botnetServerCollection.getAvailableAttackThreads();
    let attackParams = calculateAttackParams(ns, attackableServer, hackRatio);
    if (botnetThreadCapacity < attackParams.totalThreads) {
        return;
    }

    let parralelAttacksCount = Math.floor(botnetThreadCapacity / attackParams.totalThreads);
    let timeBetweenAttacksStart = Math.ceil(attackParams.weakenTime / (parralelAttacksCount));
    if (timeBetweenAttacksStart < MIN_TIME_BETWEEN_ATTACKS_START) {
        timeBetweenAttacksStart = MIN_TIME_BETWEEN_ATTACKS_START;
    }
    parralelAttacksCount = Math.floor(botnetThreadCapacity / attackParams.totalThreads);

    let secondsBetweenAttacksStart = timeBetweenAttacksStart/1000;
    let moneyPerSec = attackParams.moneyPerBatch / secondsBetweenAttacksStart;
    let moneyMillionPerSec = Math.round(moneyPerSec / 1000 / 1000) + 'm$';

    attackParams.parralelAttacksCount = parralelAttacksCount;
    attackParams.timeBetweenAttacksStart = timeBetweenAttacksStart;
    attackParams.secondsBetweenAttacksStart = secondsBetweenAttacksStart;
    attackParams.moneyPerSec = moneyPerSec;
    attackParams.moneyMillionPerSec = moneyMillionPerSec;

    return attackParams;
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