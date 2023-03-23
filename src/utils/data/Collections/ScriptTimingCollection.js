import {ScriptTiming} from "/utils/data/ScriptTiming";
import {TICK} from "/utils/data/Constants";

export default class ScriptTimingCollection {
    /** @param {import(".").NS } #ns */
    #ns;

    internalCounter = 0;

    /**
     * @type {ScriptTiming[]}
     */
    innerObjects = [];

    constructor(ns) {
        this.#ns = ns;
    }

    clone() {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }

    /**
     * @return {number}
     */
    get length() {
        return this.innerObjects.length;
    }

    /**
     * @return {boolean}
     */
    hasNext() {
        return this.internalCounter < this.innerObjects.length;
    }

    /**
     * @returns {ScriptTiming}
     */
    getNext() {
        let next = this.innerObjects[this.internalCounter];
        this.internalCounter++;
        return next;
    }

    reset() {
        this.internalCounter = 0;
    }

    /**
     * @param {ScriptTiming} scriptTiming
     */
    add(scriptTiming) {
        this.innerObjects.push(scriptTiming);
    }

    /**
     * Remove not running processes
     */
    cleanup() {
        let innerObjects = [];
        let currentTimestamp = Date.now();

        for (let scriptTiming of this.innerObjects) {
            if (scriptTiming.attackEndTime >= currentTimestamp) {
                innerObjects.push(scriptTiming);
            }
        }

        this.innerObjects = innerObjects;
    }

    async incearseDelayToAvoidConflictBy(attackableServer, targetTime) {
        let localTargetTime = targetTime;
        let delayIncrease = 0;
        let continueLoop = true;

        while (continueLoop) {
            continueLoop = false;
            for (let scriptTiming of this.innerObjects) {
                if (!scriptTiming.attackableServer.equals(attackableServer)) {
                    continue;
                }

                if (localTargetTime >= (scriptTiming.conflictStartTime) && localTargetTime <= scriptTiming.conflictEndTime) {
                    let localDelay = scriptTiming.conflictEndTime - localTargetTime + 1;
                    // this.#ns.printf('Conflicting local time: %s, conflict start: %s, conflict end: %s, localDelay', localTargetTime, scriptTiming.conflictStartTime, scriptTiming.conflictEndTime);
                    localTargetTime += localDelay;
                    delayIncrease += localDelay;
                    continueLoop = true;
                    break
                }
            }
            delayIncrease -= TICK;
            await this.#ns.asleep(TICK);
        }

        return delayIncrease;
    }


    // isConflicting(attackableServer, ) {
    //
    // }
}