import {getUnboughtAugmentsFromFaction} from "/utils/functions/singularity/getUnboughtAugmentsFromFaction";

/** @param {import(".").NS } ns
 * @param {string} factionName
 */
export function getUnboughtEnoughRepAugmentsFromFaction(ns, factionName) {
    let singularity = ns.singularity;
    let factionRep = singularity.getFactionRep(factionName)
    let unboughtAugments = getUnboughtAugmentsFromFaction(ns, factionName);
    let augments = [];

    for (let augment of unboughtAugments) {
        if (singularity.getAugmentationRepReq(augment) <= factionRep) {
            augments.push(augment);
        }
    }

    return augments;
}