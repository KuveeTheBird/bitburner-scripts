import {WORK_TYPE_CLASS, WORK_TYPE_FACTION} from "/constants/Singularity";
import {getNextTargetFaction} from "/utils/functions/singularity/getNextTargetFaction";
import {getHighestAugmentRepReqForFaction} from "/utils/functions/singularity/getHighestAugmentRepReqForFaction";

/** @param {import(".").NS } ns */
export async function main(ns) {
    let player = ns.getPlayer();
    let singularity = ns.singularity;
    let currentWork = singularity.getCurrentWork();
    let targetFaction = getNextTargetFaction(ns);
    if (targetFaction === false) {
        tryToAchieveFavorToDonate(ns);
        return;
    }
    let playerFactions = player.factions;

    if (
        (
            currentWork
            && (currentWork.type === WORK_TYPE_CLASS)
        )
        || !(playerFactions.includes(targetFaction))
        || ns.gang.inGang()
    ) {
        return;
    }

    if (singularity.getFactionRep(targetFaction) > getHighestAugmentRepReqForFaction(ns, targetFaction)) {
        if (currentWork && currentWork.type === WORK_TYPE_FACTION) {
            singularity.stopAction();
        }
        return;
    }

    workForFaction(ns, targetFaction);

}

/** @param {import(".").NS } ns */
function tryToAchieveFavorToDonate(ns) {
    let player = ns.getPlayer();
    let singularity = ns.singularity;
    let playerFactions = player.factions;
    let gangFaction = ns.gang.inGang() ? ns.gang.getGangInformation().faction : false
    let highestFactionFavor = -1;
    let factionWithHighestFavor;

    if (!playerFactions.length) {
        return;
    }

    for (let faction of playerFactions) {
        if (faction === gangFaction) {
            continue;
        }

        let factionFavor = singularity.getFactionFavor(faction);
        if (factionFavor > highestFactionFavor) {
            highestFactionFavor = factionFavor;
            factionWithHighestFavor = faction;
        }
    }

    if (highestFactionFavor >= ns.getFavorToDonate() || !factionWithHighestFavor) {
        return;
    }

    workForFaction(ns, factionWithHighestFavor);
}

/**
 * @param {import(".").NS } ns
 * @param {string} faction
 */
function workForFaction(ns, faction) {
    let player = ns.getPlayer();
    let singularity = ns.singularity;
    let currentWork = singularity.getCurrentWork();

    if (currentWork && currentWork.type === WORK_TYPE_FACTION && currentWork.factionName === faction) {
        return;
    }


    let hackStats = player.skills.hacking;
    let securityStats = (player.skills.strength + player.skills.agility + player.skills.defense + player.skills.dexterity) / 4
    let fieldStats = (player.skills.hacking + player.skills.strength + player.skills.agility + player.skills.defense + player.skills.dexterity + player.skills.charisma) / 6
    let factionWorks = [
        {
            type: 'hacking',
            stat: hackStats,
        },
        {
            type: 'field',
            stat: fieldStats,
        },
        {
            type: 'security',
            stat: securityStats,
        }
    ];
    factionWorks.sort(function (a, b) {
        return b.stat - a.stat;
    });

    for (let factionWork of factionWorks) {
        if (singularity.workForFaction(faction, factionWork.type)) {
            break;
        }
    }
}