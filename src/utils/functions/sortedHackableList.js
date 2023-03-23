import {Server} from '/utils/data/Server.js';

/** @param {NS} ns */
export function getSortedHackableList(ns) {
    let homeServer = new Server(ns, 'home');
    let hackableChildren = homeServer.hackableChildren;
    let sortable = [];

    for (let i in hackableChildren) {
        let server = hackableChildren[i];
        sortable.push(server);
    }

    sortable.sort(function(a, b) {
        return b.value - a.value;
        // return b.viability - a.viability;
    });

    return sortable;
}