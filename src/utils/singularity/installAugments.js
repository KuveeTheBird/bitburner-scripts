import {getNextTargetFaction} from "/utils/functions/singularity/getNextTargetFaction";
import {getHighestAugmentRepReqForFaction} from "/utils/functions/singularity/getHighestAugmentRepReqForFaction";
import {AUGMENTATION_NEUROFLUX_GOVERNOR, FACTION_FAVOR_GAIN_THRESHOLD, WORK_TYPE_FACTION} from "/constants/Singularity";
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
import {GANG_MIN_NUM_OF_AUGMENTS_TO_BUY} from "/settings/Settings";
import {TICK} from "/constants/BatchAttack";
import {getUnboughtAugmentsFromFaction} from "/utils/functions/singularity/getUnboughtAugmentsFromFaction";

/** @param {import(".").NS } ns */
export async function main(ns) {
    let singularity = ns.singularity;
    let factionName = getNextTargetFaction(ns);
    if (factionName === false) {
        await handleNfPurchasesAfterAllNormalAugsWerePurchased(ns);
        return;
    }

    let playerFactions = ns.getPlayer().factions;

    if (!playerFactions.includes(factionName)) {
        return;
    }

    if (ns.gang.inGang()) {
        handleGangAugmentationPurchases(ns);
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
            repThreshold *= ns.getBitNodeMultipliers().AugmentationRepCost;
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
    let factionRepMult = ns.getPlayer().mults.faction_rep;
    let singularity = ns.singularity;
    let targetFaction = getBestDonorableFaction(ns);

    if (!targetFaction) {
        return;
    }

    ns.toast(
        ns.sprintf('Targeting %s for faction donations.' , targetFaction)
    );

    while (true) {
        let missingRep = Math.max(0, singularity.getAugmentationRepReq(AUGMENTATION_NEUROFLUX_GOVERNOR) - singularity.getFactionRep(targetFaction));
        let nfPrice = singularity.getAugmentationPrice(AUGMENTATION_NEUROFLUX_GOVERNOR);
        let moneyToDonate = missingRep / factionRepMult * 1e6;
        let compositePrice = moneyToDonate + nfPrice;

        if (ns.getPlayer().money >= compositePrice) {
            if (moneyToDonate > 0) {
                singularity.donateToFaction(targetFaction, moneyToDonate);
            }
            if (!singularity.purchaseAugmentation(targetFaction, AUGMENTATION_NEUROFLUX_GOVERNOR)) {
                break;
            }
        } else {
            break;
        }
    }
}

/**
 * @param {NS} ns
 */
function handleGangAugmentationPurchases(ns) {
    let singularity = ns.singularity;
    let faction = ns.gang.getGangInformation().faction;
    let unboughtEnoughRepAugments = getUnboughtEnoughRepAugmentsFromFaction(ns, faction);
    let augments = [];

    let unboughtAugmentsFromFaction = getUnboughtAugmentsFromFaction(ns, faction);
    let numOfAugments = unboughtAugmentsFromFaction.length;
    let numOfAugmentsToCheck = GANG_MIN_NUM_OF_AUGMENTS_TO_BUY > numOfAugments ? numOfAugments : GANG_MIN_NUM_OF_AUGMENTS_TO_BUY;

    for (let augment of unboughtEnoughRepAugments) {
        let augmentationPrice = singularity.getAugmentationPrice(augment);
        augments.push(
            {
                'name': augment,
                'price': augmentationPrice,
            }
        );
    }

    let sortedAugments = augments.sort(function(a, b) {
        return b.price - a.price;
    });

    let purchasableAugments;

    while (sortedAugments.length >= numOfAugmentsToCheck) {
        let currentPurchasableAugments = canBuyGangAugments(ns, sortedAugments, numOfAugmentsToCheck);

        if (!currentPurchasableAugments) {
            break;
        }

        purchasableAugments = currentPurchasableAugments;
        numOfAugmentsToCheck++;
    }

    if (!purchasableAugments) {
        return;
    }

    for (let aug of purchasableAugments) {
        singularity.purchaseAugmentation(faction, aug.name);
    }

    handleAnyFactionDonateBuyNf(ns);
    singularity.installAugmentations(SCRIPT_PATH_INIT);
}

/**
 * @param {NS} ns
 * @param {string[]} augments
 * @param {number} numOfAugmentsToCheck
 */
function canBuyGangAugments(ns, augments, numOfAugmentsToCheck) {
    let money = ns.getPlayer().money;
    let targetAugmentPool = augments.slice(0, numOfAugmentsToCheck)
    let multiplier = 1;
    let multiplierIncrements = 1.9;

    targetAugmentPool.sort(function(a, b) {
        return b.price - a.price;
    });

    for (let augment of targetAugmentPool) {
        money -= augment.price * multiplier;
        multiplier *= multiplierIncrements;
    }

    if (money > 0) {
        return targetAugmentPool;
    }

    return false;
}

/**
 * @param {NS} ns
 */
async function handleNfPurchasesAfterAllNormalAugsWerePurchased(ns) {
    let singularity = ns.singularity;
    let currentWork = singularity.getCurrentWork();
    let favorToDonate = ns.getFavorToDonate();

    if (currentWork && currentWork.type === WORK_TYPE_FACTION) {
        let targetFaction = currentWork.factionName;

        let newFavor = singularity.getFactionFavorGain(targetFaction) + singularity.getFactionFavor(targetFaction);
        if (newFavor >= favorToDonate) {
            handleAnyFactionDonateBuyNf(ns);
            singularity.installAugmentations(SCRIPT_PATH_INIT);

            await ns.asleep(TICK);

            singularity.softReset(SCRIPT_PATH_INIT);
        }
        return;
    }

    let bestDonorableFaction = getBestDonorableFaction(ns);
    let ownedAugmentations = singularity.getOwnedAugmentations(false);
    let ownedAugmentationsWithCurrentPurchase = singularity.getOwnedAugmentations(true);

    while (buySingleNFFromAnyFaction(ns, bestDonorableFaction)) {}

    let ownedNf = ownedAugmentations.reduce((total,x) => (x ===AUGMENTATION_NEUROFLUX_GOVERNOR ? total+1 : total), 0)
    let allNf = ownedAugmentationsWithCurrentPurchase.reduce((total,x) => (x ===AUGMENTATION_NEUROFLUX_GOVERNOR ? total+1 : total), 0)

    if ((allNf - ownedNf) >= 10) {
        singularity.installAugmentations(SCRIPT_PATH_INIT);
    }
}

/**
 * @param {NS} ns
 */
function getBestDonorableFaction(ns) {
    let favorToDonate = ns.getFavorToDonate();
    let playerFactions = ns.getPlayer().factions;
    let singularity = ns.singularity;

    playerFactions = playerFactions.filter(function (faction) {
        let favorHighEnough = singularity.getFactionFavor(faction) >= favorToDonate;
        let gangFaction = ns.gang.inGang() ? ns.gang.getGangInformation().faction : false
        return favorHighEnough && gangFaction !== faction;
    }).sort(function(a, b) {
        return singularity.getFactionRep(b) - singularity.getFactionRep(a);
    });

    return playerFactions.length ? playerFactions[0] : false;
}

/**
 * @param {NS} ns
 * @param {string} targetFaction
 */
function buySingleNFFromAnyFaction(ns, targetFaction) {
    let singularity = ns.singularity;
    let factionRepMult = ns.getPlayer().mults.faction_rep;

    let missingRep = Math.max(0, singularity.getAugmentationRepReq(AUGMENTATION_NEUROFLUX_GOVERNOR) - singularity.getFactionRep(targetFaction));
    let nfPrice = singularity.getAugmentationPrice(AUGMENTATION_NEUROFLUX_GOVERNOR);
    let moneyToDonate = missingRep / factionRepMult * 1e6;
    let compositePrice = moneyToDonate + nfPrice;

    if (ns.getPlayer().money >= compositePrice) {
        if (moneyToDonate > 0) {
            singularity.donateToFaction(targetFaction, moneyToDonate);
        }
        if (singularity.purchaseAugmentation(targetFaction, AUGMENTATION_NEUROFLUX_GOVERNOR)) {
            return true;
        }
    }

    return false;
}