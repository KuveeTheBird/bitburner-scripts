import {getNextTargetFaction} from "/utils/functions/singularity/getNextTargetFaction";
import {getHighestAugmentRepReqForFaction} from "/utils/functions/singularity/getHighestAugmentRepReqForFaction";
import {AUGMENTATION_NEUROFLUX_GOVERNOR, FACTION_FAVOR_GAIN_THRESHOLD} from "/constants/Singularity";
import {FACTIONS_REP_THRESHOLDS} from "/constants/Factions";
import {getLowestRepReqOfUnboughtAugments} from "/utils/functions/singularity/getLowestRepReqOfUnboughtAugments";
import {
    getEnoughRepHighestAugmentPriceForFaction
} from "/utils/functions/singularity/getEnoughRepHighestAugmentPriceForFaction";
import {
    getEnoughRepMostExpensiveAugmentForFaction
} from "/utils/functions/singularity/getEnoughRepMostExpensiveAugmentForFaction";
import {
    getUnboughtEnoughRepAugmentsFromFaction
} from "/utils/functions/singularity/getUnboughtEnoughRepAugmentsFromFaction";
import {SCRIPT_PATH_INIT} from "/constants/FileNames";

/** @param {import(".").NS } ns */
export async function main(ns) {
    let singularity = ns.singularity;
    let factionName = getNextTargetFaction(ns);
    if (factionName === false) {
        return;
    }

    let playerFactions = ns.getPlayer().factions;

    if (!playerFactions.includes(factionName)) {
        return;
    }

    if (isReadyToInstall(ns, factionName)) {
        while (true) {
            await ns.asleep(1);
            let unboughtAugments = getUnboughtEnoughRepAugmentsFromFaction(ns, factionName);
            if (unboughtAugments.length === 0) {
                break;
            }

            if (ns.getPlayer().money < getEnoughRepHighestAugmentPriceForFaction(ns, factionName)) {
                return;
            }

            let nextAug = getEnoughRepMostExpensiveAugmentForFaction(ns, factionName);
            let augmentationPrerequisites = singularity.getAugmentationPrereq(nextAug);

            if (augmentationPrerequisites.length) {
                for (let augmentationPrerequisite of augmentationPrerequisites) {
                    if (singularity.getOwnedAugmentations(true).includes(augmentationPrerequisite)) {
                        continue;
                    }

                    if (!singularity.purchaseAugmentation(factionName, augmentationPrerequisite)) {
                        return;
                    }
                }
            }

            await ns.asleep(1);

            if (singularity.purchaseAugmentation(factionName, nextAug)) {
                ns.toast('Bought augmentation: ' + nextAug);
                ns.tprintf('Bought augmentation: %s', nextAug);
            } else {
                ns.toast('Error buying augmentation: ' + nextAug, "error");
                return;
            }
        }

        let numberOfNf = buyMaxNumberOfNf(ns, factionName);

        handleAnyFactionDonateBuyNf(ns);

        if (
            singularity.getOwnedAugmentations(true).length > singularity.getOwnedAugmentations(false).length
            || numberOfNf > 0
        ) {
            singularity.installAugmentations(SCRIPT_PATH_INIT);
        } else {
            singularity.softReset(SCRIPT_PATH_INIT);
        }
    }
}

/** @param {import(".").NS } ns
 * @param {string} factionName
 */
function isReadyToInstall(
    ns,
    factionName,
) {
    let singularity = ns.singularity;
    let favorToDonate = ns.getFavorToDonate();
    let factionRep = singularity.getFactionRep(factionName);
    let highestAugmentRepReq = getHighestAugmentRepReqForFaction(ns, factionName);
    let factionFavorGain = singularity.getFactionFavorGain(factionName);
    let factionFavor = singularity.getFactionFavor(factionName);
    let factionFavorAfterInstallation = factionFavorGain + factionFavor;

    if (
        highestAugmentRepReq <= factionRep
        || factionFavorGain >= FACTION_FAVOR_GAIN_THRESHOLD
        || (
            factionFavor < favorToDonate
            && factionFavorAfterInstallation >= favorToDonate
        )
    ) {
        return true
    }



    if (factionName in FACTIONS_REP_THRESHOLDS) {
        let lowestRepReq = getLowestRepReqOfUnboughtAugments(ns, factionName);
        let repThresholds = FACTIONS_REP_THRESHOLDS[factionName];
        for (let repThreshold of repThresholds) {
            if (repThreshold < lowestRepReq) {
                continue;
            }

            if (factionRep >= repThreshold) {
                return true
            }
            break;
        }
    }

    return false;
}

/**
 * @param {NS} ns
 * @param {string} factionName
 */
function buyMaxNumberOfNf(ns, factionName) {
    let numberOfNf = 0;
    while(ns.singularity.purchaseAugmentation(factionName, AUGMENTATION_NEUROFLUX_GOVERNOR)){
        numberOfNf++;
    }
    if (numberOfNf > 0) {
        ns.toast(ns.sprintf("Bought %d levels of %s", numberOfNf, AUGMENTATION_NEUROFLUX_GOVERNOR));
    }
    return numberOfNf;
}

/**
 * @param {NS} ns
 */
function handleAnyFactionDonateBuyNf(ns) {
    let playerMoney = ns.getPlayer().money;
    let favorToDonate = ns.getFavorToDonate();
    let playerFactions = ns.getPlayer().factions;
    let factionRepMult = ns.getPlayer().mults.faction_rep;
    let singularity = ns.singularity;

    playerFactions.filter(function (faction) {
        return singularity.getFactionFavor(faction) >= favorToDonate;
    }).sort(function(a, b) {
        return singularity.getFactionRep(a) - singularity.getFactionRep(b);
    });

    let targetFaction = playerFactions[0];
    let targetFactionRep = singularity.getFactionRep(targetFaction);
    if (!targetFaction) {
        return;
    }

    ns.toast(
        ns.sprintf('Targeting %s for faction donations.' , targetFaction)
    );


    while (true) {
        let missingRep = Math.max(0, singularity.getAugmentationRepReq(AUGMENTATION_NEUROFLUX_GOVERNOR) - targetFactionRep);
        let nfPrice = singularity.getAugmentationPrice(AUGMENTATION_NEUROFLUX_GOVERNOR);
        let moneyToDonate = missingRep / factionRepMult * 1e6;
        let compositePrice = moneyToDonate + nfPrice;

        if (playerMoney >= compositePrice) {
            playerMoney -= compositePrice;
            if (moneyToDonate > 0) {
                singularity.donateToFaction(targetFaction, moneyToDonate);
            }
            singularity.purchaseAugmentation(targetFaction, AUGMENTATION_NEUROFLUX_GOVERNOR);
            ns.toast("Buy a level of NF from " + targetFaction + " for " + compositePrice);
        }
        else {
            break;
        }
    }
}