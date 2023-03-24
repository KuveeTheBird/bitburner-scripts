import {FILENAME_GRACEFUL_KILL} from "/constants/Misc";

export class PurchasedServer {
    /** @type {import(".").NS } #ns */
    #ns;

    /** @type {string} */
    name;

    constructor(ns, name) {
        this.#ns = ns;
        this.name = name;
    }

    killGracefully() {
        this.#ns.write(FILENAME_GRACEFUL_KILL, '', 'w');;
        this.#ns.scp(FILENAME_GRACEFUL_KILL, this.name);
        this.#ns.rm(FILENAME_GRACEFUL_KILL);
    }

    /** @return {ProcessInfo[]} */
    ps() {
        return this.#ns.ps(this.name);
    }

    /** @return {number} */
    processCount() {
        return this.ps().length;
    }

    delete() {
        return this.#ns.deleteServer(this.name);
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
}