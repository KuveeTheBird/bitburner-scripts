import {handleCodingContractReward} from "/utils/functions/handleCodingContractReward";

/** @param {NS} ns */
export async function main(ns) {
    let data = ns.codingcontract.getData(ns.args[1], ns.args[0]);
    let solution = mergeOverlap(data);

    handleCodingContractReward(ns, solution, ns.args[1], ns.args[0]);
}

function mergeOverlap(intervals) {
    intervals.sort(([minA], [minB]) => minA - minB);
    for (let i = 0; i < intervals.length; i++) {
        for (let j = i + 1; j < intervals.length; j++) {
            const [min, max] = intervals[i];
            const [laterMin, laterMax] = intervals[j];
            if (laterMin <= max) {
                const newMax = laterMax > max ? laterMax : max;
                intervals[i] = [min, newMax];
                intervals.splice(j, 1);
                j = i;
            }
        }
    }
    return intervals;
}