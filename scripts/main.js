


// === LOAD DATA ASYNC ===

// Natural Earth data in JSON format from https://github.com/martynafford/natural-earth-geojson/tree/master/50m/cultural
AsyncLoader.loadJson("worldMap", "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/50m/cultural/ne_50m_admin_0_countries.json");

// Vaccination data
AsyncLoader.loadJson("vaccinations", "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/vaccinations.json");



// === USE DATA ===

// Wait for data to load
AsyncLoader.onceLoaded(function() {

    const worldMap = AsyncLoader.getJson("worldMap");
    const vaccinations = AsyncLoader.getJson("vaccinations");

    // Map each region by ISO
    const isoToRegion = new Map();
    for (region of worldMap.features) {
        console.log(region.properties.ISO_A3);
        isoToRegion.set(region.properties.ISO_A3, region);
    }

    // Update world map display
    updateMap(worldMap);
});
