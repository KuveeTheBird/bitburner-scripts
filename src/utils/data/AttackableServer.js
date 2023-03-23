import {Character} from "/utils/data/Character";
import * as CONSTANTS from "/constants/BatchAttack";

export class AttackableServer {
    /** @param {import(".").NS } #ns */
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

    get moneyAvailable() {
        let serverMoneyAvailable = this.#ns.getServerMoneyAvailable(this.name);
        return serverMoneyAvailable > 0 ? serverMoneyAvailable : 1;
    }

    get maxMoney() {
        return this.#ns.getServerMaxMoney(this.name);
    }

    get missingMoneyRatio() {
        return this.maxMoney / this.moneyAvailable;
    }

    get securityLevel() {
        return this.#ns.getServerSecurityLevel(this.name);
    }

    get minSecurityLevel() {
        return this.#ns.getServerMinSecurityLevel(this.name);
    }

    get securityDiff() {
        return this.securityLevel - this.minSecurityLevel;
    }

    get threadsToFullyWeaken() {
        return Math.ceil(this.securityDiff / CONSTANTS.WEAKEN_THREAD_SECURITY_DECREASE);
    }

    get threadsToFullyGrow() {
        return Math.ceil(this.#ns.growthAnalyze(this.name, this.missingMoneyRatio));
    }

    get weakenTime() {
        return this.#ns.getWeakenTime(this.name);
    }

    get growTime() {
        return this.#ns.getGrowTime(this.name);
    }

    get hackTime() {
        return this.#ns.getHackTime(this.name);
    }


    get prepared() {
        if (this.moneyAvailable < this.maxMoney) {
            return false;
        }

        if (this.threadsToFullyWeaken > 0) {
            return false;
        }

        return true;
    }

    /**
     * @param {AttackableServer} attackableServer
     */
    equals(attackableServer) {
        return attackableServer.name === this.name;
    }

    hackAnalyze() {
        return this.#ns.hackAnalyze(this.name);
    }

    calculateReGrowThreads(hackRatio) {
        return Math.ceil(
            this.#ns.growthAnalyze(
                this.name,
                1 / (1 - (hackRatio))
            )
        );
    }

    calculateReGrowSecurityIncrease(hackRatio) {
        return this.#ns.growthAnalyzeSecurity(this.calculateReGrowThreads(hackRatio));
    }

    calculateReGrowWeakenThreads(hackRatio) {
        return Math.ceil((this.calculateReGrowSecurityIncrease(hackRatio) / this.#ns.weakenAnalyze(1)) * 1.1 );
    }

    calculateHackThreads(hackRatio) {
        return Math.floor(hackRatio / this.hackAnalyze());
    }

    calculateHackSecurityIncrease(hackRatio) {
        return this.#ns.hackAnalyzeSecurity(this.calculateHackThreads(hackRatio));
    }

    calculateHackWeakenThreads(hackRatio) {
        return Math.ceil((this.calculateHackSecurityIncrease(hackRatio) / this.#ns.weakenAnalyze(1)) * 1.1);
    }
}