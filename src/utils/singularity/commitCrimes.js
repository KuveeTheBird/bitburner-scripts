import {CRIME_HOMICIDE, CRIME_MUG, WORK_TYPE_CLASS, WORK_TYPE_CRIME, WORK_TYPE_FACTION} from "/constants/Singularity";

/** @param {import(".").NS } ns */
export async function main(ns) {
    let player = ns.getPlayer();
    let singularity = ns.singularity;
    let currentWork = singularity.getCurrentWork();

    if (currentWork && (currentWork.type === WORK_TYPE_CLASS || currentWork.type === WORK_TYPE_FACTION)) {
        return;
    }

    let crime = CRIME_HOMICIDE;

    if (singularity.getCrimeChance(crime) < 0.8) {
        crime = CRIME_MUG;
    }

    if (!currentWork || currentWork.type !== WORK_TYPE_CRIME || currentWork.crimeType !== crime) {
        singularity.commitCrime(crime);
    }
}