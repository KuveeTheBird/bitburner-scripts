import {FACTIONS_BACKDOOR_REQUIREMENTS} from "/constants/Factions";
import {Server} from "/utils/data/Server";
import {SERVER_NAME_HOME} from "/constants/ServerNames";
import {searchForServer} from "/utils/functions/searchForServer";
import {gatherAncestry} from "/utils/functions/gatherAncestry";

/** @param {import(".").NS } ns */
export async function main(ns) {
    let factionNames = Object.keys(FACTIONS_BACKDOOR_REQUIREMENTS);
    let homeServer = new Server(ns, SERVER_NAME_HOME);

    for (let factionName of factionNames) {
        let factionServer = FACTIONS_BACKDOOR_REQUIREMENTS[factionName];
        let targetServer = searchForServer(homeServer, factionServer);
        if (!targetServer) {
            continue;
        } else if (targetServer.backdoorInstalled) {
            continue;
        } else if (!targetServer.hackable) {
            continue;
        } else if (!targetServer.hasRootAccess) {
            continue;
        }

        let flatArray = [];

        gatherAncestry(homeServer, targetServer.name, flatArray);
        flatArray.shift();

        ns.singularity.connect(SERVER_NAME_HOME);
        for (let server of flatArray) {
            ns.singularity.connect(server);
        }
        await ns.singularity.installBackdoor();
        ns.singularity.connect(SERVER_NAME_HOME);
    }
}
