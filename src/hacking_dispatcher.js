import {Server} from '/utils/data/Server.js';
import {SERVER_NAME_HOME} from "/constants/ServerNames";

/** @param {NS} ns */
export async function main(ns) {
    const fileName = 'eht.js';
    let target;

    const targets = [
        // 'netlink',
        // 'phantasy',
        // 'sigma-cosmetics',
        // 'joesguns',
        // 'foodnstuff',
        'n00dles',
    ];

    for (target of targets) {
        let targetServer = new Server(ns, target);
        if (targetServer.hackable && targetServer.canHaveMoney && targetServer.hasRootAccess) {
            break;
        }
    }

    const homeServer = new Server(ns, SERVER_NAME_HOME);
    const rootServers = homeServer.flatRootChildren;

    for (let rootServer of rootServers) {
        if (rootServer.name === SERVER_NAME_HOME) {
            continue;
        }

        if (rootServer.isFileRunning(fileName, target)) {
            continue;
        }

        let process = rootServer.isFileRunning(fileName);
        if (false !== process) {
            rootServer.kill(process);
        }

        rootServer.scp(fileName);
        rootServer.execWithMaxRam(fileName, target);
    }
}