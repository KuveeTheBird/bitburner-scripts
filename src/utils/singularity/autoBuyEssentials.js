import {STANDARD_PROGRAMS} from "/constants/FileNames";

/** @param {import(".").NS } ns */
export async function main(ns) {
    if (ns.singularity.purchaseTor()) {
        for (let programName of STANDARD_PROGRAMS) {
            ns.singularity.purchaseProgram(programName);
        }
    }

    while (ns.singularity.upgradeHomeRam()) {
        ns.toast("Home RAM has been upgraded!")
    }
}
