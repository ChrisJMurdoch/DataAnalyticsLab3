


// === LOAD DATA ===

// Natural Earth data in JSON format from https://github.com/martynafford/natural-earth-geojson/tree/master/50m/cultural
AsyncLoader.loadJson("worldMap", "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/50m/cultural/ne_50m_admin_0_countries.json");

// Vaccination data
AsyncLoader.loadJson("vaccinations", "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/vaccinations.json");



// === USE DATA ===

// Wait for data to load
AsyncLoader.onceLoaded(function() {

    // Get loaded data
    const worldMap = AsyncLoader.getJson("worldMap");
    const vaccinations = AsyncLoader.getJson("vaccinations");



    // === ENRICH DATA ===

    // Reorder vaccination data into map, indexed by ISO
    const isoToVaccination = new Map();
    vaccinations.forEach( record => isoToVaccination.set(record.iso_code, record) );

    // Find min and max dates
    console.log(vaccinations);
    let minDate=null, maxDate=null;
    vaccinations.forEach(record => {
        record.data.forEach(entry => {
            let date = new Date(entry.date);
            if (minDate===null || date<minDate)
                minDate = date;
            if (maxDate===null || date>maxDate)
                maxDate = date;
        });
    });

    // Fix missing ISOs in map data
    {
        // Map each region by name
        const nameToRegion = new Map();
        worldMap.features.forEach(region => nameToRegion.set(region.properties.NAME, region));

        // Manually set some missing ISOs
        nameToRegion.get("France").properties.ISO_A3 = "FRA";
        nameToRegion.get("Norway").properties.ISO_A3 = "NOR";

        // Map each region by ISO
        const isoToRegion = new Map();
        worldMap.features.forEach(region => isoToRegion.set(region.properties.ISO_A3, region));

        // Mark region validity
        vaccinations.forEach(vaccination => {
            const iso = vaccination.iso_code;
            if (isoToRegion.has(iso))
                isoToRegion.get(iso).properties.valid = true;
        });
    }



    // === CREATE GRAPHS ===

    // Create world map display
    WorldMap.createMap(worldMap);

    // Create histogram display
    const country = isoToVaccination.get("GBR");
    LineChart.createLineChart(
        country.data,                                     // Array of records
        (record) => new Date(record.date),                // Function to extract record X
        (record) => record.people_vaccinated_per_hundred, // Function to extract record Y
        (data) => [minDate, maxDate],                     // Function to extract X extent
        (data) => [0, 100]                                // Function to extract Y extent
    );



    // === UPDATES ===

    // When region is clicked
    WorldMap.onClick(function(iso) {
        const country = isoToVaccination.get(iso);
        LineChart.updateLineChart(
            country.data,                                     // Array of records
            (record) => new Date(record.date),                // Function to extract record X
            (record) => record.people_vaccinated_per_hundred, // Function to extract record Y
            (data) => [minDate, maxDate],                     // Function to extract X extent
            (data) => [0, 100]                                // Function to extract Y extent
        );
    })
});
