import InfiltrationDataCollection from "/utils/data/Collections/InfiltrationDataCollection";

/** @param {NS} ns */
export async function main(ns) {
    let infiltrationDataCollection = new InfiltrationDataCollection(ns);

    infiltrationDataCollection.debug();
}