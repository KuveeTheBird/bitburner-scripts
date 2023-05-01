import {AUGMENTATION_NEUROFLUX_GOVERNOR} from "/constants/Singularity";
import {FACTIONS_IGNORED_AUGMENTS} from "/constants/Factions";

/** @param {import(".").NS } ns
 * @param {string} factionName
 */
export function getUnboughtAugmentsFromFaction(ns, factionName) {
    let ownedAugmentations = ns.singularity.getOwnedAugmentations(true);
    let ignoredAugments = [];
    if (Object.keys(FACTIONS_IGNORED_AUGMENTS).includes(factionName)) {
        ignoredAugments = FACTIONS_IGNORED_AUGMENTS[factionName];
    }
    return ns.singularity.getAugmentationsFromFaction(factionName).filter(function (augmentation) {
        return !(ownedAugmentations.includes(augmentation))
            && augmentation !== AUGMENTATION_NEUROFLUX_GOVERNOR
            && !(ignoredAugments.includes(augmentation));
    });
}
