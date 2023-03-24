import PurchasedServerCollection from "/utils/data/Collections/PurchasedServerCollection";

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    let purchasedServerCollection = new PurchasedServerCollection(ns);
    purchasedServerCollection.gatherServers();
    if (purchasedServerCollection.areAllUpgradedToTheMax()) {
        ns.printf('All purchased servers are at max capacity based on current Settings.');
        return;
    }

    if (purchasedServerCollection.canCreateNewBatch) {
        purchasedServerCollection.createNewBatch();
    } else if (purchasedServerCollection.numberOfMissingServers > 0) {
        purchasedServerCollection.createMissingMembersOfBatch();
    } else if (!purchasedServerCollection.areAllUpgradedToTheCurrentMax()) {
        await purchasedServerCollection.upgradeToNewBatch();
    }
}