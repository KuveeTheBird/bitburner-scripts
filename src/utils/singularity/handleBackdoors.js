import {FACTIONS_BACKDOOR_REQUIREMENTS} from "/constants/Factions";
import {Server} from "/utils/data/Server";
import {SERVER_NAME_HOME, SERVER_NAME_WORLD_DAEMON} from "/constants/ServerNames";
import {searchForServer} from "/utils/functions/searchForServer";
import {gatherAncestry} from "/utils/functions/gatherAncestry";

/** @param {import(".").NS } ns */
export async function main(ns) {
    let factionNames = Object.keys(FACTIONS_BACKDOOR_REQUIREMENTS);
    let homeServer = new Server(ns, SERVER_NAME_HOME);

    for (let factionName of factionNames) {
        let factionServer = FACTIONS_BACKDOOR_REQUIREMENTS[factionName];
        await backdoorServerIfPossible(ns, homeServer, factionServer);
    }

    let wd = searchForServer(homeServer, SERVER_NAME_WORLD_DAEMON);
    if (wd) {
        ns.toast('AUTO ESCAPE IS DISABLED', 'warning');
    }
    // await backdoorServerIfPossible(ns, homeServer, SERVER_NAME_WORLD_DAEMON, true);
}

/**
 * @param {NS} ns
 * @param {Server} homeServer
 * @param {string} targetServerName
 */
async function backdoorServerIfPossible(ns, homeServer, targetServerName, killAll) {
    let targetServer = searchForServer(homeServer, targetServerName);
    if (!targetServer) {
        return;
    } else if (targetServer.backdoorInstalled) {
        return;
    } else if (!targetServer.hackable) {
        return;
    } else if (!targetServer.hasRootAccess) {
        return;
    }

    let flatArray = [];

    gatherAncestry(homeServer, targetServer.name, flatArray);
    flatArray.shift();

    ns.singularity.connect(SERVER_NAME_HOME);
    for (let server of flatArray) {
        ns.singularity.connect(server);
    }
    await ns.singularity.installBackdoor();

    if (killAll) {
        ns.killall(SERVER_NAME_HOME, false);
    }
    ns.singularity.connect(SERVER_NAME_HOME);
}
