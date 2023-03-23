import {Character} from "/utils/data/Character";

export class FlatServer {
    #ns;

    name;

    character;

    constructor(ns, name, character) {

        this.#ns = ns;
        this.name = name;

        if (typeof character === "undefined") {
            this.character = new Character(ns);
        } else {
            this.character = character;
        }
    }

    get hasRootAccess() {
        return this.#ns.hasRootAccess(this.name);
    }

    /** @return {Server} */
    get serverDetails() {
        return this.#ns.getServer(this.name);
    }

    get hackable() {
        return (this.serverDetails.hackDifficulty <= this.character.hackingLevel) && (this.serverDetails.moneyMax > 0);
    }
}