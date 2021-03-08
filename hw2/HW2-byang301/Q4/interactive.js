var margin = {top: 50, right: 200, bottom: 50, left: 200, barchart: 300}
    , width = window.innerWidth - margin.left - margin.right
    , height = window.innerHeight - margin.top - margin.bottom - margin.barchart - 100
    , padding = 10;

var parseYear = d3.timeParse("%Y");

// colors
var colorScheme = d3.scaleOrdinal(d3.schemeCategory10);

var rating_by_year, svg_barchart;

d3.dsv(",", "average-rating.csv", function(d) {
    return {
        name: d.name,
        year: +d.year,
        // year: +d.year,
        average_rating: Math.floor(+d.average_rating),
        users_rated: +d.users_rated
    }
}).then(function(data) {

    rating_by_year = d3.nest()
                .key(function(d) { return +d.year; }).sortKeys((a,b) => d3.ascending(+a,+b))
                .key(function(d) { return d.average_rating; }).sortKeys((a,b) => d3.ascending(+a,+b))
                .key(function(d) {return d.users_rated }).sortKeys((a,b) => d3.descending(+a,+b))
                .entries(data);

    var svg = d3.select("div#container-a")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    console.log(data[0]);
    var nested_by_year = d3.nest()
        .key(function(d) { return +d.year; })
        .key(function(d) { return +d.average_rating; }).sortKeys((a,b) => d3.ascending(+a,+b))
        .rollup(function(leaves) { return leaves.length; })
        .entries(data);
    
    nested_by_year = nested_by_year.filter(function(n) { 
        return +n.key >= 2015 && +n.key <= 2019;
    })

     // scales
    var xScale = d3.scaleLinear()
        .domain([0, d3.max(nested_by_year, function(nest) {
            return d3.max(nest.values, function(v) {
                return v.key;
            })
        })])
        .range([0, width]);
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(nested_by_year, function(nest) {
            return d3.max(nest.values, function(v) {
                return v.value;
            })
        })])
        .range([height, 0]);
 
    // axes
    var yaxis = d3.axisLeft()
        .scale(yScale)
    var xaxis = d3.axisBottom()
        .ticks(xScale.domain()[1] + 1)
        .scale(xScale);
    
    // put in 0s for ratings with no count
    for (let year = 0; year < nested_by_year.length; year++) {
        ratings = nested_by_year[year].values.map(v => v.key);
        for (let rating = 0; rating < xScale.domain()[1]+1; rating++) {
            if (!ratings.includes(""+rating)) {
                nested_by_year[year].values.push({key: ""+rating, value: 0});
            } // could turn keys into numbers here if needed
        }
        nested_by_year[year].values.sort((a,b) => d3.ascending(+a.key,+b.key));
    }
    console.log(nested_by_year);
    nested_by_year_g = nested_by_year;

    for (let rating = 0; rating < xScale.domain()[1]; rating++) {
        for (let year = 0; year < nested_by_year.length; year++) {
            nested_by_year[0].values.map(ratings => ratings.key)
        }
    }

    // line
    var line = d3.line()
        .x(function(d) { return xScale(+d.key); })
        .y(function(d) { return yScale(+d.value); });

    // add titles
    svg.append("text")
        .attr("class", "chart-title")
        .text("Board games by Rating 2015-2019")
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + width/2 + "," + -20 + ")");
    svg.append("text")
        .attr("class", "gtusername")
        .attr("fill", "blue")
        .text("byang301")
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + width/2 + "," + 0 + ")");
    
    // add axes
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xaxis)
        .append("text")
        .attr("fill", "black")
        .attr("class", "xlabel")
        .style("text-anchor", "middle")
        .attr("dx", width/2)
        .attr("dy", 30)
        .text("Rating");
    svg.append("g")
        .attr("class", "axis")
        .call(yaxis)
        .append("text")
        .attr("fill", "black")
        .attr("class", "ylabel")
        .attr("transform", "rotate(-90)")
        .attr("dx", -height/2)
        .attr("dy", -margin.left/1.5)
        .style("text-anchor", "middle")
        .text("Count");

    console.log(nested_by_year[0])
     // lines
    var lines = svg.selectAll("lines")
        .data(nested_by_year)
        .enter()
        .append("g");
    lines.append("path")
        .attr("stroke", function(d) { return colorScheme(d.key); })
        .attr("class", "line-chart")
        .attr("fill", "none")
        .attr("d", function(d) { return line(d.values); });

    
    // data points
    lines.selectAll("circles")
        .data(function(d) { 
            return d.values.map(v => ({...v, colorkey: d.key}));
        })
        .enter()
        .append("g")
        .append("circle")
        .attr("fill", function(d) { return colorScheme(d.colorkey)})
        .attr("cx", function(d) { return xScale(d.key); })
        .attr("cy", function(d) { return yScale(d.value); })
        .attr('r', 5)
        .style("opacity", 1)
        .on("mouseover", function(d) {

            var target_year = d.colorkey;
            var target_rating = d.key;
            var barchart_data = false;
            for (let i = 0; i < rating_by_year.length; i++) {
                if (rating_by_year[i].key == target_year) {
                    ratings = rating_by_year[i].values;
                    for (let j = 0; j < ratings.length; j++) {
                        if (ratings[j].key == target_rating) {
                            if (ratings[j].values.length >= 5) {
                                barchart_data = ratings[j].values.slice(0,5);
                            } else {
                                barchart_data = ratings[j].values;
                            }
                        }
                    }
                }
            }
            if (barchart_data != false) {
                console.log(barchart_data);
                
                svg_barchart = d3.select("div#container-a-barchart")
                    .append("svg")
                    .attr("class", "svg_barchart")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", margin.barchart + padding + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                // barchart axes
            
                var xScale = d3.scaleLinear()
                    .domain([0, d3.max(barchart_data, function(b) { return +b.key; })])
                    .range([0, width])
                var yScale = d3.scaleBand()
                    .domain(barchart_data.map(function(b) {return b.values[0].name.substring(0,10);}))
                    .range([margin.barchart, 0])
                
                var yaxis = d3.axisLeft()
                    .scale(yScale)
                var xaxis = d3.axisBottom()
                    .scale(xScale);

                svg_barchart.append("text")
                    .attr("class", "chart-title")
                    .text("Top 5 most rated games of year " + target_year + " with rating " + target_rating )
                    .style("text-anchor", "middle")
                    .attr("transform", "translate(" + width/2 + "," + -20 + ")");
                
                // barchart axes
                svg_barchart.append("g")
                    .attr("class", "axis")
                    .attr("transform", "translate(0," + margin.barchart + ")")
                    .call(xaxis)
                    .append("text")
                    .attr("fill", "black")
                    .attr("class", "xlabel")
                    .style("text-anchor", "middle")
                    .attr("dx", width/2)
                    .attr("dy", 30)
                    .text("Number of users");
                svg_barchart.append("g")
                    .attr("class", "axis")
                    .call(yaxis)
                    .append("text")
                    .attr("fill", "black")
                    .attr("class", "ylabel")
                    .attr("transform", "rotate(-90)")
                    .attr("dx", -margin.barchart/2)
                    .attr("dy", -margin.left/1.5)
                    .style("text-anchor", "middle")
                    .text("Games");
                // gridlines
                svg_barchart.append("g")
                    .attr("class", "verticalgridlines")
                    .attr("transform", "translate(0," + margin.barchart + ")")
                    .call(
                        d3.axisBottom(xScale)
                            .tickSize(-width + 910)
                            .tickFormat("")
                    );
                
                var bars = svg_barchart.selectAll("bars")
                    .data(barchart_data)
                    .enter()
                    .append("g")
                bars.append("rect")
                    .attr("class", "bar")
                    .attr("x", 0)
                    .attr("y", function(d) { return yScale(d.values[0].name.substring(0,10))})
                    .attr("height", function(d) {return yScale.bandwidth() - 10; })
                    .attr("width", function(d) { return xScale(d.key)})
                    .attr("fill", "purple")
                    .attr("stroke", "white")
                    .style("opacity", 0.5);
                
                d3.select(this)
                    .classed("mouseover",true)
                    .attr("r", 10);

                svg_barchart.style("display", "block");
            }

        })
        .on("mouseout", function(d) {
            d3.select(".svg_barchart").remove();
            d3.select(this)
                .classed("mouseover",true)
                .attr("r", 5);
        });
    
    legend = svg.selectAll("legend")
        .data(nested_by_year)
        .enter()
        .append("g")
        .attr("class", "legend")
        .style("text-anchor", "right")
        .attr("fill", function(d) { return colorScheme(d.key); })
        .attr("transform", function(d) {
            var i = +d.key - 2015;
            return "translate(" + width + "," + i * 20 + ")";
        })
    legend.append("text")
        .text(function(d) { return d.key; })


    legend.append("circle")
        .attr("fill", function(d) { return colorScheme(d.key)})
        .attr("transform", "translate(" + -5 + "," + -6 + ")")
        .attr("r", 3)
})  