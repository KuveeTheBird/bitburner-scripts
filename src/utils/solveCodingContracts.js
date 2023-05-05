import {findCodingContracts} from "/utils/functions/findCodingContracts";
import {CODING_CONTRACT_SOLVERS, CODING_CONTRACT_SOLVERS_BASEPATH} from "/constants/CodingContracts";

/** @param {NS} ns */
export async function main(ns) {
    let codingContracts = findCodingContracts(ns);

    for (let codingContract of codingContracts) {
        handleContract(ns, codingContract.serverName, codingContract.filePath);
    }
}

function handleContract(ns, serverName, filePath) {
    let cc = ns.codingcontract;
    let contractType = cc.getContractType(filePath, serverName);

    if (Object.keys(CODING_CONTRACT_SOLVERS).includes(contractType)) {
        let fileToRun = CODING_CONTRACT_SOLVERS_BASEPATH + CODING_CONTRACT_SOLVERS[contractType];
        ns.run(fileToRun, 1, serverName, filePath);
    }
}