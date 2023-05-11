import {calculateThreadCount} from "/utils/functions/calculateThreadCount";
import * as CONSTANTS from '/constants/BatchAttack';
import {
    SNIPPET_PATH_SHARE,
    SNIPPET_PATH_WAIT_GROW,
    SNIPPET_PATH_WAIT_HACK,
    SNIPPET_PATH_WAIT_WEAKEN
} from '/constants/BatchAttack';
import {SERVER_NAME_HOME} from "/constants/ServerNames";
import {FILENAME_GRACEFUL_KILL} from "/constants/Misc";

export class BotnetServer {
    /** @param {import(".").NS } #ns */
    #ns;


    name;

    character;

    reservedRam = 0;
    reservedThreads = 0;

    /** @param {import(".").NS } ns
     * @param {string} name
     */
    constructor(ns, name) {
        this.#ns = ns;
        this.name = name;

        if (this.name === SERVER_NAME_HOME) {
            this.reservedRam = 64;
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
        return calculateThreadCount(this.availableRam, CONSTANTS.SNIPPET_RAM_COST) - this.reservedThreads;
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

    weakenTargetWithDelay(attackableServer, threads, delay) {
        return this.attackTargetWithDelay(attackableServer, threads, SNIPPET_PATH_WAIT_WEAKEN, delay);
    }

    hackTargetWithDelay(attackableServer, threads, delay) {
        return this.attackTargetWithDelay(attackableServer, threads, SNIPPET_PATH_WAIT_HACK, delay);
    }

    growTargetWithDelay(attackableServer, threads, delay) {
        return this.attackTargetWithDelay(attackableServer, threads, SNIPPET_PATH_WAIT_GROW, delay);
    }

    attackTargetWithDelay(attackableServer, threads, scriptPath, delay) {
        return this.exec(scriptPath, threads, attackableServer.name, delay);
    }

    startSharing() {
        let threadCount = calculateThreadCount(this.availableRam, this.#ns.getScriptRam(SNIPPET_PATH_SHARE));

        if (threadCount > 0) {
            this.exec(SNIPPET_PATH_SHARE, threadCount);
        }
    }

    exec(script, numThreads, ...args) {
        return this.#ns.exec(script, this.name, numThreads, ...args, Date.now());
    }

    ps() {
        return this.#ns.ps(this.name);
    }

    killByPath(scriptPath) {
        let ps = this.ps();
        for (let process of ps) {
            if (process.filename === scriptPath) {
                this.#ns.kill(process.pid, this.name);
            }
        }
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

    getAvailableBatchCapacity(batchThreads) {
        return Math.floor(this.currentThreadCapacity / batchThreads);
    }

    reserveThreads(numberOfThreads) {
        this.reservedThreads += numberOfThreads;
    }
}