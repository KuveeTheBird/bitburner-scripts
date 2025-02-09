import {handleCodingContractReward} from "/utils/functions/handleCodingContractReward";
import {shiftLetterBy} from "/utils/functions/coding_contracts/shiftLetterBy";

/** @param {NS} ns */
export async function main(ns) {
    let data = ns.codingcontract.getData(ns.args[1], ns.args[0]);
    let solution = getSolution(data);

    handleCodingContractReward(ns, solution, ns.args[1], ns.args[0]);
}

function getSolution(data) {
    const codeOfA = 65;
    const charArray = data[0].split('');
    const keyArray = data[1].split('');
    const keyLength = keyArray.length;

    let resultArray = [];

    for (let charPosition = 0; charPosition < charArray.length; charPosition++) {
        let charToEncrypt = charArray[charPosition];
        let keyPosition = charPosition;
        while (keyPosition >= keyLength) {
            keyPosition -= keyLength;
        }
        let keyChar = keyArray[keyPosition];
        let keyDiff = keyChar.charCodeAt(0) - codeOfA;


        resultArray.push(shiftLetterBy(charToEncrypt, keyDiff));
    }

    return resultArray.join('');
}

