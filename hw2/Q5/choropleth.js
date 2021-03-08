// enter code to define margin and dimensions for svg
var margin = {top: 10, right: 10, bottom: 10, left: 10}
    , width = window.innerWidth - margin.left - margin.right
    , height = window.innerHeight - margin.top - margin.bottom
    , padding = 10;

var gameData_g;

Promise.all([
    // enter code to read files
    d3.json("world_countries.json"),
    d3.dsv(",", "ratings-by-country.csv")
]).then(
    // enter code to call ready() with required arguments
    function(read_data) {
        world = read_data[0]
        gameData = read_data[1]
        ready(null, world, gameData)
    }
);

function ready(error, world, gameData) {

    unique_games = d3.nest()
                .key(function(d) { return d["Game"]; }).sortKeys((a,b) => d3.ascending(+a,+b))
                .entries(gameData);

    d3.select("#selectButton")
        .selectAll("myOptions")
        .data(
            d3.map(unique_games, function(g) { return g.key; }).keys()
        )
        .enter()
            .append("option")
            .text(function (g) { return g; })
            .attr("value", function(g) { return g; });
    // event listener for the dropdown. Update choropleth and legend when selection changes. Call createMapAndLegend() with required arguments.
    d3.select("#selectButton")
        .on("change", function(d) {
            var selectedGame = d3.select(this).property("value")
            createMapAndLegend(world, gameData, selectedGame);
        })
    // create Choropleth with default option. Call createMapAndLegend() with required arguments. 
    createMapAndLegend(world, gameData, unique_games[0].key);
}

// this function should create a Choropleth and legend using the world and gameData arguments for a selectedGame
// also use this function to update Choropleth and legend when a different game is selected from the dropdown
function createMapAndLegend(world, gameData, selectedGame){ 

    d3.select("svg.choro").remove();
    
    var svg = d3.select("div#choropleth")
    .append("svg")
    .attr("class", "choro")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var tooltip = d3.tip()
        .attr("class", "country-tool-tip")
        .direction("s")
        .html(function(d) {
            for (let i = 0; i < gameData_g.length; i++) {
                if (gameData_g[i]["Country"] == d.properties.name) {
                    return "<p>Country: " + d.properties.name + "<br/>" +
                            "Game: " + gameData_g[i]["Game"] + "<br/>" +
                            "Avg Rating: " + gameData_g[i]["Average Rating"] + "<br/>" +
                            "Number of Users: " + gameData_g[i]["Number of Users"] + "</p>";
                }
            }
            return "<p>Country: " + d.properties.name + "<br/>" +
                    "Game: " + gameData_g[0]["Game"] + "<br/>" +
                    "Avg Rating: N/A <br/>" +
                    "Number of Users: N/A </p>";
        });
    svg.call(tooltip);

    console.log("Selected game: " + selectedGame);
    gameData = gameData.filter(function(g) { return g["Game"] == selectedGame;});
    gameData_g = gameData;

    var projection = d3.geoMercator()
        .scale(width/10)
        .translate([width/2, height/2])
    var path = d3.geoPath().projection(projection);

    var quantile = d3.scaleQuantile()
        .domain(gameData.map(function(g) { return +g["Average Rating"];}))
        .range(["#eff3ff", "#bdd7e7", "#6baed6", "#2171b5"])

    var getColorOfCountry = function(country) {
        for (let i = 0; i < gameData_g.length; i++) {
            if (gameData_g[i]["Country"] == country) {
                return quantile(gameData_g[i]["Average Rating"]);
            }
        }
        return "gray";
    }

    svg.selectAll("path")
        .data(world.features)
        .enter()
        .append("path")
        .attr("class", "continent")
        .attr("d", path)
        .attr("fill", function(d) { return getColorOfCountry(d.properties.name); })
        .on("mouseover", tooltip.show)
        .on("mouseout", tooltip.hide);

    quantiles = [d3.min(quantile.domain()), ...quantile.quantiles(), d3.max(quantile.domain())]
    quantiles = [[quantiles[0], quantiles[1]],[quantiles[1],quantiles[2]],[quantiles[2],quantiles[3]],[quantiles[3],quantiles[4]]]
    var i = 0;
    var legend = svg.selectAll("legend")
        .data(quantiles)
        .enter()
        .append("g")
        .attr("class", "lenged")
        .style("text-anchor", "left")
        .attr("transform", function(d) {
            i++;
            return "translate(" + width/1.15 + "," + i * 20 + ")";
        })
    legend.append("text")
        .text(function(d) { return d[0].toFixed(2) + " to " + d[1].toFixed(2); });
    
    legend.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("transform", "translate(" + -15 + "," + -10 + ")")
        .attr("stroke", "black")
        .attr("fill", function(d) { return quantile(d[0]); });
    
    d3.select("div#choropleth")
        .append("text")
        .text("byang301")
}