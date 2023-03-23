import {calculateThreadCount} from "/utils/functions/calculateThreadCount";
import * as CONSTANTS from '/constants/BatchAttack';
import {SERVER_NAME_HOME} from "/constants/ServerNames";
import {FILENAME_GRACEFUL_KILL} from "/constants/Misc";

export class BotnetServer {
    /** @param {import(".").NS } #ns */
    #ns;


    name;

    character;

    reservedRam = 0;

    /** @param {import(".").NS } ns
     * @param {string} name
     */
    constructor(ns, name) {
        this.#ns = ns;
        this.name = name;

        if (this.name === SERVER_NAME_HOME) {
            this.reservedRam = 32;
        }

        this.installSnippets();
    }

    get hasRootAccess() {
        return this.#ns.hasRootAccess(this.name);
    }

    get maxRam() {
        let serverMaxRam = this.#ns.getServerMaxRam(this.name);
        if (this.isBeingGracefullyKilled) {
            return 0;
        }
        return serverMaxRam;
    }

    get usedRam() {
        const usedRam = this.#ns.getServerUsedRam(this.name);
        if (this.isBeingGracefullyKilled) {
            return 0;
        }
        return usedRam;
    }

    get availableRam() {
        let availableRam = this.maxRam - this.usedRam - this.reservedRam;
        if (this.isBeingGracefullyKilled) {
            return 0;
        }
        return availableRam;
    }

    get maxThreadCapacity() {
        return calculateThreadCount(this.maxRam, CONSTANTS.SNIPPET_RAM_COST);
    }

    get currentThreadCapacity() {
        return calculateThreadCount(this.availableRam, CONSTANTS.SNIPPET_RAM_COST);
    }

    get isBeingGracefullyKilled() {
        return this.#ns.getServer(this.name).purchasedByPlayer && this.#ns.fileExists(FILENAME_GRACEFUL_KILL, this.name);
    }

    weakenTarget(attackableServer, threads) {
        return this.exec(CONSTANTS.SNIPPET_PATH_WEAKEN, threads, attackableServer.name);
    }

    growTarget(attackableServer, threads) {
        return this.exec(CONSTANTS.SNIPPET_PATH_GROW, threads, attackableServer.name);
    }

    attackTarget(attackableServer, threads, scriptPath) {
        return this.exec(scriptPath, threads, attackableServer.name);
    }

    attackTargetWithDelay(attackableServer, threads, scriptPath, delay) {
        return this.exec(scriptPath, threads, attackableServer.name, delay);
    }

    exec(script, numThreads, ...args) {
        return this.#ns.exec(script, this.name, numThreads, ...args, Date.now());
    }

    ps() {
        return this.#ns.ps(this.name);
    }

    scp(fileName) {
        this.#ns.scp(fileName, this.name, SERVER_NAME_HOME);
    }

    installSnippets() {
        if (!this.hasRootAccess) {
            return;
        }

        for (let snippet of CONSTANTS.SNIPPETS) {
            this.scp(snippet.path);
        }
    }
}