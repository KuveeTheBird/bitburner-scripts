export class Character {
    /** @param {import(".").NS } #ns */
    #ns;

    constructor(ns) {
        this.#ns = ns;
    }

    get hackingLevel() {
        return this.#ns.getHackingLevel();
    }

    get homeFreeRam() {
        return this.#ns.getServerMaxRam("home");
    }

    get numberOfPortOpeners() {
        let canHackThisManyPorts = 0;

        if (this.#ns.fileExists("BruteSSH.exe", 'home')) {
            canHackThisManyPorts++;
        }
        if (this.#ns.fileExists("FTPCrack.exe", 'home')) {
            canHackThisManyPorts++;
        }
        if (this.#ns.fileExists("relaySMTP.exe", 'home')) {
            canHackThisManyPorts++;
        }
        if (this.#ns.fileExists("HTTPWorm.exe", 'home')) {
            canHackThisManyPorts++;
        }
        if (this.#ns.fileExists("SQLInject.exe", 'home')) {
            canHackThisManyPorts++;
        }

        return canHackThisManyPorts;
    }
}