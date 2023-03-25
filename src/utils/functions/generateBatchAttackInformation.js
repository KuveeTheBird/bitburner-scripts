import {MIN_TIME_BETWEEN_ATTACKS_START} from "/settings/Settings";

/**
 * @param {NS} ns
 * @param {AttackableServer[]} attackableServers
 * @param {BotnetServerCollection} botnetServerCollection
 */
export function generateBatchAttackInformation(ns, attackableServers, botnetServerCollection) {
    let bestAttackParams = [];

    for (let attackableServer of attackableServers) {

        let hackRatio = 0.95;
        let bestAttackParam;
        while (hackRatio > 0) {
            let attackParams = generateBatchAttackInformationForAttackableServerAndHackRatio(attackableServer, botnetServerCollection, hackRatio)
            if (!bestAttackParam || attackParams.moneyPerSec > bestAttackParam.moneyPerSec) {
                bestAttackParam = attackParams;
            }
            hackRatio -= 0.05;
        }

        if (bestAttackParam) {
            bestAttackParams.push(bestAttackParam);
        }
    }

    bestAttackParams.sort(function(a, b) {
        return b.moneyPerSec - a.moneyPerSec;
    });

    return bestAttackParams;
}

/**
 * @param {AttackableServer} attackableServer
 * @param {BotnetServerCollection} botnetServerCollection
 * @param {number} hackRatio
 * @return {{hackWeakenThreads: (*|number), timeBetweenAttacksStart: number, hackThreads: (*|number), moneyPerSec: number, availableBatchCapacity: number, moneyPerBatch: number, growWeakenThreads: (*|number), weakenTime: (*|((server: Server, player: Person) => number)), batchThreads: *, secondsBetweenAttacksStart: number, hackTime: (*|((server: Server, player: Person) => number)), moneyMillionPerSec: string, growTime: (*|((server: Server, player: Person) => number)), growThreads: (*|number)}}
 */
function generateBatchAttackInformationForAttackableServerAndHackRatio(attackableServer, botnetServerCollection, hackRatio) {
    let growThreads = attackableServer.calculateReGrowThreads(hackRatio);
    let hackThreads = attackableServer.calculateHackThreads(hackRatio);
    let growWeakenThreads = attackableServer.calculateReGrowWeakenThreads(hackRatio);
    let hackWeakenThreads = attackableServer.calculateHackWeakenThreads(hackRatio);
    let batchThreads = growThreads + hackThreads + growWeakenThreads + hackWeakenThreads;

    let growTime = attackableServer.growTime;
    let hackTime = attackableServer.hackTime;
    let weakenTime = attackableServer.weakenTime;

    let availableBatchCapacity = botnetServerCollection.getAvailableBatchCapacity(batchThreads);
    if (availableBatchCapacity <= 0) {
        return;
    }

    let timeBetweenAttacksStart = Math.ceil(weakenTime / availableBatchCapacity);
    while (timeBetweenAttacksStart < MIN_TIME_BETWEEN_ATTACKS_START) {
        timeBetweenAttacksStart = Math.ceil(weakenTime / (--availableBatchCapacity));
    }

    let totalBatchThreads = availableBatchCapacity * batchThreads;
    let secondsBetweenAttacksStart = timeBetweenAttacksStart / 1000;
    let moneyPerBatch = attackableServer.maxMoney * hackRatio;
    let moneyPerSec = moneyPerBatch / secondsBetweenAttacksStart;
    let moneyMillionPerSec = Math.round(moneyPerSec / 1000 / 1000) + 'm$';

    return {
        'name': attackableServer.name,
        'hackRatio': hackRatio,
        'growThreads': growThreads,
        'hackThreads': hackThreads,
        'growWeakenThreads': growWeakenThreads,
        'hackWeakenThreads': hackWeakenThreads,
        'batchThreads': batchThreads,
        'moneyPerBatch': moneyPerBatch,
        'growTime': growTime,
        'hackTime': hackTime,
        'weakenTime': weakenTime,
        'availableBatchCapacity': availableBatchCapacity,
        'totalBatchThreads': totalBatchThreads,
        'timeBetweenAttacksStart': timeBetweenAttacksStart,
        'secondsBetweenAttacksStart': secondsBetweenAttacksStart,
        'moneyPerSec': moneyPerSec,
        'moneyMillionPerSec': moneyMillionPerSec,
    };
}