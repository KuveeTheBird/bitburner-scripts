import {FACTIONS_DONT_AUTO_JOIN} from "/constants/Factions";
import {getUnboughtAugmentsFromFaction} from "/utils/functions/singularity/getUnboughtAugmentsFromFaction";

/** @param {import(".").NS } ns */
export async function main(ns) {
    let factionsToJoin = ns.singularity.checkFactionInvitations();
    for (let i = 0 ; i < factionsToJoin.length ; i++) {
        let faction = factionsToJoin[i];

        if (!FACTIONS_DONT_AUTO_JOIN.includes(faction) || getUnboughtAugmentsFromFaction(ns, faction).length) {
            ns.singularity.joinFaction(faction)
            ns.toast("Joined faction: " + faction);
        }
    }
}
