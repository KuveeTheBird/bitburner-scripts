/**
 * @param {NS} ns
 * @param solution
 * @param {string} filePath
 * @param {string} serverName
 */
export function handleCodingContractReward(ns, solution, filePath, serverName) {
    let reward = ns.codingcontract.attempt(solution, filePath, serverName);

    if (reward.length) {
        let successMessage = ns.sprintf(
            'Successfully finished coding contract for reward: %s',
            reward
        );
        ns.toast(successMessage, 'success');
        ns.tprint(successMessage);
    } else {
        let failureMessage = ns.sprintf(
            'Failed to complete coding contract, remaining tries: %d',
            ns.codingcontract.getNumTriesRemaining(filePath, serverName)
        );
        ns.toast(failureMessage, 'error');
        ns.tprint(failureMessage);
    }
}