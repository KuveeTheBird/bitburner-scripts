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
        let weakenTime = this.#ns.getWeakenTime(this.name);
        return weakenTime > 0 ? weakenTime : 1;
    }

    get growTime() {
        let growTime = this.#ns.getGrowTime(this.name);
        return growTime > 0 ? growTime : 1;
    }

    get hackTime() {
        let hackTime = this.#ns.getHackTime(this.name);
        return hackTime > 0 ? hackTime : 1;
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
        let growThreads = Math.ceil(
            this.#ns.growthAnalyze(
                this.name,
                1 / (1 - (hackRatio))
            )
        );
        return growThreads > 0 ? growThreads : 1;
    }

    calculateReGrowSecurityIncrease(hackRatio) {
        return this.#ns.growthAnalyzeSecurity(this.calculateReGrowThreads(hackRatio));
    }

    calculateReGrowWeakenThreads(hackRatio) {
        let growWeakenThreads = Math.ceil((this.calculateReGrowSecurityIncrease(hackRatio) / this.#ns.weakenAnalyze(1)) * 1.1 );
        return growWeakenThreads > 0 ? growWeakenThreads : 1;
    }

    calculateHackThreads(hackRatio) {
        let hackThreads = Math.floor(hackRatio / this.hackAnalyze());
        return hackThreads > 0 ? hackThreads : 1;
    }

    calculateHackSecurityIncrease(hackRatio) {
        return this.#ns.hackAnalyzeSecurity(this.calculateHackThreads(hackRatio));
    }

    calculateHackWeakenThreads(hackRatio) {
        let hackWeakenThreads = Math.ceil((this.calculateHackSecurityIncrease(hackRatio) / this.#ns.weakenAnalyze(1)) * 1.1);
        return hackWeakenThreads > 0 ? hackWeakenThreads : 1;
    }
}