import {handleCodingContractReward} from "/utils/functions/handleCodingContractReward";

/** @param {NS} ns */
export async function main(ns) {
    let data = ns.codingcontract.getData(ns.args[1], ns.args[0]);
    let solution = factor(data);

    handleCodingContractReward(ns, solution, ns.args[1], ns.args[0]);
}

function factor(number) {
    for (let divisor = 2; divisor <= Math.sqrt(number); divisor++) {
        if (number % divisor != 0) {
            continue;
        }
        number = number / divisor;
        divisor = 2;
    }

    return number;
}