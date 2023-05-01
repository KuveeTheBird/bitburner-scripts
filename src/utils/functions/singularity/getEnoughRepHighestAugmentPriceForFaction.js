import {getUnboughtAugmentsFromFaction} from "/utils/functions/singularity/getUnboughtAugmentsFromFaction";

export function getEnoughRepHighestAugmentPriceForFaction(ns, factionName) {
    let unboughtAugmentsFromFaction = getUnboughtAugmentsFromFaction(ns, factionName);
    let singularity = ns.singularity;

    unboughtAugmentsFromFaction.sort(function (a, b) {
        return singularity.getAugmentationPrice(b) - singularity.getAugmentationPrice(a);
    });

    return singularity.getAugmentationPrice(unboughtAugmentsFromFaction[0]);
}