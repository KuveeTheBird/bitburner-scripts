import {AttackableServer} from "/utils/data/AttackableServer";
import {WEAKEN_TIME_CUTOFF_BASE} from "/settings/Settings";
import {SERVER_NAME_HOME} from "/constants/ServerNames";

/** @param {NS} ns
 * @return AttackableServer[]
 */
export function gatherAttackableServers(ns) {

    let scannedServers = [SERVER_NAME_HOME];
    let attackableServers = [];

    scanServers(ns, scannedServers, attackableServers, SERVER_NAME_HOME);

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
        let weakenTimeCutoff = WEAKEN_TIME_CUTOFF_BASE;
        let hackLevelCutoffMultiplier = Math.floor(ns.getHackingLevel()/200);
        hackLevelCutoffMultiplier = hackLevelCutoffMultiplier < 1 ? 1 : hackLevelCutoffMultiplier
        if (attackableServer.hasRootAccess && attackableServer.hackable && attackableServer.weakenTime < (weakenTimeCutoff * hackLevelCutoffMultiplier)) {
            attackableServers.push(attackableServer);
        }

        scanServers(ns, scannedServers, attackableServers, host);
    }

}