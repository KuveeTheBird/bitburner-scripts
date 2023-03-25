import {gatherBotnetServers} from "/utils/functions/gatherBotnetServers";
import {gatherAttackableServers} from "/utils/functions/gatherAttackableServers";
import {gatherAttackData} from "/utils/functions/gatherAttackData";
import {getUnpreparedAttackableServers} from "/utils/functions/getUnpreparedAttackableServers";

export async function main(ns) {
    ns.disableLog('ALL');

    while (await prepareServers(ns)) {
        await ns.asleep(1000);
    }
}

/** @param {NS} ns */
export async function prepareServers(ns) {
    ns.printf('Starting prepare servers');
    let botnetServerCollection = await gatherBotnetServers(ns);
    let attackableServers = gatherAttackableServers(ns);
    let weakenAttackDataCollection = gatherAttackData(ns, botnetServerCollection);

    botnetServerCollection.sortByDesc('currentThreadCapacity');
    let unpreparedAttackableServers = getUnpreparedAttackableServers(ns, attackableServers);

    ns.printf('Unprepared servers: %s', JSON.stringify(unpreparedAttackableServers, undefined, 2));
    if (!unpreparedAttackableServers.length) {
        return false;
    }

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

    return true;
}