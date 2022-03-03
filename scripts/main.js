


// === LOAD DATA ===

// Natural Earth data in JSON format from https://github.com/martynafford/natural-earth-geojson/tree/master/50m/cultural
AsyncLoader.loadJson("worldMap", "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/50m/cultural/ne_50m_admin_0_countries.json");

// Country data
AsyncLoader.loadCsv("countries", "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.csv");



// === USE DATA ===

// Wait for data to load
AsyncLoader.onceLoaded(function() {

    // Get loaded data
    const worldMap = AsyncLoader.getData("worldMap");
    const countries = AsyncLoader.getData("countries");



    // === ENRICH COVID DATA ===

    // Map each record by their respective country's ISO code
    const isoToCountry = new Map();
    countries.forEach(record => {
        const iso = record.iso_code;

        // Add new list
        if (!isoToCountry.has(iso))
            isoToCountry.set(iso, {name: record.location, iso_code: iso, data: []});
        
        // Append record to list
        isoToCountry.get(iso).data.push(record);
    });

    // Find min and max dates
    let minDate=null, maxDate=null;
    isoToCountry.forEach(country => {
        country.data.forEach(record => {
            let date = new Date(record.date);
            if (minDate===null || date<minDate)
                minDate = date;
            if (maxDate===null || date>maxDate)
                maxDate = date;
        });
    });

    // Fill some missing data
    /*Enricher.fillValues(isoToCountry, [
        "people_vaccinated_per_hundred",
        "people_fully_vaccinated_per_hundred",
        "total_cases_per_million",
        "total_deaths_per_million"
    ]);*/



    // === ENRICH MAP DATA ===
    
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
        isoToCountry.forEach(country => {
            const iso = country.iso_code;
            if (isoToRegion.has(iso))
                isoToRegion.get(iso).properties.valid = true;
        });
    }



    // === CREATE VACCINATION GRAPH ===

    // Create line graphs
    const vaccinationChart = new LineChart("vaccination_chart");
    const caseChart = new LineChart("case_chart");
    const mortalityChart = new LineChart("mortality_chart");


    
    // === CREATE MAP ===
    
    // Create world map display
    WorldMap.createMap(worldMap);

    // Set callback for when region is clicked
    WorldMap.onClick(function(iso) {

        const region = isoToCountry.get(iso);

        // Vaccination
        vaccinationChart.update(
            `Total vaccinated per capita for ${region.name}`,
            region.data,
            [
                {
                    title: "Vaccinated",
                    colour: "blue",
                    getX: (record) => new Date(record.date),
                    getY: (record) => record.people_vaccinated_per_hundred
                },
                {
                    title: "Fully Vaccinated",
                    colour: "green",
                    getX: (record) => new Date(record.date),
                    getY: (record) => record.people_fully_vaccinated_per_hundred
                }
            ],
            [minDate, maxDate],
            [0, 100]
        );

        // Cases
        caseChart.update(
            `Total cases and deaths per capita for ${region.name}`,
            region.data,
            [
                {
                    title: "Cases",
                    colour: "blue",
                    getX: (record) => new Date(record.date),
                    getY: (record) => record.total_cases_per_million/10000
                },
                {
                    title: "Deaths",
                    colour: "red",
                    getX: (record) => new Date(record.date),
                    getY: (record) => record.total_deaths_per_million/10000
                }
            ],
            [minDate, maxDate],
            null
        );
    })

    // Emulate click on UK region
    WorldMap.click(null, {properties: {ISO_A3: "GBR", valid: true}});
});
