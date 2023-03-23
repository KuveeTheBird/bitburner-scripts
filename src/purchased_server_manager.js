import PurchasedServerCollection from "/utils/data/Collections/PurchasedServerCollection";

/** @param {NS} ns */
export async function main(ns) {
    let purchasedServerCollection = new PurchasedServerCollection(ns);
    purchasedServerCollection.gatherServers();


}