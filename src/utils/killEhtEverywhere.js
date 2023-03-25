import {gatherBotnetServers} from "/utils/functions/gatherBotnetServers";
import {gatherScriptProcessData} from "/utils/functions/gatherScriptProcessData";
import {SCRIPT_PATH_EARLY_HACK_TEMPLATE} from "/constants/FileNames";

/** @param {NS} ns */
export async function main(ns) {
    let botnetServerCollection = gatherBotnetServers(ns);
    let processData = gatherScriptProcessData(ns, botnetServerCollection, SCRIPT_PATH_EARLY_HACK_TEMPLATE);

    for (let process of processData) {
        process.kill();
    }
}