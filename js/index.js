var DW = DW || {};
DW.controllers = DW.controllers || {};

DW.controllers.index = function () {
    var viewModel = {
        currentName: ko.observable(),
        currentData: ko.observable(),
        currentValue: ko.observable(),
        showPublic: ko.observable(true),
        showIndependent: ko.observable(true),
        showRural: ko.observable(true),
        showUrban: ko.observable(true),
        minPass: ko.observable(0),
        maxPass: ko.observable(100),
        visibleSchools: ko.observable(0),
        filterSchools: function(){
            d3.selectAll(".school").each(function(d){
                if( (d.Sector === "PUBLIC" &&      !viewModel.showPublic()) ||
                    (d.Sector === "INDEPENDENT" && !viewModel.showIndependent()) ||
                    (d.Urban_Rural === "URBAN" &&  !viewModel.showUrban()) ||
                    (d.Urban_Rural === "RURAL" &&  !viewModel.showRural()) ||
                    ((parseFloat(d["Matric Results 2012 Percentage"]) || 0) <= viewModel.minPass()) ||
                    ((parseFloat(d["Matric Results 2012 Percentage"]) || 0) >= viewModel.maxPass()))
                {
                    this.classList.add("hidden");
                } else {
                    this.classList.remove("hidden");
                }
            })

            viewModel.visibleSchools($(".school:not(.hidden)").length);
        },

        nationalPassFail: function () {
            this.removeQuantizedClasses();
            var quantize = d3.scale.quantize()
                .domain([.58, .82])
                .range(d3.range(9).map(function (i) {
                    return "q" + i + "-9";
                }));

            ["1188", "1189", "1201", "1206", "1208", "1209", "1210", "1216", "1926"].forEach(
                function (provence) {
                    d3.selectAll(".ZAF-" + provence)
                        .attr("original-title", "")
                        .each(function (d) {
                            this.classList.add(quantize(d.properties.passFail))
                        }).on("mouseover", function(d){
                            viewModel.currentValue((d.properties.passFail * 100).toFixed(2) + "%");
                            viewModel.currentName(d.properties.name);
                            viewModel.currentData("PASS");
                        })
                })
        },
        nationalUrbanRural: function () {
            this.removeQuantizedClasses();
            var quantize = d3.scale.quantize()
                .domain([0, .9])
                .range(d3.range(9).map(function (i) {
                    return "q" + i + "-9";
                }));

            ["1188", "1189", "1201", "1206", "1208", "1209", "1210", "1216", "1926"].forEach(
                function (provence) {
                    d3.selectAll(".ZAF-" + provence)
                        .attr("original-title", "")
                        .each(function (d) {
                            this.classList.add(quantize(d.properties.urbanRural))
                        }).on("mouseover", function(d){
                            viewModel.currentValue((d.properties.urbanRural * 100).toFixed(2) + "%");
                            viewModel.currentName(d.properties.name);
                            viewModel.currentData("URBAN");
                        })
                })
        },
        nationalPublicPrivate: function () {
            this.removeQuantizedClasses();
            var quantize = d3.scale.quantize()
                .domain([.7707, .9474])
                .range(d3.range(9).map(function (i) {
                    return "q" + i + "-9";
                }));

            ["1188", "1189", "1201", "1206", "1208", "1209", "1210", "1216", "1926"].forEach(
                function (provence) {
                    d3.selectAll(".ZAF-" + provence)
                        .each(function (d) {
                            this.classList.add(quantize(d.properties.publicPrivate))
                        }).on("mouseover", function(d){
                            viewModel.currentValue((d.properties.publicPrivate * 100).toFixed(2)+ "%");
                            viewModel.currentName(d.properties.name);
                            viewModel.currentData("PUBLIC");
                        })
                })
        },
       removeQuantizedClasses: function () {
            ["q0-9",
                "q1-9",
                "q2-9",
                "q3-9",
                "q4-9",
                "q5-9",
                "q6-9",
                "q7-9",
                "q8-9"].forEach(function (klass) {

                    d3.selectAll("." + klass)
                        .classed(klass, false)
                })
        },
        resetFilters: function(){
            this.removeQuantizedClasses();
            $( "#slider-range").slider({values:[0,100]})
            d3.selectAll(".subunit").on("mouseover", null);
            this.currentName("");
            this.currentData("");
            this.currentValue("");
            this.showPublic(true);
            this.showIndependent(true);
            this.showRural(true);
            this.showUrban(true);
            this.minPass(0);
            this.maxPass(100);
            this.visibleSchools(0);
            d3.selectAll(".hidden").each(function(d){
                this.classList.remove("hidden");
            });
            this.visibleSchools($(".school").length);


        }

    }



    viewModel.showIndependent.subscribe(function(){
     viewModel.filterSchools();
    });

    viewModel.showPublic.subscribe(function(){
        viewModel.filterSchools();
    });

    viewModel.showUrban.subscribe(function(){
        viewModel.filterSchools();
    });

    viewModel.showRural.subscribe(function(){
        viewModel.filterSchools();
    });
    viewModel.maxPass.subscribe(function(){
        viewModel.filterSchools();
    });
    viewModel.minPass.subscribe(function(){
        viewModel.filterSchools();
    });



    var initializeD3 = function () {
        $( "#slider-range" ).slider({
            range: true,
            min: 0,
            max: 100,
            step: .1,
            values:[0,100],
            slide: function( event, ui ) {
             viewModel.minPass( ui.values[ 0 ]);
             viewModel.maxPass( ui.values[ 1 ]);
            }
    });
        var width = $("#map").width(),
            height = $(window).height() * .8,
            active;

        var projection = d3.geo.mercator()
            .center([0, -29.0833])
            .rotate([-24.000, 0])
            .scale(2000)
            .translate([width / 2, height / 2]);

        var path = d3.geo.path()
            .projection(projection);

        var svg = d3.select("#map")
            .attr("height", height);


        var g = svg.append("g");


        d3.json("json/za.json", function (error, za) {
            g.selectAll(".subunit")
                .data(topojson.feature(za, za.objects.subunits).features)
                .enter().append("path")
                .attr("class", function (d) {
                    return "subunit " + d.id;
                })
                .attr("d", path)
                .on("click", click);


            $.getJSON("json/WCSchools.json").success(function (data) {
                viewModel.visibleSchools(data.length);
                g.selectAll(".school")
                .data(data)
                .enter()
                .append("circle")
                .attr("transform", function (d, i) {
                    var coords = projection([d["Longitude"], d["Latitude"]]);
                    d.x = coords[0];
                    d.y = coords[1];
                    return "translate(" + d.x + "," + d.y + ")";
                })
                .attr("r", .5)
                .attr("class", function (d, i) {
                    return "school";
                }).attr("fill","#E60042")

            }).error(function (jqXHR, textStatus, errorThrown) {
                    console.log("error " + textStatus);
                    console.log("incoming Text " + jqXHR.responseText);
                })
        });

        function click(d) {
            if (active === d) {
                return reset()
            }
            ;
            g.selectAll(".active").classed("active", false);
            d3.select(this).classed("active", active = d);

            var b = path.bounds(d);
            g.transition().duration(750).attr("transform",
                "translate(" + projection.translate() + ")"
                    + "scale(" + .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height) + ")"
                    + "translate(" + -(b[1][0] + b[0][0]) / 2 + "," + -(b[1][1] + b[0][1]) / 2 + ")");
        }


        function reset() {
            g.selectAll(".active").classed("active", active = false);
            g.transition().duration(750).attr("transform", "");
        }
    }


    var initialize = function () {

        initializeD3();
        ko.applyBindings(viewModel);


    }

    return {
        initialize: initialize
    };
}
