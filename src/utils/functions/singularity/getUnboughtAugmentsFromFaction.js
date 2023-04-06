import {AUGMENTATION_NEUROFLUX_GOVERNOR} from "/constants/Singularity";

/** @param {import(".").NS } ns
 * @param {string} factionName
 */
export function getUnboughtAugmentsFromFaction(ns, factionName) {
    let ownedAugmentations = ns.singularity.getOwnedAugmentations(true);
    return ns.singularity.getAugmentationsFromFaction(factionName).filter(function (augmentation) {
        return !(ownedAugmentations.includes(augmentation)) && augmentation !== AUGMENTATION_NEUROFLUX_GOVERNOR;
    });
}
