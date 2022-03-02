
class AsyncLoader {

    static loading = {};
    static loaded  = {};
    static callback = null;

    /** Start loading JSON asynchronously */
    static loadJson(identifier, url) {

        // Set loading
        console.log(`Loading ${identifier}...`)
        AsyncLoader.loading[identifier] = true;

        // Load async
        d3.json(url).then(function(json) {

            // Stash result
            console.log(`${identifier} loaded.`)
            AsyncLoader.loaded[identifier] = json;

            // Loading done
            delete AsyncLoader.loading[identifier];

            // Invoke callback
            if (AsyncLoader.callback!==null && Object.keys(AsyncLoader.loading).length === 0) {
                console.log(`All loaded.  Invoking callback.`)
                AsyncLoader.callback();
                AsyncLoader.callback = null;
            }
        });
    }

    /** Start loading CSV asynchronously */
    static loadCsv(identifier, url) {

        // Set loading
        console.log(`Loading ${identifier}...`)
        AsyncLoader.loading[identifier] = true;

        // Load async
        d3.csv(url).then(function(csv) {

            // Stash result
            console.log(`${identifier} loaded.`)
            AsyncLoader.loaded[identifier] = csv;

            // Loading done
            delete AsyncLoader.loading[identifier];

            // Invoke callback
            if (AsyncLoader.callback!==null && Object.keys(AsyncLoader.loading).length === 0) {
                console.log(`All loaded.  Invoking callback.`)
                AsyncLoader.callback();
                AsyncLoader.callback = null;
            }
        });
    }

    /** Get loaded data */
    static getData(identifier) {
        return AsyncLoader.loaded[identifier];
    }

    /** Check if any files are still loading */
    static onceLoaded(func) {
        console.log(`Callback set.`)
        AsyncLoader.callback = func;
    }
}
