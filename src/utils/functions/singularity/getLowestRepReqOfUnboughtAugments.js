import {getUnboughtAugmentsFromFaction} from "/utils/functions/singularity/getUnboughtAugmentsFromFaction";

/** @param {import(".").NS } ns
 * @param {string} factionName
 */
export function getLowestRepReqOfUnboughtAugments(ns, factionName) {
    let unboughtAugmentsFromFaction = getUnboughtAugmentsFromFaction(ns, factionName);
    let singularity = ns.singularity;

    unboughtAugmentsFromFaction.sort(function (a, b) {
        return singularity.getAugmentationRepReq(a) - singularity.getAugmentationRepReq(b);
    });

    return singularity.getAugmentationRepReq(unboughtAugmentsFromFaction[0]);
}