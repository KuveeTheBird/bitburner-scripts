import {Server} from '/utils/data/Server.js';
import {Character} from '/utils/data/Character.js';
import * as CONSTANTS from '/utils/data/Constants';

/** @param {NS} ns */
export async function main(ns) {
    const server = new Server(ns, 'n00dles'); //TODO: add server selection
    // const server = new Server(ns, 'foodnstuff'); //TODO: add server selection
    const hackRatio = 0.9;
    const timeBetweenPhases = 100;
    const minTimeBetweenAttacks = 5 * timeBetweenPhases;

    await prepareServer(ns, server);


    await manageAttacks(ns, server, hackRatio, timeBetweenPhases, minTimeBetweenAttacks);
}

/**
 * @param {NS} ns
 * @param {Server} server
 * @param {float} hackRatio
 * @param {number} timeBetweenPhases
 * @param {number} minTimeBetweenAttacks
 */
async function manageAttacks(ns, server, hackRatio, timeBetweenPhases, minTimeBetweenAttacks) {
    //TODO: expected finishing order HWGW
    //TODO: start after-hack-weaken - right away - duration: X ms, delay: 0 ms
    //TODO: start hack - should end 200ms before prev weaken - duration: Y ms, delay: X - Y - 200ms
    //TODO: start grow - should end 200ms after prev weaken - duration: Z ms, delay: X - Z + 200ms
    //TODO: start after-grow-weaken - should end 200ms after grow (400 ms after starter weaken) - duration: X ms, delay: 400 ms
    //TODO: wait timeBetweenAttackStarts - 4*timeBetweenPhases ms

    while (true) {
        // ns.exec('hacking_dispatcher.js', 'home');
        let attackParams;

        while(hackRatio > 0) {
            attackParams = calculateAttackParams(ns, server, hackRatio, minTimeBetweenAttacks);

            if (attackParams.totalRam > server.character.homeFreeRam) {
                hackRatio -= 0.1;
            } else {
                ns.printf('Attacking %s with ratio of %s', server.name, hackRatio);
                break;
            }
        }

        if (hackRatio <= 0) {
            return;
        }


        let hackDelay = attackParams.weakenTime - attackParams.hackTime - timeBetweenPhases;
        let growDelay = attackParams.weakenTime - attackParams.growTime + timeBetweenPhases;
        let weakenDelay = timeBetweenPhases * 2;


        weakenServerWithDelay(ns, server, attackParams.hackWeakenThreads, 0);
        // weakenServer(ns, server, attackParams.hackWeakenThreads);
        hackServerWithDelay(ns, server, attackParams.hackThreads, hackDelay);
        growServerWithDelay(ns, server, attackParams.growThreads, growDelay);
        weakenServerWithDelay(ns, server, attackParams.growWeakenThreads, weakenDelay);

        let waitTime = attackParams.timeBetweenAttacksStart > minTimeBetweenAttacks ? attackParams.timeBetweenAttacksStart : minTimeBetweenAttacks;
        await ns.asleep(waitTime);
    }
}

/**
 * @param {NS} ns
 * @param {Server} server
 * @param {float} hackRatio
 * @param {number} minTimeBetweenAttacks
 */
function calculateAttackParams(ns, server, hackRatio, minTimeBetweenAttacks) {
    let growThreads = calculateReGrowThreads(ns, server, hackRatio);
    let growRam = CONSTANTS.SNIPPET_RAM_COST * growThreads;
    let growTime = server.growTime;


    let hackThreads = server.calculateHackThreadsForRatio(hackRatio);
    let hackRam = CONSTANTS.SNIPPET_RAM_COST * hackThreads;
    let hackTime = server.hackTime;

    let growSecurityIncrease = growThreads * CONSTANTS.GROW_THREAD_SECURITY_INCREASE;
    let growWeakenThreads = Math.ceil(growSecurityIncrease / CONSTANTS.WEAKEN_THREAD_SECURITY_DECREASE);
    let growWeakenRam = CONSTANTS.SNIPPET_RAM_COST * growWeakenThreads;

    let hackSecurityIncrease = CONSTANTS.HACK_THREAD_SECURITY_INCREASE * hackThreads;
    let hackWeakenThreads = Math.ceil(hackSecurityIncrease / CONSTANTS.WEAKEN_THREAD_SECURITY_DECREASE);
    let hackWeakenRam = CONSTANTS.SNIPPET_RAM_COST * hackWeakenThreads;

    let weakenTime = server.weakenTime;

    let totalRam = growRam + hackRam + growWeakenRam + hackWeakenRam;
    let parralelAttacksCount = Math.floor(server.character.homeFreeRam / totalRam);
    let timeBetweenAttacksStart = Math.ceil(weakenTime / (parralelAttacksCount));
    //TODO: handle minTimeBetweenAttacks

    return {
        'growThreads': growThreads,
        'growRam': growRam,
        'growTime': growTime,

        'hackThreads': hackThreads,
        'hackRam': hackRam,
        'hackTime': hackTime,

        'growWeakenThreads': growWeakenThreads,
        'growWeakenRam': growWeakenRam,
        'hackWeakenThreads': hackWeakenThreads,
        'hackWeakenRam': hackWeakenRam,
        'weakenTime': weakenTime,

        'totalRam': totalRam,
        'parralelAttacksCount': parralelAttacksCount,
        'timeBetweenAttacksStart': timeBetweenAttacksStart,
    };
}

/**
 * @param {NS} ns
 * @param {Server} server
 * @param {float} hackRatio
 */
function calculateReGrowThreads(ns, server, hackRatio) {
    return Math.ceil(
        ns.growthAnalyze(
            server.name,
            1 / 0.001
        )
    );
}


/**
 * @param {NS} ns
 * @param {Server} server
 */
async function prepareServer(ns, server) {
    if (server.growThreadsToFull > 0) {
        growServer(ns, server, server.growThreadsToFull);
    }

    let weakenThreads = server.calculateWeakenThreads(server.growThreadsToFullSecurityIncrease);
    if (weakenThreads <= 0) {
        return;
    }

    weakenServer(ns, server, weakenThreads);
    await ns.asleep(server.weakenTime + 100);

    // ns.tprintf('Preparing server {%s} is complete.', server.name);
}

/**
 * @param {NS} ns
 * @param {Server} server
 * @param {number} threads
 * @param {number}delay
 */
async function hackServerWithDelay(ns, server, threads, delay) {

    let pid = ns.exec(CONSTANTS.SNIPPET_PATH_WAIT_HACK, 'home', threads, server.name, delay, Date.now());

    // ns.tprintf(
    //     'Starting hack on {%s} with %d threads, approx. time: %ss, delay: %ss - PID: %s',
    //     server.name,
    //     threads,
    //     server.hackTime / 1000,
    //     delay / 1000,
    //     pid
    // );
}

/**
 * @param {NS} ns
 * @param {Server} server
 * @param {number} threads
 * @param {number}delay
 */
async function growServerWithDelay(ns, server, threads, delay) {

    let pid = ns.exec(CONSTANTS.SNIPPET_PATH_WAIT_GROW, 'home', threads, server.name, delay, Date.now());

    // ns.tprintf(
    //     'Starting grow on {%s} with %d threads, approx. time: %ss, delay: %ss - PID: %s',
    //     server.name,
    //     threads,
    //     server.growTime / 1000,
    //     delay / 1000,
    //     pid
    // );
}

/**
 * @param {NS} ns
 * @param {Server} server
 * @param {number} threads
 * @param {number}delay
 */
async function weakenServerWithDelay(ns, server, threads, delay) {

    let pid = ns.exec(CONSTANTS.SNIPPET_PATH_WAIT_WEAKEN, 'home', threads, server.name, delay, Date.now());

    // ns.tprintf(
    //     'Starting weaken on {%s} with %d threads, approx. time: %ss, delay: %ss - PID: %s',
    //     server.name,
    //     threads,
    //     server.weakenTime / 1000,
    //     delay / 1000,
    //     pid
    // );
}

/**
 * @param {NS} ns
 * @param {Server} server
 */
async function growServer(ns, server, growThreadsToFull) {
    let pid = ns.exec(CONSTANTS.SNIPPET_PATH_GROW, 'home', growThreadsToFull, server.name, Date.now());

    // ns.tprintf(
    //     'Starting grow on {%s} with %d grow threads, approx. time: %ss - PID: %s',
    //     server.name,
    //     growThreadsToFull,
    //     server.growTime / 1000,
    //     pid
    // );
}

/**
 * @param {NS} ns
 * @param {Server} server
 * @param {float} weakenThreads
 */
async function weakenServer(ns, server, weakenThreads) {

    let pid = ns.exec(CONSTANTS.SNIPPET_PATH_WEAKEN, 'home', weakenThreads, server.name, Date.now());

    // ns.tprintf(
    //     'Starting weaken on {%s} with %d weaken threads, approx. time: %ss - PID: %s',
    //     server.name,
    //     weakenThreads,
    //     server.weakenTime / 1000,
    //     pid
    // );
}