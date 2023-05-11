import {AttackData} from "/utils/data/AttackData";

export default class AttackDataCollection {
    /** @param {import(".").NS } #ns */
    #ns;

    internalCounter = 0;

    /**
     * @type {AttackData[]}
     */
    attackData = [];

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
        return this.attackData.length;
    }

    /**
     * @return {boolean}
     */
    hasNext() {
        return this.internalCounter < this.attackData.length;
    }

    /**
     * @returns {BotnetServer}
     */
    getNext() {
        let next = this.attackData[this.internalCounter];
        this.internalCounter++;
        return next;
    }

    reset() {
        this.internalCounter = 0;
    }

    /**
     *
     * @param {ProcessData} processData
     */
    addProcess(processData) {
        if (this.attackData.length) {
            for (let attackDatum of this.attackData) {
                if (attackDatum.attackableServer.equals(processData.attackableServer) && attackDatum.scriptPath === processData.scriptPath) {
                    attackDatum.addProcess(processData);
                    return;
                }
            }
        }

        this.attackData.push(new AttackData(this.#ns, processData));
    }

    getThreadsByAttackableServerAndAttackType(attackableServer, attackType) {
        if (!Array.isArray(attackType)) {
            attackType = [attackType];
        }

        if (this.attackData.length) {
            for (let attackDatum of this.attackData) {
                if (attackDatum.attackableServer.equals(attackableServer) && attackType.includes(attackDatum.attackType)) {
                    return attackDatum.threads;
                }
            }
        }

        return 0;
    }

    getThreadsByAttackableServerAndScriptPath(attackableServer, scriptPath) {

        if (!Array.isArray(scriptPath)) {
            scriptPath = [scriptPath];
        }

        if (this.attackData.length) {
            for (let attackDatum of this.attackData) {
                if (attackDatum.attackableServer.equals(attackableServer) && scriptPath.includes(attackDatum.scriptPath)) {
                    return attackDatum.threads;
                }
            }
        }

        return 0;
    }

    getThreadsByAttackType(attackType) {
        let threads = 0;
        if (!Array.isArray(attackType)) {
            attackType = [attackType];
        }

        if (this.attackData.length) {
            for (let attackDatum of this.attackData) {
                if (attackType.includes(attackDatum.attackType)) {
                    threads += attackDatum.threads;
                }
            }
        }

        return threads;
    }
}