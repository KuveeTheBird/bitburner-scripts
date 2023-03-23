import {calculateAttackParams} from "/utils/functions/getAttackVectors";
import {AttackableServer} from "/utils/data/AttackableServer";
import BatchEntryCollection from "/utils/data/Collections/BatchEntryCollection";
import {BATCH_ATTACK_TYPE_HACK, BATCH_ATTACK_TYPE_HACK_WEAKEN, TICK} from "/utils/data/Constants";
import {BatchScript} from "/utils/data/BatchScript";

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');

    let targetHostname = ns.args[0];
    if (!targetHostname) {
        targetHostname = 'n00dles';
    }
    let attackableServer = new AttackableServer(ns, targetHostname);

    let hackRatio = ns.args[1];
    if (!hackRatio) {
        hackRatio = 0.95;
    }

    let totalThreads = calculateAttackParams(ns, attackableServer, hackRatio).totalThreads;

    let batchEntryCollection = new BatchEntryCollection(ns, attackableServer);
    batchEntryCollection.startNewBatch(startHackWeakenScript(attackableServer));

    while (batchEntryCollection.length < 5) {
        if (batchEntryCollection.shouldStartNewBatch(attackableServer)) {
            batchEntryCollection.startNewBatch(startHackWeakenScript(attackableServer));
        }

        let batchToStartHackScriptFor = batchEntryCollection.getBatchToStartHackScriptFor(attackableServer);
        if (batchToStartHackScriptFor) {
            batchToStartHackScriptFor.addHackScript(startHackScript(attackableServer));
        }

        await ns.asleep(1);
    }

    ns.tprint(JSON.stringify(batchEntryCollection, undefined, 2));

}

/**
 *
 * @param {AttackableServer} attackableServer
 * @return {BatchScript}
 */
function startHackWeakenScript(attackableServer) {
    //TODO: exec weaken script on home
    return new BatchScript(BATCH_ATTACK_TYPE_HACK_WEAKEN, attackableServer.weakenTime);
}

/**
 *
 * @param {AttackableServer} attackableServer
 * @return {BatchScript}
 */
function startHackScript(attackableServer) {
    //TODO: exec weaken script on home
    return new BatchScript(BATCH_ATTACK_TYPE_HACK, attackableServer.hackTime);
}