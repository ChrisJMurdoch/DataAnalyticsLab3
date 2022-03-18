
class BarChart {
    
    // Set the dimensions and margins of the graph
    margin = { top: 30, right: 30, bottom: 30, left: 30 };
    width = d3.select(`#centre_column`).style("width").slice(0, -2) - this.margin.left - this.margin.right;
    height = (this.width / BarChart.aspectRatio) - this.margin.top - this.margin.bottom;
    
    static aspectRatio = 4;
    static padding = {top: 60, bottom: 33, sides: 36};

    constructor() {
        
        // Create SVG
        this.svg = d3.select('#centre_column')
            .append('div')
            .append("svg")
            .attr("width", this.width+this.margin.left+this.margin.right)
            .attr("height", this.height+this.margin.top+this.margin.bottom)
            .append("g")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
    }

    // Update the graph with given data
    update(data) {

        // Fade out previous axes
        this.svg.selectAll(".axis")
            .transition()
            .duration(1000)
            .style("opacity", "0")
            .remove();

        // X axis
        const x = d3.scaleBand()
            .range([0, this.width])
            .domain(data.data.map((d) => d.group))
            .padding(0.2);
        this.svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, 0)`)
            .call(d3.axisTop(x));
        this.svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${this.height})`)
            .call(d3.axisBottom(x));

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([0, 100])
            .range([this.height, 0]);
        this.svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y));
        this.svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(${this.width}, 0)`)
            .call(d3.axisRight(y));

        // Bind new data to rects
        const u = this.svg.selectAll("rect")
            .data(data.data);

        // Remove extra bars
        u.exit()
            .remove();
        
        // Add and transition new bars
        u.enter()
            .append("rect")
            .merge(u)
            .transition()
            .duration(1000)
            .attr("x", (d) => x(d.group))
            .attr("y", (d) => y(d.value))
            .attr("width", x.bandwidth())
            .attr("height", (d) => this.height - y(d.value))
            .attr("fill", data.colour)
            .attr("stroke", "black");
    }
}
