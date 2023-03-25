import {BotnetServer} from "/utils/data/BotnetServer";
import {
    ATTACK_TYPE_GROW,
    ATTACK_TYPE_HACK,
    ATTACK_TYPE_PREPARE_GROW,
    ATTACK_TYPE_PREPARE_WEAKEN,
    ATTACK_TYPE_WEAKEN,
    SNIPPET_PATH_GROW,
    SNIPPET_PATH_WAIT_GROW,
    SNIPPET_PATH_WAIT_HACK,
    SNIPPET_PATH_WAIT_WEAKEN,
    SNIPPET_PATH_WEAKEN
} from "/constants/BatchAttack";

export default class BotnetServerCollection {
    /** @param {import(".").NS } #ns */
    #ns;

    internalCounter = 0;

    /**
     * @type {BotnetServer[]}
     */
    serverObjects = [];

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
        return this.serverObjects.length;
    }

    /**
     * @return {boolean}
     */
    hasNext() {
        return this.internalCounter < this.serverObjects.length;
    }

    /**
     * @returns {BotnetServer}
     */
    getNext() {
        let next = this.serverObjects[this.internalCounter];
        this.internalCounter++;
        return next;
    }

    reset() {
        this.internalCounter = 0;
    }

    serverAlreadyAdded(server) {
        if (!server) {
            return true;
        }

        let serverName = server;
        if (server instanceof BotnetServer) {
            serverName = server.name;
        }

        for (let serverObject of this.serverObjects) {
            if (serverObject.name === serverName) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param {BotnetServer} botnetServer
     */
    add(botnetServer) {
        if (!this.serverAlreadyAdded(botnetServer)) {
            this.serverObjects.push(botnetServer);
        }
    }

    /**
     * @param {string} serverName
     */
    addByName(serverName) {
        if (!this.serverAlreadyAdded(serverName)) {
            this.serverObjects.push(new BotnetServer(this.#ns, serverName));
        }
    }

    /**
     * @param {string} serverName
     */
    removeByName(serverName) {
        for (let i = 0; i < this.serverObjects.length; i++) {
            if (this.serverObjects[i].name === serverName) {
                this.serverObjects.splice(i, 1);
            }
        }
    }

    /**
     * @param {string} serverName
     */
    getByName(serverName) {
        for (let serverObject of this.serverObjects) {
            if (serverObject.name === serverName) {
                return serverObject;
            }
        }

        return false;
    }

    /**
     * @param {string} propertyName
     */
    sortByAsc(propertyName) {
        this.serverObjects.sort(function(a,b) {
            return a[propertyName] - b[propertyName];
        });
    }

    /**
     * @param {string} propertyName
     */
    sortByDesc(propertyName) {
        this.serverObjects.sort(function(a,b) {
            return b[propertyName] - a[propertyName];
        });
    }

    /**
     * @return {number}
     */
    getAvailableAttackThreads() {
        let availableThreads = 0;
        for (let serverObject of this.serverObjects) {
            availableThreads += serverObject.currentThreadCapacity;
        }

        return availableThreads;
    }

    getAvailableBatchCapacity(batchThreads) {
        let availableBatchCapacity = 0;
        for (let serverObject of this.serverObjects) {
            availableBatchCapacity += serverObject.getAvailableBatchCapacity(batchThreads);
        }

        return availableBatchCapacity;
    }

    /**
     * @return {BotnetServer|boolean}
     */
    async getNextWithFreeThreadCapacity() {
        for (let serverObject of this.serverObjects) {
            if (serverObject.currentThreadCapacity > 0) {
                return serverObject;
            }
        }

        return false;
    }

    /**
     *
     * @param {AttackableServer} attackableServer
     * @param {AttackDataCollection} attackDataCollection
     * @return {Promise<void>}
     */
    async fullyWeakenTarget(attackableServer, attackDataCollection) {
        await this.weakenTarget(attackableServer, attackableServer.threadsToFullyWeaken, attackDataCollection);
    }

    /**
     *
     * @param {AttackableServer} attackableServer
     * @param {AttackDataCollection} attackDataCollection
     * @return {Promise<void>}
     */
    async fullyGrowTarget(attackableServer, attackDataCollection) {
        await this.growTarget(attackableServer, attackableServer.threadsToFullyGrow, attackDataCollection);
    }

    /**
     *
     * @param {AttackableServer} attackableServer
     * @param {number} overallThreads
     * @param {AttackDataCollection} attackDataCollection
     * @return {Promise<boolean>}
     */
    async weakenTarget(attackableServer, overallThreads, attackDataCollection) {
        if (attackDataCollection.getThreadsByAttackableServerAndAttackType(attackableServer, [ATTACK_TYPE_PREPARE_GROW, ATTACK_TYPE_WEAKEN, ATTACK_TYPE_GROW, ATTACK_TYPE_HACK]) > 0) {
            return;
        }

        await this.attackTarget(attackableServer, overallThreads, SNIPPET_PATH_WEAKEN, attackDataCollection);
    }

    /**
     *
     * @param {AttackableServer} attackableServer
     * @param {number} overallThreads
     * @param {AttackDataCollection} attackDataCollection
     * @return {Promise<boolean>}
     */
    async growTarget(attackableServer, overallThreads, attackDataCollection) {
        if (attackDataCollection.getThreadsByAttackableServerAndAttackType(attackableServer, [ATTACK_TYPE_PREPARE_WEAKEN, ATTACK_TYPE_WEAKEN, ATTACK_TYPE_GROW, ATTACK_TYPE_HACK]) > 0) {
            return;
        }

        await this.attackTarget(attackableServer, overallThreads, SNIPPET_PATH_GROW, attackDataCollection);
    }

    async attackTarget(attackableServer, overallThreads, scriptPath, attackDataCollection) {
        let activeAttackThreads = attackDataCollection.getThreadsByAttackableServerAndScriptPath(attackableServer, scriptPath);

        overallThreads -= activeAttackThreads;
        this.#ns.printf('Trying to attack target server: %s with %s | Required number of threads: %s | Active attack threads: %s', attackableServer.name, scriptPath, overallThreads, activeAttackThreads);

        while (overallThreads > 0) {
            let botnetServer = await this.getNextWithFreeThreadCapacity();
            if (false === botnetServer) {
                // this.#ns.printf('No more free capacity to weaken %s', attackableServer.name);
                return false;
            }
            let botnetServerCapacity = botnetServer.currentThreadCapacity;
            let botnetServerName = botnetServer.name;
            let threads = botnetServerCapacity > overallThreads ? overallThreads : botnetServerCapacity;

            // this.#ns.printf('Next botnet server with free thread capacity: %s, available current threads: %s. Using %s/%s of required threads.', botnetServerName, botnetServerCapacity, threads, overallThreads);

            let pid = botnetServer.attackTarget(attackableServer, threads, scriptPath);
            if (pid > 0) {
                this.#ns.printf('Attacking target server: %s with %s | Botnet server: %s, threads %s, PID: %s', attackableServer.name, scriptPath, botnetServerName, threads, pid);
                overallThreads -= threads;
            }

            await this.#ns.asleep(1);
        }
    }

    async weakenTargetWithDelay(attackableServer, overallThreads, delay) {
        await this.attackTargetWithDelay(attackableServer, overallThreads, delay, SNIPPET_PATH_WAIT_WEAKEN);
    }

    async growTargetWithDelay(attackableServer, overallThreads, delay) {
        await this.attackTargetWithDelay(attackableServer, overallThreads, delay, SNIPPET_PATH_WAIT_GROW);
    }

    async hackTargetWithDelay(attackableServer, overallThreads, delay) {
        await this.attackTargetWithDelay(attackableServer, overallThreads, delay, SNIPPET_PATH_WAIT_HACK);
    }
    async attackTargetWithDelay(attackableServer, overallThreads, delay, scriptPath) {
        while (overallThreads > 0) {
            let botnetServer = await this.getNextWithFreeThreadCapacity();
            if (false === botnetServer) {
                return false;
            }

            let botnetServerCapacity = botnetServer.currentThreadCapacity;
            let botnetServerName = botnetServer.name;
            let threads = botnetServerCapacity > overallThreads ? overallThreads : botnetServerCapacity;

            // this.#ns.printf('Next botnet server with free thread capacity: %s, available current threads: %s. Using %s/%s of required threads.', botnetServerName, botnetServerCapacity, threads, overallThreads);

            let pid = botnetServer.attackTargetWithDelay(attackableServer, threads, scriptPath, delay);
            if (pid > 0) {
                // this.#ns.printf('Executing %s target server: %s | Botnet server: %s, threads %s, PID: %s', scriptPath, attackableServer.name, botnetServerName, threads, pid);
                overallThreads -= threads;
            } else {
                this.#ns.tprintf('UNABLE TO EXECUTE %s target server: %s | Botnet server: %s, threads %s, PID: %s', scriptPath, attackableServer.name, botnetServerName, threads, pid);
                this.#ns.tprintf('Server usedRam: %s, maxRam: %s, availableRam: %s', botnetServer.usedRam, botnetServer.maxRam, botnetServer.availableRam);
                let scriptRam = this.#ns.getScriptRam(scriptPath);
                this.#ns.tprintf('ScriptPath: %s, scriptMemusage', scriptPath, scriptRam);
                this.#ns.tprintf('Server threadCapacity: %s, current threadCapacity: %s', botnetServer.maxRam / scriptRam, botnetServer.availableRam /scriptRam);
                this.#ns.exit();
            }

            await this.#ns.asleep(1);
        }
    }

    reserveBatches(numberOfBatches, numberOfThreadsInBatch) {
        let reservables = this.serverObjects.filter(function (botnetServer) {
            return botnetServer.currentThreadCapacity > numberOfThreadsInBatch;
        }).sort(function(a, b) {
            return a.currentThreadCapacity - b.currentThreadCapacity;
        });

        let reservations = [];

        this.#ns.printf('Want to reserve %s x %s threads', numberOfBatches, numberOfThreadsInBatch);
        let batchesToReserve = numberOfBatches;
        for (let botnetServer of reservables) {
            if (batchesToReserve === 0) {
                break;
            }

            let botnetBatchCapacity = botnetServer.getAvailableBatchCapacity(numberOfThreadsInBatch);
            let reservedThreads = 0;
            let reservedBatches = 0;
            if (botnetBatchCapacity < batchesToReserve) {
                reservedBatches = botnetBatchCapacity
            } else {
                reservedBatches = batchesToReserve
            }

            batchesToReserve -= reservedBatches;
            reservedThreads = reservedBatches * numberOfThreadsInBatch;
            botnetServer.reserveThreads(reservedThreads);

            reservations.push({
                name: botnetServer.name,
                reservedThreads: reservedThreads,
                reservedBatches: reservedBatches,
            });
        }

        return reservations;
    }
}