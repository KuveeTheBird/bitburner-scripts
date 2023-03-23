import {BatchScript} from "/utils/data/BatchScript";
import {TIME_BETWEEN_ATTACK_PHASES} from "/utils/data/Settings";
import {TICK} from "/utils/data/Constants";

export class BatchEntry {
    /** @type {NS} #ns */
    #ns;

    /** @type {number} */
    batchNumber;

    /** @type {BatchScript} */
    hackWeakenScript;

    /** @type {BatchScript} */
    hackScript;

    /** @type {BatchScript} */
    growWeakenScript;

    /** @type {BatchScript} */
    growScript;

    /** @param {NS} ns
     * @param {number} batchNumber
     * @param {BatchScript} hackWeakenScript
     */
    constructor(ns, batchNumber, hackWeakenScript) {
        this.batchNumber = batchNumber;
        this.#ns = ns;
        this.addHackWeakenScript(hackWeakenScript);
    }

    addHackWeakenScript(script) {
        this.hackWeakenScript = script;
    }

    addHackScript(script) {
        this.hackScript = script;
    }

    addGrowWeakenScript(script) {
        this.growWeakenScript = script;
    }

    addGrowScript(script) {
        this.growScript = script;
    }

    get batchExecutionStartTime() {
        this.hackWeakenScript.scriptStartTime;
    }

    get batchResolutionStartTime() {
        return this.hackWeakenScript.scriptEndTime - TIME_BETWEEN_ATTACK_PHASES - TICK;
    }

    get batchResolutionEndTime() {
        return this.hackWeakenScript.scriptEndTime + (2 * TIME_BETWEEN_ATTACK_PHASES) + TICK;
    }

    get hackScriptMissing() {
        return typeof this.hackScript === 'undefined';
    }

    get growScriptMissing() {
        return typeof this.growScript === 'undefined';
    }

    get growWeakenScriptMissing() {
        return typeof this.growWeakenScript === 'undefined';
    }

    conflicts(attackableServer) {

        //TODO CHECK OTHER CONFLICTS
        let hackWeakenScriptEnd = Date.now() + attackableServer.weakenTime;
        let predictedResulotionStart = hackWeakenScriptEnd - TIME_BETWEEN_ATTACK_PHASES;
        let predictedResolutionEnd = hackWeakenScriptEnd + (2 * TIME_BETWEEN_ATTACK_PHASES);

        if (this.insideResolution(predictedResulotionStart)) {
            return true;
        } else if (this.insideResolution(predictedResolutionEnd)) {
            return true;
        }
        return false;
    }

    insideResolution(targetTime) {
        return targetTime >= this.batchResolutionStartTime && targetTime <= this.batchResolutionEndTime;
    }
}