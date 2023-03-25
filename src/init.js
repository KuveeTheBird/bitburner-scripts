import {SERVER_NAME_HOME, SERVER_NAME_N00DLES} from "/constants/ServerNames";
import {
    SCRIPT_PATH_BATCH_HACKING_MANAGER,
    SCRIPT_PATH_EARLY_HACK_TEMPLATE,
    SCRIPT_PATH_KILL_EHT_EVERYWHERE,
    SCRIPT_PATH_NETWORK_DISCOVERY
} from '/constants/FileNames'
import {TICK} from "/constants/BatchAttack";

/** @param {NS} ns */
export async function main(ns) {
    let homeServerRam = ns.getServerMaxRam(SERVER_NAME_HOME);
    let previousHomeServerRam = homeServerRam;

    while (true) {
        ns.print('------------------------------');
        homeServerRam = ns.getServerMaxRam(SERVER_NAME_HOME);

        ns.exec(SCRIPT_PATH_NETWORK_DISCOVERY, SERVER_NAME_HOME);
        await ns.asleep(TICK);
        // ns.exec(SCRIPT_PATH_PURCHASED_SERVER_MANAGER, SERVER_NAME_HOME);
        // await ns.asleep(TICK);

        if (homeServerRam < 128) {
            ns.exec('hacking_dispatcher.js', SERVER_NAME_HOME);

            if (homeServerRam !== previousHomeServerRam && ns.isRunning(SCRIPT_PATH_EARLY_HACK_TEMPLATE, SERVER_NAME_HOME, SERVER_NAME_N00DLES)) {
                ns.scriptKill(SCRIPT_PATH_EARLY_HACK_TEMPLATE, SERVER_NAME_HOME);
            }

            if (!ns.isRunning(SCRIPT_PATH_EARLY_HACK_TEMPLATE, SERVER_NAME_HOME)) {
                if (ns.getServerMaxRam(SERVER_NAME_HOME) === 32) {
                    if (!ns.isRunning(SCRIPT_PATH_EARLY_HACK_TEMPLATE, SERVER_NAME_HOME, SERVER_NAME_N00DLES)) {
                        ns.exec(SCRIPT_PATH_EARLY_HACK_TEMPLATE, SERVER_NAME_HOME, 6, SERVER_NAME_N00DLES);
                    }
                } else {
                    if (!ns.isRunning(SCRIPT_PATH_EARLY_HACK_TEMPLATE, SERVER_NAME_HOME, SERVER_NAME_N00DLES)) {
                        ns.exec(SCRIPT_PATH_EARLY_HACK_TEMPLATE, SERVER_NAME_HOME, 18, SERVER_NAME_N00DLES);
                    }
                }
            }
        } else {
            if (ns.isRunning(SCRIPT_PATH_EARLY_HACK_TEMPLATE, SERVER_NAME_HOME, SERVER_NAME_N00DLES)) {
                ns.exec(SCRIPT_PATH_KILL_EHT_EVERYWHERE, SERVER_NAME_HOME);
            }

            if (!ns.isRunning(SCRIPT_PATH_BATCH_HACKING_MANAGER, SERVER_NAME_HOME)) {
                ns.exec(SCRIPT_PATH_BATCH_HACKING_MANAGER, SERVER_NAME_HOME);
            }
        }

        previousHomeServerRam = homeServerRam;
        await ns.asleep(1000);
    }
}