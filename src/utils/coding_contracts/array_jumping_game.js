import {handleCodingContractReward} from "/utils/functions/handleCodingContractReward";

/** @param {NS} ns */
export async function main(ns) {
    const data = ns.codingcontract.getData(ns.args[1], ns.args[0]);
    const solution = getSolution(ns, data, 0);

    handleCodingContractReward(ns, solution, ns.args[1], ns.args[0]);
}

/**
 * @param {NS} ns
 * @param {CodingContractData} data
 * @param {number} index
 */
function getSolution(ns, data, index) {
    let number = data[index];
    while (number > 0) {
        let newIndex = index + number;
        if (newIndex >= (data.length - 1)) {
            return 1;
        }

        let newNumber = data[newIndex];
        if (newNumber > 0) {
            ns.tprintf('Go: %d:%d', newIndex, newNumber);
            if (getSolution(ns, data, newIndex)) {
                return 1;
            } else {
                number--;
            }
        } else {
            ns.tprintf('No go: %d:%d', newIndex, newNumber);
            number--;
        }
    }

    return 0
}
