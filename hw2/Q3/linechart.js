var margin = {top: 50, right: 200, bottom: 50, left: 100}
    , width = window.innerWidth - margin.left - margin.right
    , height = window.innerHeight - margin.top - margin.bottom
    , adj = 50
    , padding = 50;

var parseDate = d3.timeParse("%Y-%m-%d");

var formatDate = d3.timeFormat("%b %y");

// colors
var colorArray = [d3.schemeCategory10, d3.schemeAccent];
var colorScheme = d3.scaleOrdinal(d3.schemeCategory10);
var colorid = function(id) { return id.split("=")[0]; };

const dataset = d3.dsv(",", "boardgame_ratings.csv");

// a
dataset.then(function(data) {

    var svg_a = d3.select("div#container-a")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var slices = data.columns.slice(1).map(function (id) {
        return {
            id: id,
            color: colorScheme(colorid(id)),
            values: data.map(function(d) {
                return {
                    date: parseDate(d.date),
                    measurement: d[id]
                }
            })

        }
    })
    slices_count = slices.filter(function(s) {
        return s.id.split("=")[1] == "count";
    });
    slices_rank = slices.filter(function(s) {
        return s.id.split("=")[1] == "rank";
    });
    console.log(slices);

    // scales
    var xScale = d3.scaleTime()
        .domain(d3.extent(data, function(d) {
            return parseDate(d.date);
        }))
        .range([0, width]);
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(slices_count, function(s) {
            return d3.max(s.values, function(value) {
                return value.measurement
            })
        })])
        .range([height, 0]);
    
    // axes
    var yaxis = d3.axisLeft()
        .scale(yScale)
    var xaxis = d3.axisBottom()
        .ticks(d3.timeMonth.every(3))
        .tickFormat(d3.timeFormat("%b %y"))
        .scale(xScale);
    
    // line
    var line = d3.line()
        .x(function(d) { 
            return xScale(d.date); 
        })
        .y(function(d) { return yScale(d.measurement); });

    let id = 0;
    const ids = function() { return "line-" + id++; }

    // add titles
    svg_a.append("text")
        .attr("class", "chart-title")
        .text("Number of Ratings 2016-2020")
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + width/2 + "," + 0 + ")");

    // add axes
    svg_a.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xaxis)
        .append("text")
        .attr("class", "xlabel")
        .style("text-anchor", "middle")
        .attr("dx", width/2)
        .attr("dy", margin.bottom)
        .text("Month");
    svg_a.append("g")
        .attr("class", "axis")
        .call(yaxis)
        .append("text")
        .attr("class", "ylabel")
        .attr("transform", "rotate(-90)")
        .attr("dx", -height/2)
        .attr("dy", -margin.left/1.5)
        .style("text-anchor", "middle")
        .text("Num of Ratings");

    // lines
    var lines = svg_a.selectAll("lines")
        .data(slices_count)
        .enter()
        .append("g");
    lines.append("path")
        .attr("stroke", function(d) { return d.color; })
        .attr("class", ids)
        .attr("fill", "none")
        .attr("d", function(d) { return line(d.values); });
    lines.append("text")
        .style("fill", function(d) { return d.color; })
        .attr("class", "serie_label")
        .datum(function(d) {
            return {
                id: d.id,
                value: d.values[d.values.length -1]
            }
        })
        .attr("transform", function(d) {
            return "translate(" + (xScale(d.value.date) + 10)
                + "," + (yScale(d.value.measurement) + 5) + ")";
        })
        .attr("x", 5)
        .text(function(d) {return d.id.split("=")[0]; });

}).catch(function(error) {
    console.log(error);
});

// b
dataset.then(function(data) {

    var svg_a = d3.select("div#container-b")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var slices = data.columns.slice(1).map(function (id) {
        return {
            id: id.split("=")[0],
            type: id.split("=")[1],
            color: colorScheme(colorid(id)),
            values: data.map(function(d) {
                return {
                    // id: id.split("=")[0],
                    color: colorScheme(colorid(id)),
                    date: parseDate(d.date),
                    measurement: d[id]
                }
            })

        }
    })
    slices_count = slices.filter(function(s) {
        return s.type == "count";
    });
    
    slices_rank = slices.filter(function(s) {
        return s.type == "rank";
    });

    for (let i = 0; i < slices_count.length; i++) {
        var count = slices_count[i]
        var rank;
        for (let j = 0; j < slices_rank.length; j++) {
            if (slices_rank[j].id == count.id) {
                rank = slices_rank[j];
            }
        }
        for (let k = 0; k < count.values.length; k++) {
            count.values[k].rank = rank.values[k].measurement;
        }
    }
    rank = []
    target = ['Catan', 'Codenames', 'Terraforming Mars', 'Gloomhaven'];
    for (let i = 0; i < slices_count.length; i++) {
        var slice = slices_count[i]
        if (target.includes(slice.id)) {
            var new_values = []
            for (let j = 2; j < slice.values.length; j+=3) {
                new_values.push(slice.values[j])
            }
            rank.push({
                color: slice.color,
                id: slice.id,
                values: new_values
            });
        }
    }
    

    console.log(slices);

    // scales
    var xScale = d3.scaleTime()
        .domain(d3.extent(data, function(d) {
            return parseDate(d.date);
        }))
        .range([0, width]);
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(slices_count, function(s) {
            return d3.max(s.values, function(value) {
                return value.measurement
            })
        })])
        .range([height, 0]);
    
    // axes
    var yaxis = d3.axisLeft()
        .scale(yScale)
    var xaxis = d3.axisBottom()
        .ticks(d3.timeMonth.every(3))
        .tickFormat(d3.timeFormat("%b %y"))
        .scale(xScale);
    
    // line
    var line = d3.line()
        .x(function(d) { 
            return xScale(d.date); 
        })
        .y(function(d) { return yScale(d.measurement); });

    let id = 0;
    const ids = function() { return "line-" + id++; }

    // add titles
    svg_a.append("text")
        .attr("class", "chart-title")
        .text("Number of Ratings 2016-2020 with Rankings")
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + width/2 + "," + 0 + ")");

    // add axes
    svg_a.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xaxis)
        .append("text")
        .attr("class", "xlabel")
        .style("text-anchor", "middle")
        .attr("dx", width/2)
        .attr("dy", margin.bottom)
        .text("Month");
    svg_a.append("g")
        .attr("class", "axis")
        .call(yaxis)
        .append("text")
        .attr("class", "ylabel")
        .attr("transform", "rotate(-90)")
        .attr("dx", -height/2)
        .attr("dy", -margin.left/1.5)
        .style("text-anchor", "middle")
        .text("Num of Ratings");

    // lines
    var lines = svg_a.selectAll("lines")
        .data(slices_count)
        .enter()
        .append("g");
    lines.append("path")
        .attr("stroke", function(d) { return d.color; })
        .attr("class", ids)
        .attr("fill", "none")
        .attr("d", function(d) { return line(d.values); });
    lines.append("text")
        .style("fill", function(d) { return d.color; })
        .attr("class", "serie_label")
        .datum(function(d) {
            return {
                id: d.id,
                value: d.values[d.values.length -1]
            }
        })
        .attr("transform", function(d) {
            return "translate(" + (xScale(d.value.date) + 10)
                + "," + (yScale(d.value.measurement) + 5) + ")";
        })
        .attr("x", 5)
        .text(function(d) {return d.id.split("=")[0]; });
    
    var lines_rank = svg_a.selectAll("lines_rank")
        .data(rank)
        .enter()
        .append("g");
    lines_rank.append("path")
        .attr("display", "none")
        .attr("stroke", function(d) { return d.color; })
        .attr("class", ids)
        .attr("fill", "none")
        .attr("d", function(d) { return line(d.values); });

    lines_rank.selectAll("circles")
        .data(function(d) { return(d.values); } )
        .enter()
        .append("circle")
        .attr("fill", function(d) { return d.color; })
        .attr("cx", function(d) { return xScale(d.date); })
        .attr("cy", function(d) { return yScale(d.measurement); })
        .attr('r', 10)
        .style("opacity", 1)
    lines_rank.selectAll("circles")
        .data(function(d) { return(d.values); } )
        .enter()
        .append("text")
        // .attr("transform","translate(-5,5)")
        .attr("x", function(d) { return xScale(d.date); })
        .attr("y", function(d) { return yScale(d.measurement); })
        .attr("class", "circle-label")
        .text(function(d) {return d.rank})
        .style("text-anchor", "middle")
        .style("dominant-baseline", "central")
    
    legend = svg_a.append("g")
        .attr("class", "legend")
        .style("text-anchor", "right")
        .attr("transform", "translate(" + width + "," + height + ")");
    
    legend.append("text")
        .text("BoardGameGeek Rank");
    
    legend.append("circle")
        .attr("fill", "black")
        .attr("cx", 75)
        .attr("cy", -30)
        .attr('r', 15)
    legend.append("text")
        .attr("class", "ranktext")
        .attr("fill", "white")
        .text("rank")
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + 75 + "," + -27 + ")");

}).catch(function(error) {
    console.log(error);
});

//c1
dataset.then(function(data) {

    var svg_a = d3.select("div#container-c1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var slices = data.columns.slice(1).map(function (id) {
        return {
            id: id.split("=")[0],
            type: id.split("=")[1],
            color: colorScheme(colorid(id)),
            values: data.map(function(d) {
                return {
                    // id: id.split("=")[0],
                    color: colorScheme(colorid(id)),
                    date: parseDate(d.date),
                    measurement: d[id]
                }
            })

        }
    })
    slices_count = slices.filter(function(s) {
        return s.type == "count";
    });
    
    slices_rank = slices.filter(function(s) {
        return s.type == "rank";
    });

    for (let i = 0; i < slices_count.length; i++) {
        var count = slices_count[i]
        var rank;
        for (let j = 0; j < slices_rank.length; j++) {
            if (slices_rank[j].id == count.id) {
                rank = slices_rank[j];
            }
        }
        for (let k = 0; k < count.values.length; k++) {
            count.values[k].rank = rank.values[k].measurement;
        }
    }
    rank = []
    target = ['Catan', 'Codenames', 'Terraforming Mars', 'Gloomhaven'];
    for (let i = 0; i < slices_count.length; i++) {
        var slice = slices_count[i]
        if (target.includes(slice.id)) {
            var new_values = []
            for (let j = 2; j < slice.values.length; j+=3) {
                new_values.push(slice.values[j])
            }
            rank.push({
                color: slice.color,
                id: slice.id,
                values: new_values
            });
        }
    }
    

    console.log(slices);

    // scales
    var xScale = d3.scaleTime()
        .domain(d3.extent(data, function(d) {
            return parseDate(d.date);
        }))
        .range([0, width]);
    var yScale = d3.scaleSqrt()
        .domain([0, d3.max(slices_count, function(s) {
            return d3.max(s.values, function(value) {
                return value.measurement
            })
        })])
        .range([height, 0]);
    
    // axes
    var yaxis = d3.axisLeft()
        .scale(yScale)
    var xaxis = d3.axisBottom()
        .ticks(d3.timeMonth.every(3))
        .tickFormat(d3.timeFormat("%b %y"))
        .scale(xScale);
    
    // line
    var line = d3.line()
        .x(function(d) { 
            return xScale(d.date); 
        })
        .y(function(d) { return yScale(d.measurement); });

    let id = 0;
    const ids = function() { return "line-" + id++; }

    // add titles
    svg_a.append("text")
        .attr("class", "chart-title")
        .text("Number of Ratings 2016-2020 (Square root scale)")
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + width/2 + "," + 0 + ")");

    // add axes
    svg_a.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xaxis)
        .append("text")
        .attr("class", "xlabel")
        .style("text-anchor", "middle")
        .attr("dx", width/2)
        .attr("dy", margin.bottom)
        .text("Month");
    svg_a.append("g")
        .attr("class", "axis")
        .call(yaxis)
        .append("text")
        .attr("class", "ylabel")
        .attr("transform", "rotate(-90)")
        .attr("dx", -height/2)
        .attr("dy", -margin.left/1.5)
        .style("text-anchor", "middle")
        .text("Num of Ratings");

    // lines
    var lines = svg_a.selectAll("lines")
        .data(slices_count)
        .enter()
        .append("g");
    lines.append("path")
        .attr("stroke", function(d) { return d.color; })
        .attr("class", ids)
        .attr("fill", "none")
        .attr("d", function(d) { return line(d.values); });
    lines.append("text")
        .style("fill", function(d) { return d.color; })
        .attr("class", "serie_label")
        .datum(function(d) {
            return {
                id: d.id,
                value: d.values[d.values.length -1]
            }
        })
        .attr("transform", function(d) {
            return "translate(" + (xScale(d.value.date) + 10)
                + "," + (yScale(d.value.measurement) + 5) + ")";
        })
        .attr("x", 5)
        .text(function(d) {return d.id.split("=")[0]; });
    
    var lines_rank = svg_a.selectAll("lines_rank")
        .data(rank)
        .enter()
        .append("g");
    lines_rank.append("path")
        .attr("display", "none")
        .attr("stroke", function(d) { return d.color; })
        .attr("class", ids)
        .attr("fill", "none")
        .attr("d", function(d) { return line(d.values); });

    lines_rank.selectAll("circles")
        .data(function(d) { return(d.values); } )
        .enter()
        .append("circle")
        .attr("fill", function(d) { return d.color; })
        .attr("cx", function(d) { return xScale(d.date); })
        .attr("cy", function(d) { return yScale(d.measurement); })
        .attr('r', 10)
        .style("opacity", 1)
    lines_rank.selectAll("circles")
        .data(function(d) { return(d.values); } )
        .enter()
        .append("text")
        // .attr("transform","translate(-5,5)")
        .attr("x", function(d) { return xScale(d.date); })
        .attr("y", function(d) { return yScale(d.measurement); })
        .attr("class", "circle-label")
        .text(function(d) {return d.rank})
        .style("text-anchor", "middle")
        .style("dominant-baseline", "central")
    
    legend = svg_a.append("g")
        .attr("class", "legend")
        .style("text-anchor", "right")
        .attr("transform", "translate(" + width + "," + height + ")");
    
    legend.append("text")
        .text("BoardGameGeek Rank");
    
    legend.append("circle")
        .attr("fill", "black")
        .attr("cx", 75)
        .attr("cy", -30)
        .attr('r', 15)
    legend.append("text")
        .attr("class", "ranktext")
        .attr("fill", "white")
        .text("rank")
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + 75 + "," + -27 + ")");

}).catch(function(error) {
    console.log(error);
});

//c2
dataset.then(function(data) {

    var svg_a = d3.select("div#container-c2")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var slices = data.columns.slice(1).map(function (id) {
        return {
            id: id.split("=")[0],
            type: id.split("=")[1],
            color: colorScheme(colorid(id)),
            values: data.map(function(d) {
                return {
                    // id: id.split("=")[0],
                    color: colorScheme(colorid(id)),
                    date: parseDate(d.date),
                    measurement: d[id]
                }
            })

        }
    })
    slices_count = slices.filter(function(s) {
        return s.type == "count";
    });
    
    slices_rank = slices.filter(function(s) {
        return s.type == "rank";
    });

    for (let i = 0; i < slices_count.length; i++) {
        var count = slices_count[i]
        var rank;
        for (let j = 0; j < slices_rank.length; j++) {
            if (slices_rank[j].id == count.id) {
                rank = slices_rank[j];
            }
        }
        for (let k = 0; k < count.values.length; k++) {
            count.values[k].rank = rank.values[k].measurement;
        }
    }
    rank = []
    target = ['Catan', 'Codenames', 'Terraforming Mars', 'Gloomhaven'];
    for (let i = 0; i < slices_count.length; i++) {
        var slice = slices_count[i]
        if (target.includes(slice.id)) {
            var new_values = []
            for (let j = 2; j < slice.values.length; j+=3) {
                new_values.push(slice.values[j])
            }
            rank.push({
                color: slice.color,
                id: slice.id,
                values: new_values
            });
        }
    }
    

    console.log(slices);

    // scales
    var xScale = d3.scaleTime()
        .domain(d3.extent(data, function(d) {
            return parseDate(d.date);
        }))
        .range([0, width]);
    var yScale = d3.scaleLog()
        .domain([0.1, d3.max(slices_count, function(s) {
            return d3.max(s.values, function(value) {
                return value.measurement
            })
        })])
        .range([height, 0]);
    
    // axes
    var yaxis = d3.axisLeft()
        .scale(yScale)
    var xaxis = d3.axisBottom()
        .ticks(d3.timeMonth.every(3))
        .tickFormat(d3.timeFormat("%b %y"))
        .scale(xScale);
    
    // line
    var line = d3.line()
        .x(function(d) { 
            return xScale(d.date); 
        })
        .y(function(d) { return yScale(d.measurement); });

    let id = 0;
    const ids = function() { return "line-" + id++; }

    // add titles
    svg_a.append("text")
        .attr("class", "chart-title")
        .text("Number of Ratings 2016-2020 (Log scale)")
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + width/2 + "," + -5 + ")");

    // add axes
    svg_a.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xaxis)
        .append("text")
        .attr("class", "xlabel")
        .style("text-anchor", "middle")
        .attr("dx", width/2)
        .attr("dy", margin.bottom)
        .text("Month");
    svg_a.append("g")
        .attr("class", "axis")
        .call(yaxis)
        .append("text")
        .attr("class", "ylabel")
        .attr("transform", "rotate(-90)")
        .attr("dx", -height/2)
        .attr("dy", -margin.left/1.5)
        .style("text-anchor", "middle")
        .text("Num of Ratings");

    // lines
    var lines = svg_a.selectAll("lines")
        .data(slices_count)
        .enter()
        .append("g");
    lines.append("path")
        .attr("stroke", function(d) { return d.color; })
        .attr("class", ids)
        .attr("fill", "none")
        .attr("d", function(d) { return line(d.values); });
    lines.append("text")
        .style("fill", function(d) { return d.color; })
        .attr("class", "serie_label")
        .datum(function(d) {
            return {
                id: d.id,
                value: d.values[d.values.length -1]
            }
        })
        .attr("transform", function(d) {
            return "translate(" + (xScale(d.value.date) + 10)
                + "," + (yScale(d.value.measurement) + 5) + ")";
        })
        .attr("x", 5)
        .text(function(d) {return d.id.split("=")[0]; });
    
    var lines_rank = svg_a.selectAll("lines_rank")
        .data(rank)
        .enter()
        .append("g");
    lines_rank.append("path")
        .attr("display", "none")
        .attr("stroke", function(d) { return d.color; })
        .attr("class", ids)
        .attr("fill", "none")
        .attr("d", function(d) { return line(d.values); });

    lines_rank.selectAll("circles")
        .data(function(d) { return(d.values); } )
        .enter()
        .append("circle")
        .attr("fill", function(d) { return d.color; })
        .attr("cx", function(d) { return xScale(d.date); })
        .attr("cy", function(d) { return yScale(d.measurement); })
        .attr('r', 10)
        .style("opacity", 1)
    lines_rank.selectAll("circles")
        .data(function(d) { return(d.values); } )
        .enter()
        .append("text")
        // .attr("transform","translate(-5,5)")
        .attr("x", function(d) { return xScale(d.date); })
        .attr("y", function(d) { return yScale(d.measurement); })
        .attr("class", "circle-label")
        .text(function(d) {return d.rank})
        .style("text-anchor", "middle")
        .style("dominant-baseline", "central")
    
    legend = svg_a.append("g")
        .attr("class", "legend")
        .style("text-anchor", "right")
        .attr("transform", "translate(" + width + "," + height + ")");
    
    legend.append("text")
        .text("BoardGameGeek Rank");
    
    legend.append("circle")
        .attr("fill", "black")
        .attr("cx", 75)
        .attr("cy", -30)
        .attr('r', 15)
    legend.append("text")
        .attr("class", "ranktext")
        .attr("fill", "white")
        .text("rank")
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + 75 + "," + -27 + ")");
    legend.append("text")
        .attr("class", "gtusername")
        .attr("fill", "black")
        .text("byang301")
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + 75 + "," + 35 + ")");

}).catch(function(error) {
    console.log(error);
});