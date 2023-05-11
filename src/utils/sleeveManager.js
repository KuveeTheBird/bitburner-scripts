import {
    COURSE_ALGORITHMS,
    COURSE_LEADERSHIP,
    CRIME_HOMICIDE,
    CRIME_MUG,
    LOCATION_POWERHOUSE_GYM,
    LOCATION_ROTHMAN_UNIVERSITY,
    TRAINING_BASE_STAT,
    WORK_TYPE_CLASS,
    WORK_TYPE_CRIME
} from "/constants/Singularity";
import {SLEEVE_SHOCK_THRESHOLD} from "/settings/Settings";

/** @param {import(".").NS } ns */
export async function main(ns) {
    let sleeve = ns.sleeve;
    let currentWork = ns.singularity.getCurrentWork();
    let numSleeves = sleeve.getNumSleeves();


    for (let sleeveNumber = 0; sleeveNumber < numSleeves ; sleeveNumber++) {
        let sleevePerson = sleeve.getSleeve(sleeveNumber);
        let sleeveTask = sleeve.getTask(sleeveNumber);
        if (sleevePerson.shock <= 0) {
            buyAugments(ns, sleeveNumber);
        }

        // if (sleevePerson.sync < 100) {
        //     if (!sleeveTask || sleeveTask.type !== 'SYNCHRO') {
        //         sleeve.setToSynchronize(sleeveNumber);
        //     }
        //     continue;
        // }

        if (sleevePerson.shock > SLEEVE_SHOCK_THRESHOLD) {
            if (!sleeveTask || sleeveTask.type !== 'RECOVERY') {
                sleeve.setToShockRecovery(sleeveNumber);
            }
            continue;

        }

        if (handleTrainings(ns, sleeveNumber)) {
            continue;
        }

        // if (sleeveNumber === 0) {
        //     if (currentWork && currentWork.type === WORK_TYPE_FACTION) {
        //         if (!sleeveTask || sleeveTask.type !== currentWork.type || sleeveTask.factionName !== currentWork.factionName || sleeveTask.factionWorkType !== currentWork.factionWorkType) {
        //             sleeve.setToFactionWork(sleeveNumber, currentWork.factionName, currentWork.factionWorkType);
        //         }
        //         continue;
        //     }
        //     if (currentWork && currentWork.type === WORK_TYPE_COMPANY) {
        //         if (!sleeveTask || sleeveTask.type !== currentWork.type || sleeveTask.companyName !== currentWork.companyName) {
        //             sleeve.setToCompanyWork(sleeveNumber, currentWork.companyName)
        //         }
        //         continue;
        //     }
        // }

        commitCrime(ns, sleeveNumber);
    }
}

/** @param {import(".").NS } ns
 * @param {number} sleeveNumber
 */
function handleTrainings(ns, sleeveNumber) {
    let sleeve = ns.sleeve;
    let sleevePerson = sleeve.getSleeve(sleeveNumber);
    let mults = sleevePerson.mults;
    let singularity = ns.singularity;
    let currentWork = singularity.getCurrentWork();

    let bitNodeMultipliers = ns.getBitNodeMultipliers();
    let trainingBaseStat = TRAINING_BASE_STAT * 2;
    let targetHackingLevel = trainingBaseStat * mults.hacking_exp * mults.hacking * bitNodeMultipliers.HackingLevelMultiplier;
    let targetChaLevel = trainingBaseStat * mults.charisma * mults.charisma_exp * bitNodeMultipliers.CharismaLevelMultiplier;
    let targetStrLevel = trainingBaseStat * mults.strength * mults.strength_exp * bitNodeMultipliers.StrengthLevelMultiplier;
    let targetDexLevel = trainingBaseStat * mults.dexterity * mults.dexterity_exp * bitNodeMultipliers.DexterityLevelMultiplier;
    let targetDefLevel = trainingBaseStat * mults.defense * mults.defense_exp * bitNodeMultipliers.DefenseLevelMultiplier;
    let targetAgiLevel = trainingBaseStat * mults.agility * mults.agility_exp * bitNodeMultipliers.AgilityLevelMultiplier;

    if (sleevePerson.skills.hacking < targetHackingLevel || (currentWork && currentWork.type === WORK_TYPE_CLASS && currentWork.classType === COURSE_ALGORITHMS)) {
        sleeve.setToUniversityCourse(sleeveNumber, LOCATION_ROTHMAN_UNIVERSITY, COURSE_ALGORITHMS);
        return true;
    } else if (sleevePerson.skills.charisma < targetChaLevel || (currentWork && currentWork.type === WORK_TYPE_CLASS && currentWork.classType === COURSE_LEADERSHIP)) {
        sleeve.setToUniversityCourse(sleeveNumber, LOCATION_ROTHMAN_UNIVERSITY, COURSE_LEADERSHIP);
        return true;
    } else if (sleevePerson.skills.strength < targetStrLevel || (currentWork && currentWork.type === WORK_TYPE_CLASS && currentWork.classType === 'str')) {
        sleeve.setToGymWorkout(sleeveNumber, LOCATION_POWERHOUSE_GYM, 'str');
        return true;
    } else if (sleevePerson.skills.defense < targetDefLevel || (currentWork && currentWork.type === WORK_TYPE_CLASS && currentWork.classType === 'def')) {
        sleeve.setToGymWorkout(sleeveNumber, LOCATION_POWERHOUSE_GYM, 'def');
        return true;
    } else if (sleevePerson.skills.dexterity < targetDexLevel || (currentWork && currentWork.type === WORK_TYPE_CLASS && currentWork.classType === 'dex')) {
        sleeve.setToGymWorkout(sleeveNumber, LOCATION_POWERHOUSE_GYM, 'dex');
        return true;
    } else if (sleevePerson.skills.agility < targetAgiLevel || (currentWork && currentWork.type === WORK_TYPE_CLASS && currentWork.classType === 'agi')) {
        sleeve.setToGymWorkout(sleeveNumber, LOCATION_POWERHOUSE_GYM, 'agi');
        return true;
    }

    return false;
}

/**
 * @param {NS} ns
 * @param {number} sleeveNumber
 */
function buyAugments(ns, sleeveNumber) {
    let sleeve = ns.sleeve;

    let sleevePurchasableAugs = sleeve.getSleevePurchasableAugs(sleeveNumber);
    if (sleevePurchasableAugs.length) {
        for (let aug of sleevePurchasableAugs) {
            sleeve.purchaseSleeveAug(sleeveNumber, aug.name);
        }
    }
}

function commitCrime(ns, sleeveNumber) {
    let sleeve = ns.sleeve;
    let sleevePerson = sleeve.getSleeve(sleeveNumber);
    let sleeveSkills = sleevePerson.skills;
    let averageCombatStats = Math.floor((sleeveSkills.strength + sleeveSkills.defense + sleeveSkills.dexterity + sleeveSkills.agility) / 4);
    let sleeveTask = sleeve.getTask(sleeveNumber);

    if (averageCombatStats > 150) {
        if (!sleeveTask || sleeveTask.type !== WORK_TYPE_CRIME || sleeveTask.crimeType !== CRIME_HOMICIDE) {
            sleeve.setToCommitCrime(sleeveNumber, CRIME_HOMICIDE);
        }
    } else {
        if (!sleeveTask || sleeveTask.type !== WORK_TYPE_CRIME || sleeveTask.crimeType !== CRIME_MUG) {
            sleeve.setToCommitCrime(sleeveNumber, CRIME_MUG);
        }
    }

}