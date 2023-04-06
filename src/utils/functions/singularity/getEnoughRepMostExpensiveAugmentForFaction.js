import {getUnboughtAugmentsFromFaction} from "/utils/functions/singularity/getUnboughtAugmentsFromFaction";

export function getEnoughRepMostExpensiveAugmentForFaction(ns, factionName) {
    let unboughtAugmentsFromFaction = getUnboughtAugmentsFromFaction(ns, factionName);
    let singularity = ns.singularity;

    unboughtAugmentsFromFaction.sort(function (a, b) {
        return singularity.getAugmentationPrice(a) - singularity.getAugmentationPrice(b);
    });

    return unboughtAugmentsFromFaction[0];
}