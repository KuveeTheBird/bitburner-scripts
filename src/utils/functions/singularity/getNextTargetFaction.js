import {FACTION_NAME_ILLUMINATI, FACTIONS_PREFERRED_ORDER} from "/constants/Factions";
import {getUnboughtAugmentsFromFaction} from "/utils/functions/singularity/getUnboughtAugmentsFromFaction";

/** @param {import(".").NS } ns
 * @param {string} factionName
 */
export function getNextTargetFaction(ns) {
    for (let factionName of FACTIONS_PREFERRED_ORDER) {
        if (getUnboughtAugmentsFromFaction(ns, factionName) > 0) {
            return factionName;
        }
    }

    return FACTION_NAME_ILLUMINATI;
}
