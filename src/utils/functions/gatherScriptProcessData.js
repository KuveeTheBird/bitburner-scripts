import ProcessData from "/utils/data/ProcessData";

/**
 * @param {NS} ns
 * @param {BotnetServerCollection} botnetServerCollection
 * @param {string} targetScriptPath
 * @return {ProcessData[]}
 */
export function gatherScriptProcessData(ns, botnetServerCollection, targetScriptPath) {
    let processes = [];

    botnetServerCollection.reset();
    while (botnetServerCollection.hasNext()) {
        let botnetServer = botnetServerCollection.getNext();
        let ps = botnetServer.ps();
        for (let process of ps) {
            if (process.filename === targetScriptPath) {
                processes.push(new ProcessData(ns, process.args[0], botnetServer.name, process.threads, process.pid, process.filename));
            }
        }
    }

    return processes;
}