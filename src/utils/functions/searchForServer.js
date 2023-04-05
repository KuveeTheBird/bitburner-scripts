/**
 * @param {Server} parentServer
 * @param {string} targetServerHostname
 * @return {Server|false}
 */
export function searchForServer(parentServer, targetServerHostname) {
    for (let childServer of parentServer.children) {
        if (childServer.name === targetServerHostname) {
            return childServer;
        }

        if (childServer.children.length) {
            let searchResult = searchForServer(childServer, targetServerHostname);
            if (searchResult !== false) {
                return searchResult
            }
        }

    }
    return false;
}