import {getNextTargetFaction} from "/utils/functions/singularity/getNextTargetFaction";
import {FACTIONS_COMPANY_REQUIREMENTS} from "/constants/Factions";
import {WORK_TYPE_CLASS, WORK_TYPE_COMPANY, WORK_TYPE_FACTION} from "/constants/Singularity";

/** @param {import(".").NS } ns */
export async function main(ns) {
    let singularity = ns.singularity;
    let nextTarget = getNextTargetFaction(ns);

    if (nextTarget === false || ns.getPlayer().factions.includes(nextTarget)) {
        return;
    }

    let currentWork = singularity.getCurrentWork();
    let dontInterrupt = [
        WORK_TYPE_CLASS,
        WORK_TYPE_FACTION,
    ];

    if (currentWork && dontInterrupt.includes(currentWork.type)) {
        return;
    } if (!Object.keys(FACTIONS_COMPANY_REQUIREMENTS).includes(nextTarget)) {
        return;
    }

    let company = FACTIONS_COMPANY_REQUIREMENTS[nextTarget];




    singularity.applyToCompany(company, 'software');

    if (currentWork && currentWork.type === WORK_TYPE_COMPANY && currentWork.companyName === company) {
        if (singularity.getCompanyRep(company) >= 400000) {
            singularity.stopAction();
        } else {
            return;
        }
    }

    if (singularity.getCompanyRep(company) < 400000) {
        singularity.workForCompany(company);
    }
}

/**
 * @param {import(".").NS } ns
 * @param {string} company
 */
function isCompanyAlreadyJoined(ns, company) {
    let singularity = ns.singularity;
    // singularity.


    return false;
}