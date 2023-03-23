import {AttackableServer} from "/utils/data/AttackableServer";
import BotnetServerCollection from "/utils/data/Collections/BotnetServerCollection";
import {ATTACK_TYPES} from "/utils/data/Constants";

export class AttackData {
    /** @type {import(".").NS } #ns */
    #ns;

    /** @type {AttackableServer} */
    attackableServer;

    /** @type {BotnetServerCollection} */
    botnetServerCollection;

    /** @type int */
    attackType;

    /** @type string */
    scriptPath;

    /** @type int */
    threads = 0;

    /** @type ProcessData[] */
    processes = [];

    constructor(ns, processData) {
        this.#ns = ns;
        this.attackableServer = processData.attackableServer;
        this.attackType = this.getAttackTypeFromScriptPath(processData.scriptPath);
        this.scriptPath = processData.scriptPath;

        this.botnetServerCollection = new BotnetServerCollection(ns);
        this.addProcess(processData)
    }

    addProcess(processData) {
        this.botnetServerCollection.add(processData.botnetServer);
        this.threads += processData.threads;
        this.processes.push(processData);
    }

    getAttackTypeFromScriptPath(scriptPath) {
        return ATTACK_TYPES[scriptPath];
    }

}