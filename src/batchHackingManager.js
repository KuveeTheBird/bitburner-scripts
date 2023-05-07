import {gatherAttackableServers} from "/utils/functions/gatherAttackableServers";
import {gatherBotnetServers} from "/utils/functions/gatherBotnetServers";
import {generateBatchAttackInformation} from "/utils/functions/generateBatchAttackInformation";
import {SERVER_NAME_HOME} from "/constants/ServerNames";
import {TICK} from "/constants/BatchAttack";
import {FILE_PATH_TARGET_SERVER} from "/constants/FileNames";
import {findCodingContracts} from "/utils/functions/findCodingContracts";

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');

    while (true) {
        let preparationPid = ns.exec('hacking_manager.js', SERVER_NAME_HOME);
        if (preparationPid === 0) {
            ns.alert('UNABLE TO START PREPARATION');
            ns.exit();
        }

        if (ns.isRunning(preparationPid)) {
            ns.printf('Waiting for preparation to end, pid: %s', preparationPid);
            if (ns.fileExists(FILE_PATH_TARGET_SERVER, SERVER_NAME_HOME)) {
                ns.rm(FILE_PATH_TARGET_SERVER, SERVER_NAME_HOME);
            }

            while (ns.isRunning(preparationPid)) {
                await ns.asleep(1000);
            }
        }

        let codingContracts = findCodingContracts(ns);

        if (codingContracts.length) {
            ns.toast('Will try to solve coding contracts');
            //START SHARE EVERYWHERE

            //RUN SOLVE CODING CONTRACTS
            //WAIT UNTIL SOLVE CODING CONTRACTS FINISHES

            //KILL SHARE EVERYWHERE
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
    let maxBatchTime = -1;
    while (x < 20) {
        x++;
        let batchAttackInformation = generateBatchAttackInformation(ns, attackableServers, botnetServerCollection, maxBatchTime);

        if (!batchAttackInformation.length) {
            ns.printf('No more batch attack information');
            break;
        }
        let currentBatchAttackInformation = batchAttackInformation[0];

        if (x === 1) {
            ns.toast(ns.sprintf('Primary hacking target: %s, profit: %s M/s', currentBatchAttackInformation.name, currentBatchAttackInformation.moneyMillionPerSec));
            ns.write(FILE_PATH_TARGET_SERVER, currentBatchAttackInformation.name, 'w');
        }

        ns.printf('#%s Reserving for %s', x, currentBatchAttackInformation.name);
        currentBatchAttackInformation.batchReservations = botnetServerCollection.reserveBatches(currentBatchAttackInformation.availableBatchCapacity, currentBatchAttackInformation.batchThreads);
        for (let i in attackableServers) {
            if (attackableServers[i].name === currentBatchAttackInformation.name) {
                attackableServers.splice(i);
                break;
            }
        }

        if (maxBatchTime === -1) {
            maxBatchTime = currentBatchAttackInformation.totalBatchesTime;
        }

        batchAttacksData.push(currentBatchAttackInformation);
        await ns.asleep(TICK);
    }

    return batchAttacksData;
}