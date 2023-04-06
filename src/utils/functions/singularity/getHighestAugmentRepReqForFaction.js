import {getUnboughtAugmentsFromFaction} from "/utils/functions/singularity/getUnboughtAugmentsFromFaction";

/**
 * @param {import(".").NS } ns
 * @param {string} factionName
 */
export function getHighestAugmentRepReqForFaction(ns, factionName) {
    let highestRepReq = 0;
    let unboughtAugmentsFromFaction = getUnboughtAugmentsFromFaction(ns, factionName);
    let singularity = ns.singularity;

    for (let augment of unboughtAugmentsFromFaction) {
        let augmentRepReq = singularity.getAugmentationRepReq(augment);
        if (augmentRepReq > highestRepReq) {
            highestRepReq = augmentRepReq;
        }
    }

    return highestRepReq;
}