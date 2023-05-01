import {
    HACKNET_BASE_PRODUCTION_THRESHOLD,
    HACKNET_UPGRADE_IMPROVE_GYM_TRAINING,
    HACKNET_UPGRADE_IMPROVE_STUDYING,
    HACKNET_UPGRADE_INCREASE_MAXIMUM_MONEY,
    HACKNET_UPGRADE_REDUCE_MINIMUM_SECURITY,
    HACKNET_UPGRADE_SELL_FOR_MONEY
} from "/constants/Hacknet";
import {SERVER_NAME_ECORP, SERVER_NAME_MEGACORP} from "/constants/ServerNames";
import {ALLOWED_HASHNET_SPENDINGS} from "/settings/Settings";

/** @param {NS} ns */
export async function main(ns) {
    let player = ns.getPlayer();
    let hacknet = ns.hacknet;
    let numberOfNodes = hacknet.numNodes();

    spendHashes(ns);

    if (isProductionThresholdReached(ns)) {
        return;
    }

    let targetNumOfNodes = hacknet.maxNumNodes();
    // let targetNumOfNodes = 1;
    if (numberOfNodes < targetNumOfNodes) {
        hacknet.purchaseNode();
    }

    for (let numOfNode = 0; numOfNode < hacknet.numNodes(); numOfNode++) {
        while (hacknet.getLevelUpgradeCost(numOfNode, 1) < player.money) {
            hacknet.upgradeLevel(numOfNode, 1);
            break;
        }

        while (hacknet.getRamUpgradeCost(numOfNode, 1) < player.money) {
            hacknet.upgradeRam(numOfNode, 1);
            break;
        }

        while (hacknet.getCoreUpgradeCost(numOfNode, 1) < player.money) {
            hacknet.upgradeCore(numOfNode, 1);
            break;
        }

        while (hacknet.getCacheUpgradeCost(numOfNode, 1) < player.money) {
            hacknet.upgradeCache(numOfNode, 1);
            break;
        }
    }
}

/** @param {NS} ns */
function isProductionThresholdReached(ns) {

    let multipliers = ns.getPlayer().mults;
    let moneyMultiplier = multipliers.hacknet_node_money;
    let costMultiplier = 1 / ((multipliers.hacknet_node_ram_cost + multipliers.hacknet_node_purchase_cost + multipliers.hacknet_node_level_cost + multipliers.hacknet_node_core_cost) / 4);

    let threshold = HACKNET_BASE_PRODUCTION_THRESHOLD * moneyMultiplier * costMultiplier;

    return calculateTotalProduction(ns) > threshold;
}

/** @param {NS} ns */
function calculateTotalProduction(ns) {
    let hacknet = ns.hacknet;
    let production = 0;

    for (let numOfNode = 0; numOfNode < hacknet.numNodes(); numOfNode++) {
        production += hacknet.getNodeStats(numOfNode).production;
    }

    return production;
}

/** @param {NS} ns */
function spendHashes(ns) {
    let hacknet = ns.hacknet;

    if (spendHashesOnBigUpgrades(ns)) {
        return;
    }

    while (hacknet.numHashes() >= 4) {
        hacknet.spendHashes(HACKNET_UPGRADE_SELL_FOR_MONEY);
    }
}

/** @param {NS} ns */
function spendHashesOnBigUpgrades(ns) {
    if (!isProductionThresholdReached(ns)) {
        return false;
    }

    let hacknet = ns.hacknet;

    let possibleTargetServers = [
        // SERVER_NAME_RHO_CONSTRUCTION,
        // SERVER_NAME_4SIGMA,
        // SERVER_NAME_OMNITEK,
        SERVER_NAME_MEGACORP,
        SERVER_NAME_ECORP,
    ];
    let targetServers = [];
    for (let server of possibleTargetServers) {
        if (ns.getServerMinSecurityLevel(server) > 1) {
            targetServers.push(server);
        }
    }

    let hashCosts = [];
    for (let hashItem of ALLOWED_HASHNET_SPENDINGS) {
        hashCosts.push(hacknet.hashCost(hashItem));
    }
    let minHashCost = Math.min(...hashCosts);
    if (hacknet.hashCapacity() > minHashCost) {
        if (ALLOWED_HASHNET_SPENDINGS.includes(HACKNET_UPGRADE_IMPROVE_STUDYING) && hacknet.numHashes() > hacknet.hashCost(HACKNET_UPGRADE_IMPROVE_STUDYING)) {
            hacknet.spendHashes(HACKNET_UPGRADE_IMPROVE_STUDYING);
        }

        if (ALLOWED_HASHNET_SPENDINGS.includes(HACKNET_UPGRADE_IMPROVE_GYM_TRAINING) && hacknet.numHashes() > hacknet.hashCost(HACKNET_UPGRADE_IMPROVE_GYM_TRAINING)) {
            hacknet.spendHashes(HACKNET_UPGRADE_IMPROVE_GYM_TRAINING);
        }

        if (ALLOWED_HASHNET_SPENDINGS.includes(HACKNET_UPGRADE_REDUCE_MINIMUM_SECURITY) && targetServers.length && hacknet.numHashes() > hacknet.hashCost(HACKNET_UPGRADE_REDUCE_MINIMUM_SECURITY)) {
            hacknet.spendHashes(HACKNET_UPGRADE_REDUCE_MINIMUM_SECURITY, targetServers[0]);
        }

        if (ALLOWED_HASHNET_SPENDINGS.includes(HACKNET_UPGRADE_INCREASE_MAXIMUM_MONEY) && targetServers.length && hacknet.numHashes() > hacknet.hashCost(HACKNET_UPGRADE_INCREASE_MAXIMUM_MONEY)) {
            hacknet.spendHashes(HACKNET_UPGRADE_INCREASE_MAXIMUM_MONEY, targetServers[0]);
        }

        return true;
    }

    return false;
}