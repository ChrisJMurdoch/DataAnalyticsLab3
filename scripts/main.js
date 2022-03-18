


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
        if (!isoToCountry.has(iso)) {

            isoToCountry.set(iso, {

                // Get unchanging country statistics from first record
                iso_code: iso,
                gdp_per_capita: record.gdp_per_capita,
                life_expectancy: record.life_expectancy,
                median_age: record.median_age,
                population_density: record.population_density,
                stringency_index: record.stringency_index,
                name: record.location,

                // Set latest values
                latestVaccinatedPerHundred: 0,
                latestCasesPerHundred: 0,
                latestDeathsPerHundred: 0,
                latestExcessMortality: 0,

                // Record list
                data: []
            });
        }

        // Add max data
        const country = isoToCountry.get(iso);
        
        const vaccinatedPerHundred = record.people_vaccinated_per_hundred;
        if (vaccinatedPerHundred > country.latestVaccinatedPerHundred)
            country.latestVaccinatedPerHundred = vaccinatedPerHundred;

        const casesPerHundred = record.total_cases_per_million/10000;
        if (casesPerHundred > country.latestCasesPerHundred)
            country.latestCasesPerHundred = casesPerHundred;

        const deathsPerHundred = record.total_deaths_per_million/10000;
        if (deathsPerHundred > country.latestDeathsPerHundred)
            country.latestDeathsPerHundred = deathsPerHundred;

        const excessMortality = record.excess_mortality_cumulative;
        if (excessMortality > country.latestExcessMortality)
            country.latestExcessMortality = excessMortality;
        
        // Append record to list
        country.data.push(record);
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

    // Add data reference to each region
    worldMap.features.forEach(region => {
        region.covidData = isoToCountry.get(region.properties.ISO_A3);
    });



    // === CREATE VACCINATION GRAPHS ===

    // Create line graphs
    const vaccinationChart = new LineChart("vaccination_chart");
    const caseChart = new LineChart("case_chart");


    
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

    // === CREATE BAR CHART ===

    // Create barchart
    const barchart = new BarChart();
    
    function updateScatterSelection(selection) {
        console.log(selection);
        const data = [];
        selection.forEach( iso => {
            data.push({group: iso, value: isoToCountry.get(iso).latestExcessMortality})
        });
        console.log(data);
        barchart.update({
            colour: "grey",
            data: data
        });
    }
    updateScatterSelection(["GBR", "USA"]);

    // === CREATE SCATTER PLOTS ===

    // wealth_death_chart
    const wealthDeathChart = new ScatterChart("wealth_death_chart", updateScatterSelection);
    wealthDeathChart.update(
        `Wealth vs confirmed deaths of each country`,
        isoToCountry,
        (country) => country[1].gdp_per_capita,
        (country) => country[1].latestDeathsPerHundred,
        null,
        null,
        "orangered"
    );
    const wealth_death_rvalue = rValue(
        isoToCountry,
        (country) => country[1].gdp_per_capita,
        (country) => country[1].latestDeathsPerHundred,
    );
    d3.select("#wealth_death_rvalue").text(wealth_death_rvalue.toFixed(3));

    // wealth_excess_chart
    const wealthExcessChart = new ScatterChart("wealth_excess_chart", updateScatterSelection);
    wealthExcessChart.update(
        `Wealth vs excess mortality of each country`,
        isoToCountry,
        (country) => country[1].gdp_per_capita,
        (country) => country[1].latestExcessMortality,
        null,
        null,
        "red"
    );
    const wealth_excess_rvalue = rValue(
        isoToCountry,
        (country) => country[1].gdp_per_capita,
        (country) => country[1].latestExcessMortality,
    );
    d3.select("#wealth_excess_rvalue").text(wealth_excess_rvalue.toFixed(3));

    // vaccinated_death_chart
    const vaccinatedDeathChart = new ScatterChart("vaccinated_death_chart", updateScatterSelection);
    vaccinatedDeathChart.update(
        `Vaccinated% vs confirmed deaths of each country`,
        isoToCountry,
        (country) => country[1].latestVaccinatedPerHundred,
        (country) => country[1].latestDeathsPerHundred,
        null,
        null,
        "gold"
    );
    const vaccinated_death_rvalue = rValue(
        isoToCountry,
        (country) => country[1].latestVaccinatedPerHundred,
        (country) => country[1].latestDeathsPerHundred,
    );
    d3.select("#vaccinated_death_rvalue").text(vaccinated_death_rvalue.toFixed(3));
});
function rValue(data, getX, getY) {
    let sumXY=0, sumX=0, sumY=0, sumXS=0, sumYS=0, n=0;
    for (let d of data) {

        const x=parseFloat(getX(d)), y=parseFloat(getY(d));
        if (isNaN(x) || isNaN(y))
            continue;

        sumX += x;
        sumY += y;
        sumXY += x*y;
        sumXS += x*x;
        sumYS += y*y;
        n++;
    }
    return (n*sumXY - sumX*sumY) /
           Math.sqrt(
               (n*sumXS - Math.pow(sumX, 2)) *
               (n*sumYS - Math.pow(sumY, 2))
            );
}
