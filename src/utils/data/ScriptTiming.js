import {ATTACK_TYPES, TICK} from "/utils/data/Constants";
import {TIME_BETWEEN_ATTACK_PHASES} from "/utils/data/Settings";

export class ScriptTiming {
    /**
     * @type {AttackableServer}
     */
    attackableServer;

    /**
     * @type {number}
     */
    attackType;

    /**
     * @type {number}
     */
    threads;

    /**
     * @type {number}
     */
    scriptStartTime;

    /**
     * @type {number}
     */
    delay;

    /**
     * @type {number}
     */
    scriptRuntime;

    /**
     * @type {number}
     */
    attackStartTime;

    /**
     * @type {number}
     */
    attackEndTime

    /**
     * @type {number}
     */
    pid;

    /**
     * @type {ScriptTiming}
     */
    previous;

    /**
     * @param {AttackableServer} attackableServer
     * @param {string} attackType
     * @param {number} threads
     * @param {number} delay
     * @param {number} scriptRuntime
     * @param {ScriptTiming} previous
     */
    constructor(attackableServer, attackType, threads, delay, scriptRuntime, previous) {
        this.attackableServer = attackableServer;
        this.attackType = attackType;
        this.threads = threads;
        this.delay = delay;
        this.scriptRuntime = scriptRuntime;
        this.previous = previous;

        this.scriptStartTime = Date.now();
        this.attackStartTime = this.scriptStartTime + delay;
        this.attackEndTime = this.scriptStartTime + delay + scriptRuntime;
    }

    get conflictStartTime() {
        return this.previous.attackEndTime - TIME_BETWEEN_ATTACK_PHASES;
    }

    get conflictEndTime() {
        return this.attackEndTime + TIME_BETWEEN_ATTACK_PHASES;
    }
}