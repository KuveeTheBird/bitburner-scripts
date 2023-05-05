import {
    HACKNET_UPGRADE_GENERATE_CODING_CONTRACT,
    HACKNET_UPGRADE_IMPROVE_GYM_TRAINING,
    HACKNET_UPGRADE_IMPROVE_STUDYING,
    HACKNET_UPGRADE_INCREASE_MAXIMUM_MONEY,
    HACKNET_UPGRADE_REDUCE_MINIMUM_SECURITY,
    HACKNET_UPGRADE_SELL_FOR_MONEY
} from "/constants/Hacknet";
import {ALLOWED_HASHNET_SPENDINGS, HASHNET_BASE_PRODUCTION_THRESHOLD} from "/settings/Settings";
import {SERVER_NAME_HOME} from "/constants/ServerNames";
import {FILE_PATH_TARGET_SERVER, FILE_SQLINJECT} from "/constants/FileNames";

/** @param {NS} ns */
export async function main(ns) {
    let player = ns.getPlayer();
    let hacknet = ns.hacknet;
    let numberOfNodes = hacknet.numNodes();

    spendHashes(ns);

    if (isProductionThresholdReached(ns) || !ns.fileExists(FILE_SQLINJECT, SERVER_NAME_HOME)) {
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

    let threshold = HASHNET_BASE_PRODUCTION_THRESHOLD * moneyMultiplier * costMultiplier;

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

    let targetServer = ns.fileExists(FILE_PATH_TARGET_SERVER) ? ns.read(FILE_PATH_TARGET_SERVER) : false;
    let weakenTargetServer = false;
    if (targetServer && ns.getServerMinSecurityLevel(targetServer) > 1) {
        weakenTargetServer = true;
    }
    // ns.toast(targetServer);

    let hashCosts = [];
    for (let hashItem of ALLOWED_HASHNET_SPENDINGS) {
        hashCosts.push(hacknet.hashCost(hashItem));
    }
    let minHashCost = Math.min(...hashCosts);
    if (hacknet.hashCapacity() > minHashCost) {
        let hashCost = 0;

        hashCost = hacknet.hashCost(HACKNET_UPGRADE_IMPROVE_STUDYING);
        if (
            ALLOWED_HASHNET_SPENDINGS.includes(HACKNET_UPGRADE_IMPROVE_STUDYING)
            && hacknet.numHashes() > hashCost
        ) {
            if (hacknet.spendHashes(HACKNET_UPGRADE_IMPROVE_STUDYING)) {
                ns.toast(
                    ns.sprintf('Spent %d hashes to improve studying', hashCost)
                );
            }
        }

        hashCost = hacknet.hashCost(HACKNET_UPGRADE_IMPROVE_GYM_TRAINING);
        if (
            ALLOWED_HASHNET_SPENDINGS.includes(HACKNET_UPGRADE_IMPROVE_GYM_TRAINING)
            && hacknet.numHashes() > hashCost
        ) {
            if (hacknet.spendHashes(HACKNET_UPGRADE_IMPROVE_GYM_TRAINING)) {
                ns.toast(
                    ns.sprintf('Spent %d hashes to improve gym training', hashCost)
                );
            }
        }

        hashCost = hacknet.hashCost(HACKNET_UPGRADE_REDUCE_MINIMUM_SECURITY);
        if (
            ALLOWED_HASHNET_SPENDINGS.includes(HACKNET_UPGRADE_REDUCE_MINIMUM_SECURITY)
            && targetServer
            && weakenTargetServer
            && hacknet.numHashes() > hashCost
        ) {
            if (hacknet.spendHashes(HACKNET_UPGRADE_REDUCE_MINIMUM_SECURITY, targetServer)) {
                ns.toast(
                    ns.sprintf('Spent %d hashes to reduce security of: %s', hashCost, targetServer)
                );
            }
        }

        hashCost = hacknet.hashCost(HACKNET_UPGRADE_INCREASE_MAXIMUM_MONEY);
        if (
            ALLOWED_HASHNET_SPENDINGS.includes(HACKNET_UPGRADE_INCREASE_MAXIMUM_MONEY)
            && targetServer
            && hacknet.numHashes() > hashCost
        ) {
            if (hacknet.spendHashes(HACKNET_UPGRADE_INCREASE_MAXIMUM_MONEY, targetServer)) {
                ns.toast(
                    ns.sprintf('Spent %d hashes to increase maximum money of: %s', hashCost, targetServer)
                );
            }
        }

        hashCost = hacknet.hashCost(HACKNET_UPGRADE_GENERATE_CODING_CONTRACT);
        if (
            ALLOWED_HASHNET_SPENDINGS.includes(HACKNET_UPGRADE_GENERATE_CODING_CONTRACT)
            && targetServer
            && hacknet.numHashes() > hashCost
        ) {
            if (hacknet.spendHashes(HACKNET_UPGRADE_GENERATE_CODING_CONTRACT, targetServer)) {
                ns.toast(
                    ns.sprintf('Spent %d hashes to generate coding contract', hashCost)
                );
            }
        }

        return true;
    }

    return false;
}