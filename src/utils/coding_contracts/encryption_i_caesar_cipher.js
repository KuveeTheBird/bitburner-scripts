import {handleCodingContractReward} from "/utils/functions/handleCodingContractReward";
import {shiftLetterBy} from "/utils/functions/coding_contracts/shiftLetterBy";

/** @param {NS} ns */
export async function main(ns) {
    let data = ns.codingcontract.getData(ns.args[1], ns.args[0]);
    let solution = getSolution(data);

    handleCodingContractReward(ns, solution, ns.args[1], ns.args[0]);
}

function getSolution(data) {
    const charArray = data[0].split('');
    const keyDiff = -1 * data[1];

    let resultArray = [];

    for (let charToEncrypt of charArray) {
        if (charToEncrypt === ' ') {
            resultArray.push(charToEncrypt);
        } else {
            resultArray.push(shiftLetterBy(charToEncrypt, keyDiff));
        }
    }

    return resultArray.join('');
}

