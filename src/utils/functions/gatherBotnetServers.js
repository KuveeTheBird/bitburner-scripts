import {BotnetServer} from "/utils/data/BotnetServer";
import BotnetServerCollection from "/utils/data/Collections/BotnetServerCollection";
import {TICK} from "/utils/data/Constants";

/** @param {NS} ns
 * @return BotnetServerCollection
 */
export async function gatherBotnetServers(ns) {
    const home = 'home';

    let scannedServers = [home];
    let botnetServers = new BotnetServerCollection(ns);
    botnetServers.addByName(home);

    scanServers(ns, scannedServers, botnetServers, home);

    botnetServers.sortByDesc('maxThreadCapacity');

    return botnetServers;
}

/** @param {NS} ns
 * @param {string[]} scannedServers
 * @param {BotnetServerCollection} botnetServers
 * @param {string} hostname
 */
function scanServers(ns, scannedServers, botnetServers, hostname) {
    let scannedHosts = ns.scan(hostname);

    for (let host of scannedHosts) {
        if (scannedServers.includes(host)) {
            continue;
        }

        scannedServers.push(host);

        let botnetServer = new BotnetServer(ns, host);

        if (botnetServer.hasRootAccess && botnetServer.maxRam > 0) {
            botnetServers.add(botnetServer);
        }

        scanServers(ns, scannedServers, botnetServers, host);
    }

}