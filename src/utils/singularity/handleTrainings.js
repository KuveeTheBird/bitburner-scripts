import {
    CITY_SECTOR_12,
    COURSE_ALGORITHMS,
    COURSE_LEADERSHIP,
    LOCATION_POWERHOUSE_GYM,
    LOCATION_ROTHMAN_UNIVERSITY,
    TRAINING_BASE_STAT,
    WORK_TYPE_CLASS
} from "/constants/Singularity";
import {getNextTargetFaction} from "/utils/functions/singularity/getNextTargetFaction";
import {
    FACTIONS_BACKDOOR_REQUIREMENTS,
    FACTIONS_BATTLE_STAT_REQUIREMENTS,
    FACTIONS_HACKING_STAT_REQUIREMENTS
} from "/constants/Factions";


/** @param {import(".").NS } ns */
export async function main(ns) {
    let player = ns.getPlayer();
    let singularity = ns.singularity;
    let skills = player.skills;
    let nextTarget = getNextTargetFaction(ns);

    let bitNodeMultipliers = ns.getBitNodeMultipliers();

    // ns.tprint(bitNodeMultipliers);

    let hackingMultiplier = player.mults.hacking * bitNodeMultipliers.HackingLevelMultiplier;
    let hackingExpMultiplier = player.mults.hacking_exp * bitNodeMultipliers.HackExpGain;
    let targetHackingLevel = TRAINING_BASE_STAT * hackingExpMultiplier * hackingMultiplier;

    let charismaMultiplier = player.mults.charisma * bitNodeMultipliers.CharismaLevelMultiplier;
    let charismaExpMultiplier = player.mults.charisma_exp;
    let targetChaLevel = TRAINING_BASE_STAT * charismaMultiplier * charismaExpMultiplier;

    let strengthMultiplier = player.mults.strength * bitNodeMultipliers.StrengthLevelMultiplier;
    let strengthExpMultiplier = player.mults.strength_exp;
    let targetStrLevel = TRAINING_BASE_STAT * strengthMultiplier * strengthExpMultiplier;

    let defenseMultiplier = player.mults.defense * bitNodeMultipliers.DefenseLevelMultiplier;
    let defenseExpMultiplier = player.mults.defense_exp;
    let targetDefLevel = TRAINING_BASE_STAT * defenseMultiplier * defenseExpMultiplier;

    let dexterityMultiplier = player.mults.dexterity * bitNodeMultipliers.DexterityLevelMultiplier;
    let dexterityExpMultiplier = player.mults.dexterity_exp;
    let targetDexLevel = TRAINING_BASE_STAT * dexterityMultiplier * dexterityExpMultiplier;

    let agilityMultiplier = player.mults.agility * bitNodeMultipliers.AgilityLevelMultiplier;
    let agilityExpMultiplier = player.mults.agility_exp;
    let targetAgiLevel = TRAINING_BASE_STAT * agilityMultiplier * agilityExpMultiplier;


    if (nextTarget !== false && Object.keys(FACTIONS_BACKDOOR_REQUIREMENTS).includes(nextTarget)) {
        targetHackingLevel = Math.max(targetHackingLevel, ns.getServerRequiredHackingLevel(FACTIONS_BACKDOOR_REQUIREMENTS[nextTarget]));
    } else if (nextTarget !== false && Object.keys(FACTIONS_HACKING_STAT_REQUIREMENTS).includes(nextTarget)) {
        targetHackingLevel = Math.max(targetHackingLevel, FACTIONS_HACKING_STAT_REQUIREMENTS[nextTarget]);
    }

    if (nextTarget !== false && Object.keys(FACTIONS_BATTLE_STAT_REQUIREMENTS).includes(nextTarget)) {
        let battleStatRequirement = FACTIONS_BATTLE_STAT_REQUIREMENTS[nextTarget];

        targetStrLevel = Math.max(targetStrLevel, battleStatRequirement);
        targetDefLevel = Math.max(targetDefLevel, battleStatRequirement);
        targetDexLevel = Math.max(targetDexLevel, battleStatRequirement);
        targetAgiLevel = Math.max(targetAgiLevel, battleStatRequirement);
    }

    let universtityClasses = [
        {
            name: 'hacking',
            checkClassType: 'Algorithms',
            skill: skills.hacking,
            targetLevel: targetHackingLevel,
            universityClassType: COURSE_ALGORITHMS
        },
        {
            name: 'charisma',
            checkClassType: 'Leadership',
            skill: skills.charisma,
            targetLevel: targetChaLevel,
            universityClassType: COURSE_LEADERSHIP
        },
    ];

    let gymTrainings = [
        {
            name: 'strength',
            attribute: 'str',
            skill: skills.strength,
            targetLevel: targetStrLevel,
        },
        {
            name: 'defense',
            attribute: 'def',
            skill: skills.defense,
            targetLevel: targetDefLevel,
        },
        {
            name: 'dexterity',
            attribute: 'dex',
            skill: skills.dexterity,
            targetLevel: targetDexLevel,
        },
        {
            name: 'agility',
            attribute: 'agi',
            skill: skills.agility,
            targetLevel: targetAgiLevel,
        },
    ];

    let currentWork = singularity.getCurrentWork();

    for (let universityClass of universtityClasses) {
        if (universityClass.skill < universityClass.targetLevel) {
            if (!currentWork || currentWork.type !== WORK_TYPE_CLASS || currentWork.classType !== universityClass.checkClassType) {
                let toastMessage = ns.sprintf('Training %s until %s', universityClass.name, universityClass.targetLevel);
                ns.toast(toastMessage, 'info');
                singularity.travelToCity(CITY_SECTOR_12);
                singularity.universityCourse(LOCATION_ROTHMAN_UNIVERSITY, universityClass.universityClassType);
            }
            return;
        }
    }

    for (let gymTraining of gymTrainings) {
        if (gymTraining.skill < gymTraining.targetLevel) {
            if (!currentWork || currentWork.type !== WORK_TYPE_CLASS || currentWork.classType !== gymTraining.attribute) {
                let toastMessage = ns.sprintf('Training %s until %s', gymTraining.name, gymTraining.targetLevel);
                ns.toast(toastMessage, 'info');
                singularity.travelToCity(CITY_SECTOR_12);
                singularity.gymWorkout(LOCATION_POWERHOUSE_GYM, gymTraining.attribute);
            }
            return;
        }
    }

    if (currentWork && currentWork.type === WORK_TYPE_CLASS) {
        singularity.stopAction();
    }
}