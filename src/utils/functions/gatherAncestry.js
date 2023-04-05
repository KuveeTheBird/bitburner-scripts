import {searchForServer} from "/utils/functions/searchForServer";

/**
 * @param {Server} homeServer
 * @param {string} serverName
 * @param {string[]} flatArray
 */
export function gatherAncestry(homeServer, serverName, flatArray) {
    flatArray.unshift(serverName);
    let server = searchForServer(homeServer, serverName);
    if (server.parent) {
        gatherAncestry(homeServer, server.parent, flatArray);
    }
}