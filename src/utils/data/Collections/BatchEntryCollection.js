import {BatchEntry} from "/utils/data/BatchEntry";
import {TIME_BETWEEN_ATTACK_PHASES} from "/utils/data/Settings";
import {AttackableServer} from "/utils/data/AttackableServer";
import {TICK} from "/utils/data/Constants";


export default class BatchEntryCollection {
    /** @param {import(".").NS } #ns */
    #ns;

    internalCounter = 0;

    highestBatchNumber = 0;

    /**
     * @type {BatchEntry[]}
     */
    batchEntries = [];

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
        return this.batchEntries.length;
    }

    /**
     * @return {boolean}
     */
    hasNext() {
        return this.internalCounter < this.batchEntries.length;
    }

    /**
     * @returns {BotnetServer}
     */
    getNext() {
        let next = this.batchEntries[this.internalCounter];
        this.internalCounter++;
        return next;
    }

    reset() {
        this.internalCounter = 0;
    }

    startNewBatch(hackWeakenScript) {
        this.#ns.tprintf('Start New Batch #%s - %s', this.highestBatchNumber, Date.now());
        let batchEntry = new BatchEntry(this.#ns, this.highestBatchNumber, hackWeakenScript);
        this.batchEntries.push(batchEntry);
        this.highestBatchNumber++;

        return batchEntry;
    }

    /**
     * @param {AttackableServer} attackableServer
     * @return {boolean}
     */
    shouldStartNewBatch(attackableServer) {
        for (let batchEntry of this.batchEntries) {
            if (batchEntry.conflicts(attackableServer)) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param {AttackableServer} attackableServer
     * @return {?BatchEntry}
     */
    getBatchToStartHackScriptFor(attackableServer) {
        let hackScriptEnd = Date.now() + attackableServer.hackTime;

        for (let batchEntry of this.batchEntries) {
            if (batchEntry.hackScript) {
                continue
            }

            let timeBeforeHackWeakenEnds = batchEntry.hackWeakenScript.scriptEndTime - hackScriptEnd;
            if (timeBeforeHackWeakenEnds > TICK && timeBeforeHackWeakenEnds < TIME_BETWEEN_ATTACK_PHASES) {
                return batchEntry;
            }
        }

        return;
    }
}