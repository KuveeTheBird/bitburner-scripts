import {AttackableServer} from "/utils/data/AttackableServer";
import {WEAKEN_TIME_CUTOFF} from "/utils/data/Settings";

/** @param {NS} ns
 * @return AttackableServer[]
 */
export function gatherAttackableServers(ns) {
    const home = 'home';

    let scannedServers = [home];
    let attackableServers = [];

    scanServers(ns, scannedServers, attackableServers, home);

    if (!attackableServers.length) {
        attackableServers.push(new AttackableServer(ns, 'n00dles'));
    }

    return attackableServers;
}

/** @param {NS} ns
 * @param {string[]} scannedServers
 * @param {AttackableServer[]} attackableServers
 * @param {string} hostname
 */
function scanServers(ns, scannedServers, attackableServers, hostname) {
    let scannedHosts = ns.scan(hostname);

    for (let host of scannedHosts) {
        if (scannedServers.includes(host)) {
            continue;
        }
        scannedServers.push(host);

        let attackableServer = new AttackableServer(ns, host);
        if (attackableServer.hasRootAccess && attackableServer.hackable && attackableServer.weakenTime < WEAKEN_TIME_CUTOFF) {
            attackableServers.push(attackableServer);
        }

        scanServers(ns, scannedServers, attackableServers, host);
    }

}