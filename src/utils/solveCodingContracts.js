import {findCodingContracts} from "/utils/functions/findCodingContracts";
import {CODING_CONTRACT_SOLVERS, CODING_CONTRACT_SOLVERS_BASEPATH} from "/constants/CodingContracts";

/** @param {NS} ns */
export async function main(ns) {
    // ns.codingcontract.createDummyContract('Total Ways to Sum');

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
    } else {
        ns.tprint(
            ns.sprintf(
                'No solver file found for: %s / %s - %s',
                serverName,
                filePath,
                cc.getContractType(filePath, serverName)
            )
        );
    }
}