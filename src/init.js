import {SERVER_NAME_HOME, SERVER_NAME_N00DLES} from "/constants/ServerNames";
import {
    SCRIPT_PATH_BATCH_HACKING_MANAGER,
    SCRIPT_PATH_EARLY_HACK_TEMPLATE,
    SCRIPT_PATH_KILL_EHT_EVERYWHERE,
    SCRIPT_PATH_NETWORK_DISCOVERY,
    SCRIPT_PATH_SINGULARITY_AUTO_BUY_ESSENTIALS,
    SCRIPT_PATH_SINGULARITY_AUTO_JOIN_FACTIONS,
    SCRIPT_PATH_SINGULARITY_HANDLE_BACKDOORS
} from '/constants/FileNames'
import {TICK} from "/constants/BatchAttack";

/** @param {NS} ns */
export async function main(ns) {
    let homeServerRam;

    while (true) {
        ns.print('------------------------------');
        homeServerRam = ns.getServerMaxRam(SERVER_NAME_HOME);

        ns.exec(SCRIPT_PATH_NETWORK_DISCOVERY, SERVER_NAME_HOME);
        await ns.asleep(TICK);

        await initSingularityFunctions(ns);

        if (homeServerRam <= 128) {
            ns.exec('hacking_dispatcher.js', SERVER_NAME_HOME);
        } else {
            if (ns.isRunning(SCRIPT_PATH_EARLY_HACK_TEMPLATE, SERVER_NAME_HOME, SERVER_NAME_N00DLES)) {
                ns.exec(SCRIPT_PATH_KILL_EHT_EVERYWHERE, SERVER_NAME_HOME);
            }

            if (!ns.isRunning(SCRIPT_PATH_BATCH_HACKING_MANAGER, SERVER_NAME_HOME)) {
                ns.exec(SCRIPT_PATH_BATCH_HACKING_MANAGER, SERVER_NAME_HOME);
            }
        }
        await ns.asleep(1000);
    }
}

/** @param {NS} ns */
async function initSingularityFunctions(ns) {
    ns.exec(SCRIPT_PATH_SINGULARITY_AUTO_JOIN_FACTIONS, SERVER_NAME_HOME);
    await ns.asleep(TICK);

    ns.exec(SCRIPT_PATH_SINGULARITY_HANDLE_BACKDOORS, SERVER_NAME_HOME);
    await ns.asleep(TICK);

    ns.exec(SCRIPT_PATH_SINGULARITY_AUTO_BUY_ESSENTIALS, SERVER_NAME_HOME);
    await ns.asleep(TICK);
}