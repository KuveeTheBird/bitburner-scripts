import {InfiltrationData} from "/utils/data/InfiltrationData";

export default class InfiltrationDataCollection {
    /** @param {import(".").NS } #ns */
    #ns;

    internalCounter = 0;

    /**
     * @type {InfiltrationData[]}
     */
    innerObjects = [];

    constructor(ns) {
        this.#ns = ns;
        this.collectAll();
    }

    clone() {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }

    /**
     * @return {number}
     */
    get length() {
        return this.innerObjects.length;
    }

    /**
     * @return {boolean}
     */
    hasNext() {
        return this.internalCounter < this.innerObjects.length;
    }

    /**
     * @returns {InfiltrationData}
     */
    getNext() {
        let next = this.innerObjects[this.internalCounter];
        this.internalCounter++;
        return next;
    }

    reset() {
        this.internalCounter = 0;
    }

    /**
     * @param {InfiltrationData} InfiltrationData
     */
    add(InfiltrationData) {
        this.innerObjects.push(InfiltrationData);
    }

    collectAll() {
        let possibleLocations = this.#ns.infiltration.getPossibleLocations();
        for  (let location of possibleLocations) {
            this.add(new InfiltrationData(this.#ns, location.name, location.city))
        }
    }

    debug() {
        let filteredSortedInfiltrationDataCollection = this.innerObjects.filter(function (infiltrationData) {
            return infiltrationData.info.reward.SoARep >= 0;
        }).filter(function (infiltrationData) {
            return infiltrationData.info.difficulty < 2;
        }).sort(function(a, b) {
            return a.info.difficulty - b.info.difficulty;
        });

        for (let infiltrationData of filteredSortedInfiltrationDataCollection) {
            this.#ns.tprintf(
                'Name: %s, City: %s, Difficulty: %s, //rewards// TR: %s, SC: %s, SR: %s',
                infiltrationData.name,
                infiltrationData.city,
                infiltrationData.info.difficulty,
                infiltrationData.info.reward.tradeRep,
                infiltrationData.info.reward.sellCash,
                infiltrationData.info.reward.SoARep
            )
        }
    }
}