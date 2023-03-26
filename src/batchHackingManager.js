import {gatherAttackableServers} from "/utils/functions/gatherAttackableServers";
import {gatherBotnetServers} from "/utils/functions/gatherBotnetServers";
import {generateBatchAttackInformation} from "/utils/functions/generateBatchAttackInformation";
import {SERVER_NAME_HOME} from "/constants/ServerNames";
import {TICK} from "/constants/BatchAttack";

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');

    while (true) {
        let preparationPid = ns.exec('hacking_manager.js', SERVER_NAME_HOME);
        if (preparationPid === 0) {
            ns.alert('UNABLE TO START PREPARATION');
            ns.exit();
        }

        while (ns.isRunning(preparationPid)) {
            ns.printf('Waiting for preparation to end, pid: %s', preparationPid);
            await ns.asleep(1000);
        }


        let batchAttacksData = await getBatchAttacksData(ns);

        if (!batchAttacksData.length) {
            ns.printf('Can\'t execute any batches');
            return;
        }

        let attackNumber = 1;
        let singleAttackManagerPids = [];
        for (let batchAttackData of batchAttacksData) {
            singleAttackManagerPids.push(startSingleAttackManager(ns, batchAttackData, attackNumber++));
        }

        ns.printf('Waiting for the single attack manager scripts to end.');
        let wait = true;
        while (wait) {
            await ns.asleep(1000);
            wait = false;
            for (let pid of singleAttackManagerPids) {
                if (ns.isRunning(pid)) {
                    wait = true;
                    break;
                }
            }
        }
    }
}

/**
 *
 * @param {NS} ns
 * @param batchAttackData
 * @param {number} attackNumber
 * @return {number}
 */
function startSingleAttackManager(ns, batchAttackData, attackNumber) {
    let pid = ns.exec('utils/singleAttackManager.js', SERVER_NAME_HOME, 1, attackNumber);
    if (pid === 0) {
        ns.alert('UNABLE TO START SINGLE ATTACK MANAGER');
        ns.exit();
    }

    let portHandle = ns.getPortHandle(attackNumber);
    portHandle.clear();
    portHandle.write(pid);
    portHandle.write(JSON.stringify(batchAttackData));

    return pid;
}

/**
 * @param {NS} ns
 */
async function getBatchAttacksData(ns) {
    let attackableServers = gatherAttackableServers(ns);
    let botnetServerCollection = gatherBotnetServers(ns);

    let batchAttacksData = [];

    let x = 0;
    while (x < 20) {
        x++;
        let batchAttackInformation = generateBatchAttackInformation(ns, attackableServers, botnetServerCollection);

        if (!batchAttackInformation.length) {
            ns.printf('No more batch attack information');
            break;
        }
        let currentBatchAttackInformation = batchAttackInformation[0];

        ns.printf('#%s Reserving for %s', x, currentBatchAttackInformation.name);
        currentBatchAttackInformation.batchReservations = botnetServerCollection.reserveBatches(currentBatchAttackInformation.availableBatchCapacity, currentBatchAttackInformation.batchThreads);
        for (let i in attackableServers) {
            if (attackableServers[i].name === currentBatchAttackInformation.name) {
                attackableServers.splice(i);
                break;
            }
        }

        batchAttacksData.push(currentBatchAttackInformation);
        await ns.asleep(TICK);
    }

    return batchAttacksData;
}