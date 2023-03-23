import {BotnetServer} from "/utils/data/BotnetServer";
import BotnetServerCollection from "/utils/data/Collections/BotnetServerCollection";
import {SERVER_NAME_HOME} from "/constants/ServerNames";

/** @param {NS} ns
 * @return BotnetServerCollection
 */
export async function gatherBotnetServers(ns) {
    let scannedServers = [SERVER_NAME_HOME];
    let botnetServers = new BotnetServerCollection(ns);
    botnetServers.addByName(SERVER_NAME_HOME);

    scanServers(ns, scannedServers, botnetServers, SERVER_NAME_HOME);

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