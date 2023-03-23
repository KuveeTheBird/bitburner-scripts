import {getSortedHackableList} from '/utils/functions/sortedHackableList.js';

/** @param {NS} ns */
export async function main(ns) {
    let sortable = getSortedHackableList(ns);

    for (let i in sortable) {
        let server = sortable[i];
        ns.tprintf('Name: %s', server.name);
        ns.tprintf('MaxMoney: %s', server.maxMoney);
        ns.tprintf('Viability: %s', server.viability);
        ns.tprintf('Value: %s', server.value);
        ns.tprint('----------------');
    }
}