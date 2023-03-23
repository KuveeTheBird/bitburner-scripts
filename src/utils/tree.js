import {Server} from '/utils/data/Server.js';
import {SERVER_NAME_HOME} from "/constants/ServerNames";

/** @param {NS} ns */
export async function main(ns) {
    let args = ns.args;
    let homeServer = new Server(ns, SERVER_NAME_HOME);

    if (Array.isArray(args) && args.length) {
        if (args[0] === 'backdoor') {
            homeServer.tree('backdoor');
        }
    } else {
        homeServer.tree();
    }
}