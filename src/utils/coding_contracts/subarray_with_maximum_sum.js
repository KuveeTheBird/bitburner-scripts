import {handleCodingContractReward} from "/utils/functions/handleCodingContractReward";

/** @param {NS} ns */
export async function main(ns) {
    let data = ns.codingcontract.getData(ns.args[1], ns.args[0]);
    ns.tprint(ns.codingcontract.getDescription(ns.args[1], ns.args[0]));
    let solution = getSolution(data);
    ns.tprint(solution);
    handleCodingContractReward(ns, solution, ns.args[1], ns.args[0]);
}

function getSolution(data) {
    return maxSubArraySum(data, 0, data.length - 1);
}

function max(a,b,c) { return Math.max(Math.max(a, b), c); }

function maxCrossingSum(arr, l, m,h)
{
    let sum = 0;
    let left_sum = Number.MIN_VALUE;
    for (let i = m; i >= l; i--) {
        sum = sum + arr[i];
        if (sum > left_sum) {
            left_sum = sum;
        }
    }

    sum = 0;
    let right_sum = Number.MIN_VALUE;
    for (let i = m; i <= h; i++) {
        sum = sum + arr[i];
        if (sum > right_sum) {
            right_sum = sum;
        }
    }

    return max(left_sum + right_sum - arr[m], left_sum, right_sum);
}

function maxSubArraySum(arr, l,h)
{
    if (l > h) {
        return Number.MIN_VALUE;
    }

    if (l === h) {
        return arr[l];
    }

    let m = parseInt((l + h) / 2, 10);

    return max(
        maxSubArraySum(arr, l, m-1),
        maxSubArraySum(arr, m + 1, h),
        maxCrossingSum(arr, l, m, h)
    );
}