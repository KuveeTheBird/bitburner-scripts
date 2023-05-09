/** @param {NS} ns */
export async function main(ns) {
    let data = ns.codingcontract.getData(ns.args[1], ns.args[0]);
    // ns.tprint(ns.codingcontract.getDescription(ns.args[1], ns.args[0]));
    let solution = getSolution(data);
    // ns.tprint(solution);
    // handleCodingContractReward(ns, solution, ns.args[1], ns.args[0]);
}

function getSolution(data) {
    return 0;
}