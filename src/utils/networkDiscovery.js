import {Server} from '/utils/data/Server.js';

/** @param {NS} ns */
export async function main(ns) {
    new Server(ns, 'home');
}