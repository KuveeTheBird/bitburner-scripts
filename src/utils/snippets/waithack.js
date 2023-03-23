/** @param {NS} ns */
export async function main(ns) {
    // let currentHostname = ns.getHostname();
    // ns.tprintf('%s - %s - WAIT(GROW) - %s', Date.now().toString(), currentHostname, ns.args[0]);
    await ns.asleep(ns.args[1]);
    let targetHostname = ns.args[0];
    // let serverSecurityLevel = ns.getServerSecurityLevel(targetHostname);
    // let serverMoneyAvailable = ns.getServerMoneyAvailable(targetHostname);
    // let time = ns.getHackTime(targetHostname);
    // if (serverSecurityLevel > 1) {
    //     ns.tprintf('%s - %s - HACK - %s. S: %s M: %s T: %s', Date.now().toString(), currentHostname, targetHostname, serverSecurityLevel, serverMoneyAvailable, time);
    // }
    await ns.hack(targetHostname);

    // serverSecurityLevel = ns.getServerSecurityLevel(targetHostname);
    // serverMoneyAvailable = ns.getServerMoneyAvailable(targetHostname);
    // time = ns.getHackTime(targetHostname);
    // ns.tprintf('%s - %s - HACK FINISHED - %s. S: %s M: %s T: %s', Date.now().toString(), currentHostname, targetHostname, serverSecurityLevel, serverMoneyAvailable, time);
}