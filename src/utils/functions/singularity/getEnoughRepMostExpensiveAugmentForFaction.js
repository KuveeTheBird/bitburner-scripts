import {
    getUnboughtEnoughRepAugmentsFromFaction
} from "/utils/functions/singularity/getUnboughtEnoughRepAugmentsFromFaction";

export function getEnoughRepMostExpensiveAugmentForFaction(ns, factionName) {
    let unboughtAugmentsFromFaction = getUnboughtEnoughRepAugmentsFromFaction(ns, factionName);
    let singularity = ns.singularity;

    unboughtAugmentsFromFaction.sort(function (a, b) {
        return singularity.getAugmentationPrice(b) - singularity.getAugmentationPrice(a);
    });

    return unboughtAugmentsFromFaction[0];
}