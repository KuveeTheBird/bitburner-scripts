import {handleCodingContractReward} from "/utils/functions/handleCodingContractReward";

/** @param {NS} ns */
export async function main(ns) {
    const data = ns.codingcontract.getData(ns.args[1], ns.args[0]);
    const solution = getSolution(data);

    handleCodingContractReward(ns, solution, ns.args[1], ns.args[0]);
}

/**
 * @param {NS} ns
 * @param {CodingContractData} data
 */
function getSolution(data) {
    let shortestJump = Number.MAX_VALUE;
    shortestJump = jumps(data, 0, 1, shortestJump);

    if (shortestJump === Number.MAX_VALUE) {
        shortestJump = 0;
    }

    return shortestJump;
}

/**
 * @param {NS} ns
 * @param {CodingContractData} data
 * @param {number} index
 * @param {number} depth
 * @param {number} shortestJump
 */
function jumps(data, index, depth, shortestJump) {
    let number = data[index]; //3
    while (number > 0) {
        let newIndex = index + number; //4
        if (newIndex >= (data.length - 1)) {
            shortestJump = depth < shortestJump ? depth : shortestJump;
            return shortestJump;
        }
        shortestJump = jumps(data, newIndex, depth+1, shortestJump);
        number--;
    }

    return shortestJump;
}
