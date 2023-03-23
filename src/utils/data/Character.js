import {SERVER_NAME_HOME} from "/constants/ServerNames";

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
        return this.#ns.getServerMaxRam(SERVER_NAME_HOME);
    }

    get numberOfPortOpeners() {
        let canHackThisManyPorts = 0;

        if (this.#ns.fileExists("BruteSSH.exe", SERVER_NAME_HOME)) {
            canHackThisManyPorts++;
        }
        if (this.#ns.fileExists("FTPCrack.exe", SERVER_NAME_HOME)) {
            canHackThisManyPorts++;
        }
        if (this.#ns.fileExists("relaySMTP.exe", SERVER_NAME_HOME)) {
            canHackThisManyPorts++;
        }
        if (this.#ns.fileExists("HTTPWorm.exe", SERVER_NAME_HOME)) {
            canHackThisManyPorts++;
        }
        if (this.#ns.fileExists("SQLInject.exe", SERVER_NAME_HOME)) {
            canHackThisManyPorts++;
        }

        return canHackThisManyPorts;
    }
}