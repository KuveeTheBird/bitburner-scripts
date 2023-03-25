import {gatherAttackProcessData} from "/utils/functions/gatherAttackProcessData";
import AttackDataCollection from "/utils/data/Collections/AttackDataCollection";

/**
 *
 * @param {NS} ns
 * @param {BotnetServerCollection} botnetServerCollection
 * @return {AttackDataCollection}
 */
export function gatherAttackData(ns, botnetServerCollection) {
    let processes = gatherAttackProcessData(ns, botnetServerCollection);
    let attackDataCollection = new AttackDataCollection(ns);
    for (let process of processes) {
        attackDataCollection.addProcess(process);
    }

    return attackDataCollection;
}