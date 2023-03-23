import {getBotnetThreadCapacity} from "/utils/functions/getBotnetThreadCapacity";

/**
 * @param {NS} ns
 * @param {AttackableServer[]} attackableServers
 * @param {string[]} attackInProgress
 * @return AttackableServer[]
 */
export function getUnpreparedAttackableServers(ns, attackableServers) {

    let unpreparedAttackableServers = [];
    for (let server of attackableServers) {
        if (!server.prepared) {
            unpreparedAttackableServers.push(server);
        }
    }

    unpreparedAttackableServers.sort(function(a, b) {
        return a.threadsToFullyWeaken - b.threadsToFullyWeaken;
    });

    return unpreparedAttackableServers;
}