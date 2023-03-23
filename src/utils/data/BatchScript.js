import {ATTACK_TYPES, TICK} from "/utils/data/Constants";
import {TIME_BETWEEN_ATTACK_PHASES} from "/utils/data/Settings";

export class BatchScript {
    /**
     * @type {number}
     */
    attackType;

    /**
     * @type {number}
     */
    scriptStartTime;

    /**
     * @type {number}
     */
    scriptRuntime;

    /**
     * @type {number}
     */
    scriptEndTime

    /**
     * @param {AttackableServer} attackableServer
     * @param {string} attackType
     * @param {number} threads
     * @param {number} delay
     * @param {number} scriptRuntime
     * @param {ScriptTiming} previous
     */
    constructor(attackType, scriptRuntime) {
        this.attackType = attackType;
        this.scriptStartTime = Date.now();
        this.scriptRuntime = scriptRuntime;
        this.scriptEndTime = this.scriptStartTime + scriptRuntime;
    }
}