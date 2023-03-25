import ProcessData from "/utils/data/ProcessData";
import {SNIPPETS} from "/constants/BatchAttack";

/**
 * @param {NS} ns
 * @param {BotnetServerCollection} botnetServerCollection
 * @return {ProcessData[]}
 */
export function gatherAttackProcessData(ns, botnetServerCollection) {
    let snippets = [];
    for (let snippet of SNIPPETS) {
        snippets.push(snippet.path);
    }

    let processes = [];

    botnetServerCollection.reset();
    while (botnetServerCollection.hasNext()) {
        let botnetServer = botnetServerCollection.getNext();
        let ps = botnetServer.ps();

        for (let process of ps) {

            let scriptPath = process.filename;

            if (!snippets.includes(scriptPath)) {
                continue;
            }

            let threads = process.threads;
            let attackableServer = process.args[0];
            let pid = process.pid;

            processes.push(new ProcessData(ns, attackableServer, botnetServer.name, threads, pid, scriptPath));
        }
    }

    return processes;
}