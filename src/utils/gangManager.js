import {FACTION_NAME_SLUM_SNAKES} from "/constants/Factions";
import {
    GANG_MEMBER_NAME_TEMPLATE,
    GANG_TASK_NAME_TERRITORY_WARFARE,
    GANG_TASK_NAME_TERRORISM,
    GANG_TASK_NAME_TRAFFICK_ILLEGAL_ARMS,
    GANG_TASK_NAME_TRAIN_CHARISMA,
    GANG_TASK_NAME_TRAIN_COMBAT,
    GANG_TASK_NAME_TRAIN_HACKING,
    GANG_TASK_NAME_UNASSIGNED,
    GANG_TASK_NAME_VIGILANTE_JUSTICE,
    GANG_TASKS_TRAINING
} from "/constants/Gang";
import {
    GANG_BASE_CHARISMA_TRAINING_THRESHOLD,
    GANG_BASE_HACKING_TRAINING_THRESHOLD,
    GANG_COMBAT_TRAINING_THRESHOLD
} from "/settings/Settings";
import {FILE_PATH_GANG_POWERS, FILE_SQLINJECT} from "/constants/FileNames";

let powersLastShiftedAt;

/** @param {import(".").NS } ns */
export async function main(ns) {
    const gangKarmaThreshold = -54000;
    let gang = ns.gang;
    let currentKarma = ns.heart.break();

    if (!gang.inGang() && !gang.createGang(FACTION_NAME_SLUM_SNAKES)) {
        ns.printf(
            'Waiting to be able to form the G4NG. %s/%s Karma. %s more to go.',
            currentKarma,
            gangKarmaThreshold,
            gangKarmaThreshold - currentKarma
        );
        return;
    }

    checkPowers(ns);

    recruitMembers(ns);
    ascendMembers(ns);
    equipMembers(ns);

    trainMembers(ns);
    if (handleWantedLevel(ns)) {
        return;
    }

    handleStandardDuty(ns);
    engageTerritoryWarfareWhenOptimal(ns);
}

/** @param {import(".").NS } ns */
function checkPowers(ns) {
    let gang = ns.gang;
    let otherGangInformation = gang.getOtherGangInformation();

    let gangPowersString = ns.read(FILE_PATH_GANG_POWERS);
    let parsedGangPowers = JSON.parse(gangPowersString);
    let previousGangPowers = parsedGangPowers.gangPowers;
    powersLastShiftedAt = parsedGangPowers.changed;

    let changed = false;
    let gangPowers = {};
    for (let faction of Object.keys(otherGangInformation)) {
        let gangPower = otherGangInformation[faction].power;
        gangPowers[faction] = gangPower;
        if (gangPower !== previousGangPowers[faction]) {
            changed = true;
        }
    }

    if (!changed) {
        return;
    }

    let dataToWrite = {
        changed: Date.now(),
        gangPowers: gangPowers,
        hardestFightChance: getHardestFightChance(ns),
        highestEnemyPower: getHighestEnemyPower(ns),
        power: gang.getGangInformation().power,
    }

    ns.write(FILE_PATH_GANG_POWERS, JSON.stringify(dataToWrite), 'w');
}


/** @param {import(".").NS } ns */
function recruitMembers(ns) {
    let gang = ns.gang;
    let memberNames = gang.getMemberNames();
    let numOfRecruit = memberNames.length;

    while (gang.canRecruitMember()) {
        numOfRecruit++;

        let recruitName = ns.sprintf(GANG_MEMBER_NAME_TEMPLATE, numOfRecruit)
        if (gang.recruitMember(recruitName)) {
            ns.toast(ns.sprintf("%s has been recruited for our cause!", recruitName));
        }
    }
}

//["Unassigned","Mug People","Deal Drugs","Strongarm Civilians","Run a Con","Armed Robbery","Traffick Illegal Arms","Threaten & Blackmail","Human Trafficking","Terrorism","Vigilante Justice","Train Combat","Train Hacking","Train Charisma","Territory Warfare"]

/** @param {import(".").NS } ns */
function trainMembers(ns) {
    let gang = ns.gang;
    let memberNames = ns.gang.getMemberNames();
    for (let memberName of memberNames) {
        let memberInformation = gang.getMemberInformation(memberName);

        // let underCombatThreshold = GANG_BASE_COMBAT_TRAINING_THRESHOLD * memberInformation.str_mult > memberInformation.str
        //     || GANG_BASE_COMBAT_TRAINING_THRESHOLD * memberInformation.def_mult > memberInformation.def
        //     || GANG_BASE_COMBAT_TRAINING_THRESHOLD * memberInformation.dex_mult > memberInformation.dex
        //     || GANG_BASE_COMBAT_TRAINING_THRESHOLD * memberInformation.agi_mult > memberInformation.agi;

        let underCombatThreshold = (memberInformation.str + memberInformation.def + memberInformation.dex + memberInformation.agi) < GANG_COMBAT_TRAINING_THRESHOLD;
        if (underCombatThreshold) {
            safeSetTask(gang, memberName, GANG_TASK_NAME_TRAIN_COMBAT)
            continue;
        } else if (!underCombatThreshold) {
            cancelTask(gang, memberName, GANG_TASK_NAME_TRAIN_COMBAT)
        }

        let underHackThreshold = GANG_BASE_HACKING_TRAINING_THRESHOLD * memberInformation.hack_mult > memberInformation.hack;
        if (underHackThreshold) {
            safeSetTask(gang, memberName, GANG_TASK_NAME_TRAIN_HACKING);
            continue;
        } else if (!underHackThreshold) {
            cancelTask(gang, memberName, GANG_TASK_NAME_TRAIN_HACKING)
        }

        let underChaThreshold = GANG_BASE_CHARISMA_TRAINING_THRESHOLD * memberInformation.cha_mult > memberInformation.cha;
        if (underChaThreshold) {
            safeSetTask(gang, memberName, GANG_TASK_NAME_TRAIN_CHARISMA)
            continue;
        } else if (!underChaThreshold) {
            cancelTask(gang, memberName, GANG_TASK_NAME_TRAIN_CHARISMA)
        }
    }
}

/** @param {import(".").NS } ns */
function handleStandardDuty(ns) {
    let gang = ns.gang;
    let memberNames = gang.getMemberNames();
    let switchToTerritoryWarfare = shouldSwitchToTerritoryWarfare(ns);
    let handleWantedLevel = needToHandleWantedLevel(ns);

    let i = 0;
    for (let memberName of memberNames) {
        i++;

        if (switchToTerritoryWarfare) {
            if (gang.getBonusTime() < 10000 || i <= 6) {
                safeSetTask(gang, memberName, GANG_TASK_NAME_TERRITORY_WARFARE);
                continue;
            }
        }

        if (handleWantedLevel && i % 4 > 1) {
            safeSetTask(gang, memberName, GANG_TASK_NAME_VIGILANTE_JUSTICE);
            continue;
        }

        if (GANG_TASKS_TRAINING.includes(gang.getMemberInformation(memberName).task)) {
            continue;
        }

        if (
            memberNames.length < 12
            || (
                i % 2 === 1
                && gang.getGangInformation().respect < 20 * 1000 * 1000 * 1000
            )
        ) {
            safeSetTask(gang, memberName, GANG_TASK_NAME_TERRORISM);
            continue
        }
        safeSetTask(gang, memberName, GANG_TASK_NAME_TRAFFICK_ILLEGAL_ARMS);
    }
}

/** @param {import(".").NS } ns */
function handleWantedLevel(ns) {
    let gang = ns.gang;
    let task = gang.getMemberInformation(gang.getMemberNames()[0]).task;
    if (gang.getGangInformation().wantedLevel < 10) {
        return false;
    } else if (
        task !== GANG_TASK_NAME_VIGILANTE_JUSTICE
        && gang.getGangInformation().wantedPenalty > 0.90
    ) {
        return false;
    } else if (
        task === GANG_TASK_NAME_VIGILANTE_JUSTICE
        && gang.getGangInformation().wantedPenalty > 0.95
    ) {
        return false;
    }

    let memberNames = ns.gang.getMemberNames();
    for (let memberName of memberNames) {
        if (!GANG_TASKS_TRAINING.includes(gang.getMemberInformation(memberName).task)) {
            gang.setMemberTask(memberName, GANG_TASK_NAME_VIGILANTE_JUSTICE);
        }
    }

    return true;
}

/** @param {import(".").NS } ns */
function needToHandleWantedLevel(ns) {
    let gang = ns.gang;
    let vigilantes = areAnyGangMembersVigilantes(ns);

    if (gang.getGangInformation().wantedLevel < 10) {
        return false;
    } else if (!vigilantes && gang.getGangInformation().wantedPenalty > 0.90) {
        return false;
    } else if (vigilantes && gang.getGangInformation().wantedPenalty > 0.95) {
        return false;
    }

    return true;
}

/** @param {import(".").NS } ns */
function areAnyGangMembersVigilantes(ns) {
    let gang = ns.gang;
    let memberNames = gang.getMemberNames();

    for (let memberName of memberNames) {
        if (gang.getMemberInformation(memberName).task === GANG_TASK_NAME_VIGILANTE_JUSTICE) {
            return true;
        }
    }

    return false;
}

/** @param {import(".").NS } ns */
function engageTerritoryWarfareWhenOptimal(ns) {

    let gangInformation = ns.gang.getGangInformation();

    if (
        gangInformation.power > 10
        && getHardestFightChance(ns) >= 54
        && gangInformation.territory < 0.99
    ) {
        if (!gangInformation.territoryWarfareEngaged) {
            ns.gang.setTerritoryWarfare(true);
            ns.toast("FIGHT FOR THE STREETS!");
        }
    } else if (gangInformation.territoryWarfareEngaged) {
        ns.gang.setTerritoryWarfare(false);
        ns.toast("We still need to gather our strength, m'lord");
    }
}


/** @param {import(".").NS } ns */
function getHardestFightChance(ns) {
    let myPower = ns.gang.getGangInformation().power;

    return (myPower / (myPower + getHighestEnemyPower(ns))) * 100;
}

/** @param {import(".").NS } ns */
function getHighestEnemyPower(ns) {
    let highestPower = 0;
    let otherGangs = ns.gang.getOtherGangInformation();
    let otherGangNames = Object.keys(otherGangs);
    for (let i = 0; i < otherGangNames.length; i++) {
        let gangName = otherGangNames[i];
        if (gangName === ns.gang.getGangInformation().faction) {
            continue;
        }
        if (otherGangs[gangName].territory <= 0) {
            continue;
        }

        let gangPower = otherGangs[gangName].power;

        if (gangPower > highestPower) {
            highestPower = gangPower;
        }
    }

    return highestPower;
}

/** @param {import(".").NS } ns */
function ascendMembers(ns) {
    let gang = ns.gang;
    let memberNames = ns.gang.getMemberNames();

    if (memberNames.length === 11) {
        return;
    }

    for (let memberName of memberNames) {
        let ascensionResult = gang.getAscensionResult(memberName);

        let ascendThreshold = 1.5;
        if (
            ascensionResult
            && (
                ascensionResult.str > ascendThreshold
                || ascensionResult.def > ascendThreshold
                || ascensionResult.dex > ascendThreshold
                || ascensionResult.agi > ascendThreshold
            )
        ) {
            gang.ascendMember(memberName);
        }
    }
}

/** @param {import(".").NS } ns */
function equipMembers(ns) {
    if (!ns.fileExists(FILE_SQLINJECT)) {
        return;
    }

    let gang = ns.gang;
    let memberNames = ns.gang.getMemberNames();
    let equipmentNames = gang.getEquipmentNames();

    for (let memberName of memberNames) {
        for (let equipmentName of equipmentNames) {
            gang.purchaseEquipment(memberName, equipmentName);
        }
    }
}

/** @param {import(".").NS } ns */
function shouldSwitchToTerritoryWarfare(ns) {
    let gang = ns.gang;
    let bonusTime = gang.getBonusTime();
    let territory = gang.getGangInformation().territory;
    if (territory > 0.99) {
        return false;
    }
    if (bonusTime > 10000) {
        return true;
    }

    return Date.now() - powersLastShiftedAt >= 18000;
}

function safeSetTask(gang, memberName, task) {
    let memberInformation = gang.getMemberInformation(memberName);

    if (memberInformation.task !== task) {
        gang.setMemberTask(memberName, task);
    }
}

function cancelTask(gang, memberName, task) {
    let memberInformation = gang.getMemberInformation(memberName);

    if (memberInformation.task === task) {
        gang.setMemberTask(memberName, GANG_TASK_NAME_UNASSIGNED);
    }
}

