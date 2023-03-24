import {PurchasedServer} from "/utils/data/PurchasedServer";
import {PURCHASED_SERVER_NAME_PREFIX, SERVER_NAME_HOME} from "/constants/ServerNames";
import {
    PURCHASED_SERVERS_COST_SAFETY_ADJUSTMENT,
    PURCHASED_SERVERS_HACKING_LEVEL_REQUIREMENTS
} from "/settings/Settings";

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

    get maxPurchasedServerRamSize() {
        return PURCHASED_SERVERS_HACKING_LEVEL_REQUIREMENTS[PURCHASED_SERVERS_HACKING_LEVEL_REQUIREMENTS.length - 1].serverRam;
    }

    get unlockedMaxPurchasedServerRamSize() {
        let unlockedPurchasedServerRamSize;
        let myHackinglevel = this.#ns.getHackingLevel()

        for (let requirement of PURCHASED_SERVERS_HACKING_LEVEL_REQUIREMENTS) {
            if (requirement.hackingLevel > myHackinglevel) {
                break;
            }

            unlockedPurchasedServerRamSize = requirement.serverRam;
        }

        return unlockedPurchasedServerRamSize;
    }

    get limit() {
        return this.#ns.getPurchasedServerLimit();
    }

    get numberOfMissingServers() {
        return this.limit - this.purchasedServers.length;
    }

    get canCreateNewBatch() {
        return this.limit === this.numberOfMissingServers;
    }

    get namesOfCurrentServers() {
        let namesOfCurrentServers = [];
        for (let purchasedServer of this.purchasedServers) {
            namesOfCurrentServers.push(purchasedServer.name);
        }
        return namesOfCurrentServers;
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
        this.#ns.printf('Gracefully killing all current purchased servers.');
        for (let purchasedServer of this.purchasedServers) {
            purchasedServer.killGracefully();
        }
    }

    areAllReadyToBeDeleted() {
        for (let purchasedServer of this.purchasedServers) {
            if (purchasedServer.processCount() > 0) {
                return false;
            }
        }

        return true;
    }

    deleteAll() {
        this.#ns.printf('Starting the deletion of all current purchased servers.');

        let replacementArray = [];
        let allKilled = true;

        for (let purchasedServer of this.purchasedServers) {
            let deleted = purchasedServer.delete();
            if (!deleted) {
                replacementArray.push(purchasedServer);
                allKilled = false;
            }
        }

        this.purchasedServers = replacementArray;
        return allKilled;
    }

    areAllUpgradedToTheCurrentMax() {
        if (!this.purchasedServers.length) {
            return false;
        }

        let currentMaxRamSize = this.unlockedMaxPurchasedServerRamSize;
        let currentServerRamSize = this.purchasedServers[0].maxRam;

        return currentServerRamSize >= currentMaxRamSize;
    }

    areAllUpgradedToTheMax() {
        if (!this.purchasedServers.length) {
            return false;
        }

        for (let purchasedServer of this.purchasedServers) {
            if (purchasedServer.maxRam <  this.maxPurchasedServerRamSize) {
                return false;
            }
        }

        return true;
    }

    canAffordNewBatch(serverRam) {
        return this.canAffordNumberOfServers(serverRam, this.limit);
    }

    canAffordNumberOfServers(serverRam, numberOfServers) {
        let adjustment = PURCHASED_SERVERS_COST_SAFETY_ADJUSTMENT;
        if (adjustment < 1) {
            this.#ns.toast('Inavlid value for PURCHASED_SERVERS_COST_SAFETY_ADJUSTMENT. Using 1 instead.')
            adjustment = 1;
        }
        let myMoney = this.#ns.getServerMoneyAvailable(SERVER_NAME_HOME);
        let serverCost = this.#ns.getPurchasedServerCost(serverRam);
        let totalServerCost = numberOfServers * serverCost;
        let adjustedTotalServerCost = Math.ceil(totalServerCost * adjustment);
        let canAffordNewBatch = myMoney > adjustedTotalServerCost;
        this.#ns.printf('Can afford %s servers with %sGB RAM: %s.', numberOfServers, serverRam, canAffordNewBatch ? 'YES' : 'NO');
        return canAffordNewBatch;
    }

    createNewBatch() {
        let serverRamSize = this.unlockedMaxPurchasedServerRamSize;
        if (!this.canAffordNewBatch(serverRamSize)) {
            return false;
        }

        this.#ns.printf('Starting the creation of a new batch of servers: %s x %sGB', this.limit, serverRamSize);
        let successfulCreations = true;

        for (let serverNum = 0 ; serverNum < this.limit ; serverNum++) {
            let purchasedServerName = PURCHASED_SERVER_NAME_PREFIX + serverRamSize + '-' + serverNum;
            if (!this.purchaseServer(purchasedServerName, serverRamSize)) {
                successfulCreations = false;
            }
        }

        return successfulCreations;
    }

    createMissingMembersOfBatch() {
        if (!this.purchasedServers.length) {
            this.#ns.printf('There is no incomplete batch of servers.');
            return false;
        }

        let serverRamSize = this.purchasedServers[0].maxRam;
        let numberOfServers = this.numberOfMissingServers;
        if (!this.canAffordNumberOfServers(serverRamSize, numberOfServers)) {
            return false;
        }

        this.#ns.printf('Starting the creation of %s missing of servers of currentBatch: %s x %sGB', numberOfServers, this.limit, serverRamSize);
        let successfulCreations = true;
        let namesOfCurrentServers = this.namesOfCurrentServers;

        for (let serverNum = 0 ; serverNum < this.limit ; serverNum++) {
            let purchasedServerName = PURCHASED_SERVER_NAME_PREFIX + serverRamSize + '-' + serverNum;
            if (namesOfCurrentServers.includes(purchasedServerName)) {
                continue;
            }
            if (!this.purchaseServer(purchasedServerName, serverRamSize)) {
                successfulCreations = false;
            }
        }

        return successfulCreations;
    }

    purchaseServer(purchasedServerName, serverRamSize) {
        let serverName =  this.#ns.purchaseServer(purchasedServerName, serverRamSize);
        if (!serverName.length) {
            this.#ns.printf('Unable to purchase server: %s - %sGB', purchasedServerName, serverRamSize);
            return false;
        }

        this.addByName(serverName);
        this.#ns.printf('Successfully purchased server: %s - %sGB', purchasedServerName, serverRamSize);
        return true;
    }
    async upgradeToNewBatch() {
        this.killAllGracefully();
        while (!this.areAllReadyToBeDeleted()) {
            await this.#ns.asleep(1000);
        }
        this.deleteAll();
        this.createNewBatch();
    }
}