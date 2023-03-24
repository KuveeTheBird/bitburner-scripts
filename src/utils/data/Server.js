import {Character} from '/utils/data/Character.js';
import * as CONSTANTS from '/constants/BatchAttack';
import {SERVER_NAME_HOME} from "/constants/ServerNames";

export class Server {

    /** @param {import(".").NS } #ns */
    #ns;

    name;

    distance_from_home;

    children;

    parent;

    character;

    reservedRam = 0;

    /**
     * @param {import(".").NS } ns
     * @param {string} name
     * @param {int} distance_from_home
     * @param {Server} parent
     * @param {Character} character
     * */
    constructor(ns, name, distance_from_home, parent, character) {
        this.#ns = ns;
        this.name = name;
        this.distance_from_home = distance_from_home || 0;
        this.children = [];
        this.parent = parent;

        if (typeof character === "undefined") {
            this.character = new Character(ns);
        } else {
            this.character = character;
        }

        if (this.name === SERVER_NAME_HOME) {
            this.reservedRam = 32;
        }

        this.installSnippets();
        this.gatherChildren();
    }

    ////////////////////
    //STANDARD GETTERS//
    ////////////////////
    get growth() {
        return this.#ns.getServerGrowth(this.name);
    }

    get growTime() {
        return this.#ns.getGrowTime(this.name);
    }

    get hackTime() {
        return this.#ns.getHackTime(this.name);
    }

    get hasRootAccess() {
        return this.#ns.hasRootAccess(this.name);
    }

    get maxMoney() {
        return this.#ns.getServerMaxMoney(this.name);
    }

    get maxRam() {
        return this.#ns.getServerMaxRam(this.name);
    }

    get minSecurityLevel() {
        return this.#ns.getServerMinSecurityLevel(this.name);
    }

    get moneyAvailable() {
        let serverMoneyAvailable = this.#ns.getServerMoneyAvailable(this.name);
        return serverMoneyAvailable > 0 ? serverMoneyAvailable : 1;
    }

    get numPortsRequired() {
        return this.#ns.getServerNumPortsRequired(this.name);
    }

    get requiredHackingLevel() {
        return this.#ns.getServerRequiredHackingLevel(this.name);
    }

    get securityLevel() {
        return this.#ns.getServerSecurityLevel(this.name);
    }

    get usedRam() {
        return this.#ns.getServerUsedRam(this.name);
    }

    get weakenTime() {
        return this.#ns.getWeakenTime(this.name);
    }

    get serverDetails() {
        return this.#ns.getServer(this.name);
    }

    /////////////////////
    //MY CUSTOM GETTERS//
    /////////////////////
    get availableRam() {
        return this.maxRam - this.usedRam - this.reservedRam;
    }

    get backdoorInstalled() {
        return this.serverDetails.backdoorInstalled;
        // return false;
    }

    get neighbours() {
        return this.#ns.scan(this.name);
    }

    get hackable() {
        return (this.requiredHackingLevel <= this.character.hackingLevel);
    }

    get canHaveMoney() {
        return this.maxMoney > 0;
    }

    get flatChildren() {
        let flatChildren = [];

        flatChildren.push(this);
        for (let child of this.children) {
            flatChildren = flatChildren.concat(child.flatChildren);
        }

        return flatChildren;
    }

    get flatRootChildren() {
        let flatRootChildren = [];

        if (this.hasRootAccess) {
            flatRootChildren.push(this)
        }

        for (let i in this.children) {
            flatRootChildren = flatRootChildren.concat(this.children[i].flatRootChildren);
        }

        return flatRootChildren;
    }

    get hackableChildren() {
        let hackableChildren = [];

        if (this.hackable && this.canHaveMoney) {
            hackableChildren.push(this)
        }

        for (let i in this.children) {
            hackableChildren = hackableChildren.concat(this.children[i].hackableChildren);
        }

        return hackableChildren;

    }

    get threadsToFullyWeaken() {
        return Math.ceil((this.securityLevel - this.minSecurityLevel) / CONSTANTS.WEAKEN_THREAD_SECURITY_DECREASE);
    }

    get missingMoneyRatio() {
        return this.maxMoney / this.moneyAvailable;
    }

    get growThreadsToFull() {
        return Math.ceil(this.#ns.growthAnalyze(this.name, this.missingMoneyRatio));
    }

    get growThreadsToFullSecurityIncrease() {
        return this.growThreadsToFull * CONSTANTS.GROW_THREAD_SECURITY_INCREASE;
    }

    /////////////
    //FUNCTIONS//
    /////////////
    gatherChildren() {
        let neighbours = this.neighbours;

        for (let i in neighbours) {
            let targetServer = neighbours[i];
            if (targetServer === this.parent) {
                continue;
            }

            let childServer = new Server(this.#ns, targetServer, this.distance_from_home+1, this.name, this.character);
            childServer.gainRootAccess();

            this.children.push(childServer);
        }
    }

    tree(type, depth) {
        if (typeof depth === "undefined") {
            depth = 0;
        }

        if (typeof type === 'undefined') {
            this.#ns.tprintf(
                '[%s]%s%s',
                this.hasRootAccess ? '+' : '-',
                '-'.repeat(depth),
                this.name
            );
        } else if (type === 'backdoor') {
            this.#ns.tprintf(
                '[%s]%s%s - %s',
                this.hasRootAccess ? '+' : '-',
                '-'.repeat(depth),
                this.name,
                this.backdoorInstalled ? 'BACKDOOR INSTALLED' : 'CLOSED'
            );
        } else if (type === 'details') {
            this.#ns.tprintf(
                '[%s]%s%s - (H:%d, R: %s/%s{%s%%})',
                this.hasRootAccess ? '+' : '-',
                '-'.repeat(depth),
                this.name,
                this.requiredHackingLevel,
                this.usedRam,
                this.maxRam,
                (this.usedRam/this.maxRam)*100
            );
        }



        for (let i in this.children) {
            this.children[i].tree(type, depth+1);
        }
    }

    gainRootAccess() {
        if (this.hasRootAccess) {
            return;
        }

        if (this.character.numberOfPortOpeners < this.numPortsRequired) {
            return;
        }

        if (this.#ns.fileExists("BruteSSH.exe", SERVER_NAME_HOME)) {
            this.#ns.brutessh(this.name);
        }
        if (this.#ns.fileExists("FTPCrack.exe", SERVER_NAME_HOME)) {
            this.#ns.ftpcrack(this.name);
        }
        if (this.#ns.fileExists("relaySMTP.exe", SERVER_NAME_HOME)) {
            this.#ns.relaysmtp(this.name);
        }
        if (this.#ns.fileExists("HTTPWorm.exe", SERVER_NAME_HOME)) {
            this.#ns.httpworm(this.name);
        }
        if (this.#ns.fileExists("SQLInject.exe", SERVER_NAME_HOME)) {
            this.#ns.sqlinject(this.name);
        }

        this.#ns.nuke(this.name);

        this.#ns.toast('Gained root on new server: ' + this.name);

    }

    ps() {
        return this.#ns.ps(this.name);
    }

    isFileRunning(fileName, args) {
        let ps = this.ps();

        if (ps.length <= 0) {
            return false
        }

        for (let i in ps) {
            let process = ps[i];

            if (process.filename !== fileName) {
                continue;
            }

            if (typeof args !== 'undefined') {
                if (typeof process.args === 'undefined') {
                    continue;
                } else if (Array.isArray(args)) {
                    this.#ns.alert('Array "ARGS" matching not implemented yet') //TODO:
                } else if (!process.args.includes(args)) {
                    continue;
                }
            }
            return process;
        }

        return false;

    }

    kill(process) {
        this.#ns.killall(this.name);
        /*
        this.#ns.tprintf(
            'Args: %s, typeof Args: %s',
            process.args,
            typeof process.args
        );

        if (process.args.length > 0) {
            this.#ns.kill(process.filename, this.name, process.args);
        } else {
            this.#ns.kill(process.filename, this.name);
        }
        */
    }

    scp(fileName) {
        this.#ns.scp(fileName, this.name, 'home');
    }

    exec(script, numThreads, args) {
        return this.#ns.exec(script, this.name, numThreads, args);
    }

    execWithMaxRam(script, args) {
        let scriptRam = this.#ns.getScriptRam(script);
        let numThreads = Math.floor(this.availableRam / scriptRam);
        if (numThreads > 0) {
            return this.exec(script, numThreads, args);
        }
    }

    hackAnalyze() {
        return this.#ns.hackAnalyze(this.name);
    }

    calculateHackThreadsForRatio(hackRatio) {
        return Math.floor(hackRatio / this.hackAnalyze());
    }

    calculateWeakenThreads(additionalSecurity) {
        let baseSecurity = this.securityLevel - this.minSecurityLevel;
        if (typeof additionalSecurity !== 'undefined' && additionalSecurity > 0) {
            baseSecurity += additionalSecurity;
        }
        return Math.ceil(baseSecurity / CONSTANTS.WEAKEN_THREAD_SECURITY_DECREASE);
    }

    calculateHackThreadsForRatioSecurityIncrease(hackRatio) {
        return this.calculateHackThreadsForRatio(hackRatio * CONSTANTS.HACK_THREAD_SECURITY_INCREASE);
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