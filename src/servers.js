import {SERVER_NAME_HOME} from "/constants/ServerNames";

/** @param {NS} ns */
export async function main(ns) {
    const ram = 1024;
    let i = 0;
    while (i < ns.getPurchasedServerLimit()) {
        if (ns.getServerMoneyAvailable(SERVER_NAME_HOME) > ns.getPurchasedServerCost(ram)) {
            //let hostname = ns.purchaseServer("pserv-" + i, ram);
            ns.purchaseServer("pserv-" + i, ram);
            ++i;
            // ns.run('hacking_dispatcher.js');
        }
        await ns.sleep(1000);
    }
    ns.toast('All Servers purchased');
}