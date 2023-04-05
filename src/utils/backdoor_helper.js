import {Server} from '/utils/data/Server.js';
import {FACTIONS_BACKDOOR_REQUIREMENTS} from "/constants/Factions";
import {SERVER_NAME_HOME} from "/constants/ServerNames";
import {ADDITIONAL_BACKDOORS} from "/constants/Misc";
import {searchForServer} from "/utils/functions/searchForServer";
import {gatherAncestry} from "/utils/functions/gatherAncestry";

/** @param {NS} ns */
export async function main(ns) {
    let homeServer = new Server(ns, SERVER_NAME_HOME);

    for (let factionName of Object.keys(FACTIONS_BACKDOOR_REQUIREMENTS)) {
        generateBackdoorInstructions(ns, homeServer, FACTIONS_BACKDOOR_REQUIREMENTS[factionName]);
    }
    for (let targetHostName of ADDITIONAL_BACKDOORS) {
        generateBackdoorInstructions(ns, homeServer, targetHostName);
    }
    // ns.alert('WORLD DAEMON NOT IMPLEMENTED YET');
}

function generateBackdoorInstructions(ns, homeServer, targetHostName) {
    let targetServer = searchForServer(homeServer, targetHostName);
    if (!targetServer) {
        ns.tprintf('%s doesn\'t exist (yet).', targetHostName);
        return;
    } else if (targetServer.backdoorInstalled) {
        ns.tprintf('%s already backdoored.', targetServer.name);
        return;
    } else if (!targetServer.hackable) {
        ns.tprintf('%s can\'t be hacked yet. Requires hacking level of: %s', targetServer.name, targetServer.requiredHackingLevel);
        return;
    } else if (!targetServer.hasRootAccess) {
        ns.tprintf('%s doesn\'t have root access yet.', targetServer.name);
        return;
    }
    ns.tprintf('%s can and should be backdoored.', targetServer.name);

    let flatArray = [];

    gatherAncestry(homeServer, targetServer.name, flatArray);
    flatArray.shift();

    ns.tprintf('------------------------');
    ns.tprintf('%s;', SERVER_NAME_HOME);
    for (let server of flatArray) {
        ns.tprintf('connect %s;', server);
    }
    ns.tprintf('backdoor');
    ns.tprintf('------------------------');
}
