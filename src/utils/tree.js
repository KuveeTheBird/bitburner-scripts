import {Server} from '/utils/data/Server.js';

/** @param {NS} ns */
export async function main(ns) {
    let args = ns.args;
    let homeServer = new Server(ns, 'home');

    if (Array.isArray(args) && args.length) {
        if (args[0] === 'backdoor') {
            homeServer.tree('backdoor');
        }
    } else {
        homeServer.tree();
    }
}