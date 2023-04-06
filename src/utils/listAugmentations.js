import {ALL_FACTIONS} from "/constants/Factions";
import {AUGMENTATION_NEUROFLUX_GOVERNOR} from "/constants/Singularity";

/** @param {import(".").NS } ns */
export async function main(ns) {
    let augmentations = [];
    let singularity = ns.singularity;

    for (let factionName of ALL_FACTIONS) {
        let augmentationsFromFaction = singularity.getAugmentationsFromFaction(factionName);
        for (let augmentation of augmentationsFromFaction) {
            if (augmentation === AUGMENTATION_NEUROFLUX_GOVERNOR) {
                continue;
            }
            let alreadyInstalled = ns.singularity.getOwnedAugmentations(false).includes(augmentation);
            let toBeInstalled = false;
            if (!alreadyInstalled && ns.singularity.getOwnedAugmentations(true).includes(augmentation)) {
                toBeInstalled = true;
            }

            let augmentationData = {
                name: augmentation,
                price: singularity.getAugmentationPrice(augmentation),
                alreadyInstalled: alreadyInstalled,
                toBeInstalled: toBeInstalled,
                fromFaction: factionName,
                repReq: singularity.getAugmentationRepReq(augmentation)
            };
            augmentations.push(augmentationData);
        }
    }

    augmentations.sort(function(a, b) {
        return a.price - b.price;
    });

    for (let augmentationData of augmentations) {
        let statusSign = augmentationData.alreadyInstalled || augmentationData.toBeInstalled ? '+' : '-';
        ns.tprintf('[%s] %s - Faction: [%s] - $%d - Rep: %d', statusSign, augmentationData.name, augmentationData.fromFaction, augmentationData.price, augmentationData.repReq);
    }
}