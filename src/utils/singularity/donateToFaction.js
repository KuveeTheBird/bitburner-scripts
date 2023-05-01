import {getNextTargetFaction} from "/utils/functions/singularity/getNextTargetFaction";
import {getHighestAugmentRepReqForFaction} from "/utils/functions/singularity/getHighestAugmentRepReqForFaction";
import {FACTION_DONATE_MONEY_SAFETY_MARGIN} from "/constants/Singularity";

/** @param {import(".").NS } ns */
export async function main(ns) {
    let factionName = getNextTargetFaction(ns);
    if (factionName === false) {
        return;
    }
    let player = ns.getPlayer();
    let singularity = ns.singularity;
    let factionRepMult = player.mults.faction_rep;
    let highestAugmentRepReq = getHighestAugmentRepReqForFaction(ns, factionName);
    let factionRep = singularity.getFactionRep(factionName);

    if (!player.factions.includes(factionName)) {
        return;
    }

    if (singularity.getFactionFavor(factionName) >= ns.getFavorToDonate() && factionRep < highestAugmentRepReq) {
        let moneyToSafelyDonate = player.money / FACTION_DONATE_MONEY_SAFETY_MARGIN;
        let possibleRepGain = (moneyToSafelyDonate / 1e6) * factionRepMult;
        let missingRep = highestAugmentRepReq - factionRep;

        if (highestAugmentRepReq <= factionRep + possibleRepGain) {
            let moneyToDonate = missingRep / factionRepMult * 1e6;
            if (singularity.donateToFaction(factionName, moneyToDonate)) {
                ns.toast(ns.sprintf("Donating %d money to gain %d reputation!", moneyToDonate, missingRep));
            }
        }
    }
}