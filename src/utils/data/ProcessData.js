import {AttackableServer} from "/utils/data/AttackableServer";
import {BotnetServer} from "/utils/data/BotnetServer";

export default class ProcessData {

    /** @param {import(".").NS } #ns */
    #ns;

    /** @param {AttackableServer} attackableServer */
    attackableServer;

    /** @param {BotnetServer} botnetServer */
    botnetServer;

    /** @param {number} threads */
    threads;

    /** @param {number} pid */
    pid;

    scriptPath;


    /**
     *
     * @param {import(".").NS } ns
     * @param {(AttackableServer|string)} attackableServer
     * @param {(BotnetServer|string)} botnetServer
     * @param {number} threads
     * @param {pid} pid
     * @param {string} scriptPath
     */
    constructor(ns, attackableServer, botnetServer, threads, pid, scriptPath) {
        this.#ns = ns;

        if (!(attackableServer instanceof AttackableServer)) {
            attackableServer = new AttackableServer(ns, attackableServer);
        }
        this.attackableServer = attackableServer;

        if (!(botnetServer instanceof BotnetServer)) {
            botnetServer = new BotnetServer(ns, botnetServer);
        }
        this.botnetServer = botnetServer;

        this.threads = threads;
        this.pid = pid;
        this.scriptPath = scriptPath;
    }

    kill() {
        this.#ns.kill(this.pid)
    }
}