// DinoLoader.js
// ---------------------------------------------------------------
// Reads DinoListConfig, injects a <script> tag for each species,
// and returns a Promise that resolves when all scripts have loaded.
//
// Works on file:// because we're just injecting plain <script> tags —
// no fetch(), no ES module imports needed.
// ---------------------------------------------------------------

const DinoLoader = {
    /**
     * Load all dino definition scripts listed in DinoListConfig.
     * @returns {Promise<void>} resolves when every script has loaded
     */
    loadAll() {
        const promises = DinoListConfig.map(species => this._loadScript(species));
        return Promise.all(promises);
    },

    _loadScript(species) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `model/dinos/${species}.js`;
            script.onload = () => resolve();
            script.onerror = () => {
                console.error(`DinoLoader: failed to load dinos/${species}.js`);
                reject(new Error(`Failed to load dino definition: ${species}`));
            };
            document.head.appendChild(script);
        });
    }
};


alert('Dinoloader.js loaded');
