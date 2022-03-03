
class Enricher {

    static fillValues(countries, fields) {

        for (let country of countries) {

            // Create map of max values
            const maxValues = new Map();
            fields.forEach( field => maxValues.set(field, "") );

            console.log(country);
            for (let record of country[1].data) {
                for (let field of fields) {
                    if (record[field]==="") {
                        record[field] = maxValues.get(field);
                    } else {
                        maxValues.set(field, record[field]);
                    }
                }
            }
        }
    }
}
