import {handleCodingContractReward} from "/utils/functions/handleCodingContractReward";
import {uniquePathsI} from "/utils/functions/coding_contracts/unique_paths_helpers";

/** @param {NS} ns */
export async function main(ns) {
    let data = ns.codingcontract.getData(ns.args[1], ns.args[0]);
    let solution = uniquePathsI(data);

    handleCodingContractReward(ns, solution, ns.args[1], ns.args[0]);
}

