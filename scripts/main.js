


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



    // === CREATE VACCINATION GRAPH ===

    // Create vaccination line graph
    const vaccinationChart = new LineChart("vaccination_chart");

    // Create daily vaccination line graph
    const dailyVaccinationChart = new LineChart("daily_vaccination_chart");


    
    // === CREATE MAP ===
    
    // Create world map display
    WorldMap.createMap(worldMap);

    // Set callback for when region is clicked
    WorldMap.onClick(function(iso) {

        const region = isoToVaccination.get(iso);

        // Total vaccination data
        vaccinationChart.update(
            `Total vaccinations per capita for ${region.country}`,
            region.data,
            (record) => new Date(record.date),
            (record) => record.people_vaccinated_per_hundred,
            (data) => [minDate, maxDate],
            (data) => [0, 100]
        );

        // Daily vaccination data
        dailyVaccinationChart.update(
            `Daily vaccinations per capita for ${region.country}`,
            region.data,
            (record) => new Date(record.date),
            (record) => record.daily_people_vaccinated_per_hundred,
            (data) => [minDate, maxDate],
            (data) => d3.extent(data, d => d.y)
        );
    })

    // Emulate click on UK region
    WorldMap.click(null, {properties:{ISO_A3: "GBR", valid: true}});
});
