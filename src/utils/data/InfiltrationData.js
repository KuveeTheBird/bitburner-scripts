export class InfiltrationData {
    /** @param {import(".").NS } #ns */
    #ns;
    name;
    city;

    constructor(
        ns,
        name,
        city
    ) {
        this.#ns = ns;
        this.name = name;
        this.city = city;
    }

    get info() {
        return this.#ns.infiltration.getInfiltration(this.name);
    }

}