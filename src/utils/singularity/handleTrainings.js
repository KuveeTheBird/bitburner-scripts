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
import {FACTIONS_BATTLE_STAT_REQUIREMENTS} from "/constants/Factions";


/** @param {import(".").NS } ns */
export async function main(ns) {
    let player = ns.getPlayer();
    let singularity = ns.singularity;
    let skills = player.skills;
    let nextTarget = getNextTargetFaction(ns);

    let targetHackingLevel = TRAINING_BASE_STAT * player.mults.hacking_exp * player.mults.hacking;
    let targetChaLevel = TRAINING_BASE_STAT * player.mults.charisma * player.mults.charisma_exp;
    let targetStrLevel = TRAINING_BASE_STAT * player.mults.strength * player.mults.strength_exp;
    let targetDefLevel = TRAINING_BASE_STAT * player.mults.defense * player.mults.defense_exp;
    let targetDexLevel = TRAINING_BASE_STAT * player.mults.dexterity * player.mults.dexterity_exp;
    let targetAgiLevel = TRAINING_BASE_STAT * player.mults.agility * player.mults.agility_exp;

    if (targetHackingLevel > 3000) {
        targetHackingLevel = 3000;
    }
    if (targetChaLevel > 500) {
        targetChaLevel = 500;
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