import {Server} from '/utils/data/Server.js';
import {FACTIONS_BACKDOOR_REQUIREMENTS} from "/constants/Factions";
import {SERVER_NAME_HOME} from "/constants/ServerNames";

/** @param {NS} ns */
export async function main(ns) {
    let homeServer = new Server(ns, SERVER_NAME_HOME);

    // for (let targetHostName of FACTIONS_BACKDOOR_REQUIREMENTS) {
    for (let factionName of Object.keys(FACTIONS_BACKDOOR_REQUIREMENTS)) {
        let targetHostName = FACTIONS_BACKDOOR_REQUIREMENTS[factionName];
        let targetServer = searchForServer(homeServer, targetHostName);
        if (targetServer.backdoorInstalled ) {
            ns.tprintf('%s already backdoored.', targetServer.name);
            continue;
        } else if (!targetServer.hackable) {
            ns.tprintf('%s can\'t be hacked yet. Requires hacking level of: %s', targetServer.name, targetServer.requiredHackingLevel);
            continue;
        } else if (!targetServer.hasRootAccess) {
            ns.tprintf('%s doesn\'t have root access yet.', targetServer.name);
            continue;
        }
        ns.tprintf('%s can and should be backdoored.', targetServer.name);

        let flatArray = [];

        gatherAncestry(homeServer, targetServer.name, flatArray);
        flatArray.shift();

        ns.tprintf('------------------------');
        ns.tprintf(SERVER_NAME_HOME);
        for (let server of flatArray) {
            ns.tprintf('connect %s;', server);
        }
        ns.tprintf('backdoor');
        ns.tprintf(SERVER_NAME_HOME);
        ns.tprintf('------------------------');

    }
}

/**
 *
 * @param {Server} parentServer
 * @param {string} targetServerHostname
 * @return {Server|false}
 */
function searchForServer(parentServer, targetServerHostname) {
    for (let childServer of parentServer.children) {
        if (childServer.name === targetServerHostname) {
            return childServer;
        }

        if (childServer.children.length) {
            let searchResult = searchForServer(childServer, targetServerHostname);
            if (searchResult !== false) {
                return searchResult
            }
        }

    }
    return false;
}

/**
 * @param {Server} homeServer
 * @param {string} serverName
 * @param {string[]} flatArray
 */
function gatherAncestry(homeServer, serverName, flatArray) {
    flatArray.unshift(serverName);
    let server = searchForServer(homeServer, serverName);
    if (server.parent) {
        gatherAncestry(homeServer, server.parent, flatArray);
    }
}