import {handleCodingContractReward} from "/utils/functions/handleCodingContractReward";

/** @param {NS} ns */
export async function main(ns) {
    let data = ns.codingcontract.getData(ns.args[1], ns.args[0]);
    let solution = getSolution(data);

    handleCodingContractReward(ns, solution, ns.args[1], ns.args[0]);
}

function getSolution(data) {
    var cache = {};
    var n = data;
    return totalWaysToSum(n, n, cache) - 1;
}

function totalWaysToSum(limit, n, cache) {
    if (n < 1) {
        return 1;
    }
    if (limit === 1) {
        return 1;
    }
    if (n < limit) {
        return totalWaysToSum(n, n, cache);
    }
    if (n in cache) {
        const c = cache[n];
        if (limit in c) {
            return c[limit];
        }
    }
    let s = 0;
    for (let i = 1; i <= limit; i++) {
        s+=totalWaysToSum(i, n-i, cache);
    }
    if (!(n in cache)) {
        cache[n] = {};
    }
    cache[n][limit] = s;
    return s;
}
