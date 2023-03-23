import {Server} from '/utils/data/Server.js';
import {SERVER_NAME_HOME} from "/constants/ServerNames";

/** @param {NS} ns */
export async function main(ns) {
    new Server(ns, SERVER_NAME_HOME);
}