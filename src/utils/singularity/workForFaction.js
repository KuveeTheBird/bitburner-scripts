import {WORK_TYPE_CLASS, WORK_TYPE_FACTION} from "/constants/Singularity";
import {getNextTargetFaction} from "/utils/functions/singularity/getNextTargetFaction";
import {getHighestAugmentRepReqForFaction} from "/utils/functions/singularity/getHighestAugmentRepReqForFaction";

/** @param {import(".").NS } ns */
export async function main(ns) {
    let player = ns.getPlayer();
    let singularity = ns.singularity;
    let currentWork = singularity.getCurrentWork();
    let targetFaction = getNextTargetFaction(ns);
    let playerFactions = player.factions;

    if (
        (
            currentWork
            && (currentWork.type === WORK_TYPE_CLASS)
        )
        || !(playerFactions.includes(targetFaction))
    ) {
        return;
    }

    if (singularity.getFactionRep(targetFaction) > getHighestAugmentRepReqForFaction(ns, targetFaction)) {
        if (currentWork.type === WORK_TYPE_FACTION) {
            singularity.stopAction();
        }
        return;
    } else if (currentWork.type === WORK_TYPE_FACTION) {
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
        if (singularity.workForFaction(targetFaction, factionWork.type)) {
            break;
        }
    }
}