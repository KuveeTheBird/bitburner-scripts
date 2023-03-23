import {PurchasedServer} from "/utils/data/PurchasedServer";
import {FILENAME_GRACEFUL_KILL} from "/constants/Misc";
import {SERVER_NAME_HOME} from "/constants/ServerNames";

export default class PurchasedServerCollection {
    /** @param {import(".").NS } #ns */
    #ns;

    internalCounter = 0;

    /**
     * @type {PurchasedServer[]}
     */
    purchasedServers = [];

    constructor(ns) {
        this.#ns = ns;
    }

    clone() {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }

    /**
     * @return {number}
     */
    get length() {
        return this.purchasedServers.length;
    }

    /**
     * @return {boolean}
     */
    hasNext() {
        return this.internalCounter < this.purchasedServers.length;
    }

    /**
     * @returns {PurchasedServer}
     */
    getNext() {
        let next = this.purchasedServers[this.internalCounter];
        this.internalCounter++;
        return next;
    }

    reset() {
        this.internalCounter = 0;
    }

    /**
     * @param {PurchasedServer} purchasedServer
     */
    add(purchasedServer) {
        this.purchasedServers.push(purchasedServer);
    }

    /**
     * @param {string} purchasedServerName
     */
    addByName(purchasedServerName) {
        this.purchasedServers.push(new PurchasedServer(this.#ns, purchasedServerName));
    }

    gatherServers() {
        let scannedHosts = this.#ns.scan(SERVER_NAME_HOME);

        for (let scannedHost of scannedHosts) {
            if (this.#ns.getServer(scannedHost).purchasedByPlayer) {
                this.addByName(scannedHost);
            }
        }
    }

    killAllGracefully() {
        for (let purchasedServer of this.purchasedServers) {
            purchasedServer.killGracefully();
        }
    }

    /** @return {boolean} */
    allReadyToBeDeleted() {
        for (let purchasedServer of this.purchasedServers) {
            if (purchasedServer.processCount() > 0) {
                return false;
            }
        }

        return true;
    }

    deleteAll() {
        let replacementArray = [];
        let allKilled = true;

        for (let i in this.purchasedServers) {
            let purchasedServer = this.purchasedServers[i];
            let deleted = purchasedServer.delete();
            if (!deleted) {
                replacementArray.push(purchasedServer);
                allKilled = false;
            }
        }

        this.purchasedServers = replacementArray;
        return allKilled;
    }
}