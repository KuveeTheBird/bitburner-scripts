// Total Ways to Sum
// Total Ways to Sum II

import {handleCodingContractReward} from "/utils/functions/handleCodingContractReward";

const cache = new Map();

/** @param {NS} ns */
export async function main(ns) {
    let data = ns.codingcontract.getData(ns.args[1], ns.args[0]);
    const solution = totalWaysToSum(ns, data[0], data[1]);

    handleCodingContractReward(ns, solution, ns.args[1], ns.args[0]);
}

function totalWaysToSum(ns, number, addends) {
    if (number < 0) return 0;
    if (number === 0) return 1;
    const cacheKey = JSON.stringify([number, addends]);
    if (cache.has(cacheKey)) return cache.get(cacheKey)

    let numSums = 0;
    for (let addend of addends) {
        const s = totalWaysToSum(ns, number - addend, addends.filter(a => a <= addend));
        numSums += s;
    }

    cache.set(cacheKey, numSums);
    return numSums;
}
