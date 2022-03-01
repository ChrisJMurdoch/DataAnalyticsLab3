


// === LOAD DATA ===

// Natural Earth data in JSON format from https://github.com/martynafford/natural-earth-geojson/tree/master/50m/cultural
AsyncLoader.loadJson("worldMap", "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/50m/cultural/ne_50m_admin_0_countries.json");

// Vaccination data
AsyncLoader.loadJson("vaccinations", "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/vaccinations.json");



// === USE DATA ===

// Wait for data to load
AsyncLoader.onceLoaded(function() {

    const worldMap = AsyncLoader.getJson("worldMap");
    const vaccinations = AsyncLoader.getJson("vaccinations");



    // === ENRICH DATA ===

    // Map each region by name
    const nameToRegion = new Map();
    worldMap.features.forEach(region => nameToRegion.set(region.properties.NAME, region));

    // Manually set some missing ISOs
    nameToRegion.get("France").properties.ISO_A3 = "FRA";
    nameToRegion.get("Norway").properties.ISO_A3 = "NOR";

    // Map each region by ISO
    const isoToRegion = new Map();
    worldMap.features.forEach(region => isoToRegion.set(region.properties.ISO_A3, region));

    // Check what ISOs have vaccination data
    vaccinations.forEach(vaccination => {
        const iso = vaccination.iso_code;
        if (isoToRegion.has(iso))
            isoToRegion.get(iso).properties.valid = true;
    });



    // === CREATE GRAPHS ===

    // Update world map display
    WorldMap.createMap(worldMap);



    // === UPDATES ===

    // When region is clicked
    WorldMap.onClick(function(iso) {
        console.log(iso);
    })
});
