/**
 * @param {NS} ns
 * @param solution
 * @param {string} filePath
 * @param {string} serverName
 */
export function handleCodingContractReward(ns, solution, filePath, serverName) {
    let reward = ns.codingcontract.attempt(solution, filePath, serverName);

    if (reward.length) {
        ns.toast(
            ns.sprintf(
                'Successfullly finished coding contract for reward: %s',
                reward
            ),
            'success'
        );
    } else {
        ns.toast(
            ns.sprintf(
                'Failed to complete coding contract, remaining tries: %d',
                ns.codingcontract.getNumTriesRemaining(filePath, serverName)
            ),
            'danger'
        );
    }
}