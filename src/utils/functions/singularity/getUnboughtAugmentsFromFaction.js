/** @param {import(".").NS } ns
 * @param {string} factionName
 */
export function getUnboughtAugmentsFromFaction(ns, factionName) {
    let ownedAugmentations = ns.singularity.getOwnedAugmentations(true);
    return ns.singularity.getAugmentationsFromFaction(factionName).filter(
        augmentation => !ownedAugmentations.includes(augmentation)
    );
}
