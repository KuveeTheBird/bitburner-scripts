import {SERVER_NAME_HOME} from "/constants/ServerNames";
import {STANDARD_PROGRAMS} from "/constants/FileNames";


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

        for (let programName of STANDARD_PROGRAMS) {
            if (this.#ns.fileExists(programName, SERVER_NAME_HOME)) {
                canHackThisManyPorts++;
            }
        }

        return canHackThisManyPorts;
    }
}