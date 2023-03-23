/**
 * @param ns
 * @param {BotnetServerCollection} botnetServerCollection
 */
export function getBotnetThreadCapacity(ns, botnetServerCollection) {
    let maxThreadCapacity = 0;
    let currentThreadCapacity = 0;

    let botnetCapacities = [];

    for (let botnetServer of botnetServers) {
        let botnetCurrentThreadCapacity = botnetServer.currentThreadCapacity;
        let botnetMaxThreadCapacity = botnetServer.maxThreadCapacity;

        maxThreadCapacity += botnetMaxThreadCapacity;
        currentThreadCapacity += botnetCurrentThreadCapacity;

        botnetCapacities.push({
            'name': botnetServer.name,
            'botnetMaxThreadCapacity': botnetMaxThreadCapacity,
            'botnetCurrentThreadCapacity': botnetCurrentThreadCapacity,
        });
    }

    return {
        'maxThreadCapacity': maxThreadCapacity,
        'currentThreadCapacity': currentThreadCapacity,
        'botnetCapacities': botnetCapacities,
    };
}