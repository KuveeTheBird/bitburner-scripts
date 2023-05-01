import {getNextTargetFaction} from "/utils/functions/singularity/getNextTargetFaction";
import {FACTIONS_CITY_REQUIREMENTS} from "/constants/Factions";
import {WORK_TYPE_CLASS} from "/constants/Singularity";

/** @param {import(".").NS } ns */
export async function main(ns) {
    let player = ns.getPlayer();
    let singularity = ns.singularity;
    let currentWork = singularity.getCurrentWork();

    if (currentWork && currentWork.type === WORK_TYPE_CLASS) {
        return;
    }

    let targetFaction = getNextTargetFaction(ns);
    if (targetFaction === false) {
        return;
    }

    if (player.factions.includes(targetFaction)) {
        return;
    }

    if (!(Object.keys(FACTIONS_CITY_REQUIREMENTS).includes(targetFaction))) {
        return
    }
    let targetCity = FACTIONS_CITY_REQUIREMENTS[targetFaction];

    let currentCity = player.city;
    if (currentCity.toLowerCase() !== targetCity.toLowerCase() && player.money >= 200000) {
        let toastMessage = ns.sprintf('Traveling to %s (currently: %s) for faction %s', targetCity, currentCity, targetFaction);
        ns.toast(toastMessage, 'info');
        singularity.travelToCity(targetCity);
    }
}