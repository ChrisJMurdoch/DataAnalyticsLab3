
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

    /** Get loaded JSON */
    static getJson(identifier) {
        return AsyncLoader.loaded[identifier];
    }

    /** Check if any JSONs are still loading */
    static onceLoaded(func) {
        console.log(`Callback set.`)
        AsyncLoader.callback = func;
    }
}
