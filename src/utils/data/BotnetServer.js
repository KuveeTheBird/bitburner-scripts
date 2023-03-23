import {calculateThreadCount} from "/utils/functions/calculateThreadCount";
import * as CONSTANTS from '/utils/data/Constants';

export class BotnetServer {
    /** @param {import(".").NS } #ns */
    #ns;


    name;

    character;

    reservedRam = 0;

    constructor(ns, name) {
        this.#ns = ns;
        this.name = name;

        if (this.name === 'home') {
            this.reservedRam = 32;
        }

        this.installSnippets();
    }

    get hasRootAccess() {
        return this.#ns.hasRootAccess(this.name);
    }

    get maxRam() {
        return this.#ns.getServerMaxRam(this.name);
    }

    get usedRam() {
        return this.#ns.getServerUsedRam(this.name);
    }

    get availableRam() {
        return this.maxRam - this.usedRam - this.reservedRam;
    }

    get maxThreadCapacity() {
        return calculateThreadCount(this.maxRam, CONSTANTS.SNIPPET_RAM_COST);
    }

    get currentThreadCapacity() {
        return calculateThreadCount(this.availableRam, CONSTANTS.SNIPPET_RAM_COST);
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
        this.#ns.scp(fileName, this.name, 'home');
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