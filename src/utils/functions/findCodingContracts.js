import {Server} from "/utils/data/Server";
import {SERVER_NAME_HOME} from "/constants/ServerNames";

/**
 * @param {NS} ns
 */
export function findCodingContracts(ns) {
    let homeServer = new Server(ns, SERVER_NAME_HOME);
    let codingContracts = [];

    for (let server of homeServer.flatChildren) {
        let serverName = server.name;
        let files = ns.ls(serverName, '.cct');
        if (files.length) {
            for (let file of files) {
                codingContracts.push(
                    {
                        serverName: serverName,
                        filePath: file,
                    }
                );
            }
        }
    }

    return codingContracts;
}