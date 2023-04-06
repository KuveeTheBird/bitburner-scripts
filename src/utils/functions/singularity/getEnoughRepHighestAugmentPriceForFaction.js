import {getUnboughtAugmentsFromFaction} from "/utils/functions/singularity/getUnboughtAugmentsFromFaction";

export function getEnoughRepHighestAugmentPriceForFaction(ns, factionName) {
    let unboughtAugmentsFromFaction = getUnboughtAugmentsFromFaction(ns, factionName);
    let singularity = ns.singularity;

    unboughtAugmentsFromFaction.sort(function (a, b) {
        return singularity.getAugmentationPrice(a) - singularity.getAugmentationPrice(b);
    });

    return singularity.getAugmentationPrice(unboughtAugmentsFromFaction[0]);
}