import {handleCodingContractReward} from "/utils/functions/handleCodingContractReward";
import {maxProfit} from "/utils/functions/coding_contracts/max_profit";

/** @param {NS} ns */
export async function main(ns) {
    let data = ns.codingcontract.getData(ns.args[1], ns.args[0]);
    let solution = maxProfit([Math.ceil(data.length / 2), data]);

    handleCodingContractReward(ns, solution, ns.args[1], ns.args[0]);
}