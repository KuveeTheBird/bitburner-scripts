/**
 *
 * @param {number} memoryCapacity
 * @param {number} memoryCost
 */
export function calculateThreadCount(memoryCapacity, memoryCost) {
    return Math.floor(memoryCapacity / memoryCost);
}