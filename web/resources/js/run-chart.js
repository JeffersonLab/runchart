var jlab = jlab || {};
jlab.epics2web = jlab.epics2web || {};
jlab.epics2web.runchart = jlab.epics2web.runchart || {};

jlab.epics2web.runchart.MAX_POINTS = 200;
jlab.epics2web.runchart.MAX_CHARTS = 5;
jlab.epics2web.runchart.MIN_UPDATE_MILLIS = 1000;
jlab.epics2web.runchart.pvToChartMap = {};
jlab.epics2web.runchart.con = null;

jlab.epics2web.runchart.Chart = function (plot) {
    this.plot = plot;
    this.data = [];
    this.prev = null;
    this.lastUpdated = null;
    this.i = 0;

    jlab.epics2web.runchart.Chart.prototype.addPointSquare = function (point) {
        if (point !== undefined) {
            if (this.data.length >= jlab.epics2web.runchart.MAX_POINTS) {
                this.data = this.data.slice(2);
            }

            if (this.prev !== null) {
                this.data.push([this.i, this.prev]);
            }

            this.prev = point;

            this.data.push([this.i++, point]);

            /*console.log(data);*/
        }
    };

    /*jlab.epics2web.runchart.Chart.prototype.addPoint = function (point) {
     if (point !== undefined) {
     if (this.data.length >= jlab.wedmonitor.runchart.MAX_POINTS) {
     this.data = this.data.slice(1);
     }
     
     this.data.push([this.i++, point]);
     }
     };*/
};

$(document).on("click", "#go-button", function () {
    var pv = $.trim($("#pv-input").val());

    if (pv === '') {
        alert('Please provide an EPICS PV name');
    } else {
        jlab.epics2web.addPv(pv);
    }

    return false;
});

jlab.epics2web.addPv = function (pv) {
    if (jlab.epics2web.runchart.con === null) {
        alert('Not connected');
        return;
    }

    if (jlab.epics2web.runchart.pvToChartMap[pv] !== undefined) {
        alert('Already charting pv: ' + pv);
        return;
    }

    var $chartHolder = $("#chart-holder"),
            $charts = $chartHolder.find(".chart");

    if ($charts.length + 1 > jlab.epics2web.runchart.MAX_CHARTS) {
        alert('Too many charts; maximum number is: ' + jlab.epics2web.runchart.MAX_CHARTS);
        return;
    }

    var $div = $('<div class="chart"><div class="chart-title-bar"><span class="chart-title">' + pv + '</span><button type="button" class="chart-close-button">X</button></div><div class="chart-body"></div></div>');

    $chartHolder.append($div);

    jlab.epics2web.runchart.doLayout();

    var plot = $.plot($div.find(".chart-body"), [[]], {
        /*series: {
         lines: {
         show: true
         }
         },
         grid: {
         hoverable: true,
         autoHighlight: false
         },
         crosshair: {
         mode: "x"
         }*/
        xaxis: {
            show: false
        },
        yaxis: {
            labelWidth: 75
        }
    });

    var c = new jlab.epics2web.runchart.Chart(plot);

    jlab.epics2web.runchart.pvToChartMap[pv] = c;

    var pvs = [pv];

    jlab.epics2web.runchart.con.monitorPvs(pvs);

    $("#pv-input").val("");
    $("#chart-holder").css("border", "none");
};

jlab.epics2web.runchart.doLayout = function () {
    var $chartHolder = $("#chart-holder"),
            $charts = $chartHolder.find(".chart");

    var offset = 0;

    $charts.each(function () {
        var chartHeight = $chartHolder.height() / $charts.length;

        $(this).css("top", offset);
        offset = offset + chartHeight;

        $(this).height(chartHeight);
    });
};

jlab.epics2web.runchart.doUpdate = function (pv, point, lastUpdated) {
    var c = jlab.epics2web.runchart.pvToChartMap[pv];
    if (typeof c !== 'undefined') {
        c.addPointSquare(point);
        c.plot.setData([c.data]);
        c.plot.setupGrid();
        c.plot.draw();
        c.lastUpdated = lastUpdated;
    } else {
        console.log('server is updating me on a PV I am unaware of: ' + pv);
    }
};

jlab.epics2web.runchart.minimumUpdate = function () {
    for (var pv in jlab.epics2web.runchart.pvToChartMap) {
        var chart = jlab.epics2web.runchart.pvToChartMap[pv];

        if (chart.data.length > 0 && chart.prev !== null && chart.lastUpdated !== null) {
            var elapsedMillis = Math.abs(new Date() - chart.lastUpdated);
            if (elapsedMillis > jlab.epics2web.runchart.MIN_UPDATE_MILLIS) {
                /*console.log('doing minimum update for pv: ' + pv);*/
                jlab.epics2web.runchart.doUpdate(pv, chart.prev, new Date());
            }
        }
    }
};

$(document).on("click", ".chart-close-button", function () {
    var $chart = $(this).closest(".chart"),
            pv = $chart.find(".chart-title").text();
    jlab.epics2web.runchart.con.clearPvs([pv]);
    $chart.remove();
    delete jlab.epics2web.runchart.pvToChartMap[pv];
    jlab.epics2web.runchart.doLayout();
});

$(function () {
    $('#pv-input').on("keyup", function (e) {
        if (e.keyCode === 13)
        {
            $("#go-button").click();
        }
    });

    /*$(document).on("plothover", ".chart", function (event, pos, item) {
     if (jlab.epics2web.runchart.pvToChartMap !== null) {
     for (var pv in jlab.epics2web.runchart.pvToChartMap) {
     var chart = jlab.epics2web.runchart.pvToChartMap[pv],
     plot = chart.plot;
     if ($(this) !== $(chart)) {
     plot.setCrosshair({x: pos.x});
     } else {
     console.log('same plot');
     }
     }
     }
     });*/

    var options = {};

    jlab.epics2web.runchart.con = new jlab.epics2web.ClientConnection(options);

    jlab.epics2web.runchart.con.onopen = function (e) {
        var pvs = [];

        for (var pv in jlab.epics2web.runchart.pvToChartMap) {
            pvs.push(pv);
        }

        if (pvs.length > 0) {
            jlab.epics2web.runchart.con.monitorPvs(pvs);
        }
    };

    jlab.epics2web.runchart.con.onupdate = function (e) {
        jlab.epics2web.runchart.doUpdate(e.detail.pv, e.detail.value * 1, e.detail.date);
    };

    jlab.epics2web.runchart.con.oninfo = function (e) {
        if (e.detail.connected) {
            if (!jlab.epics2web.isNumericEpicsType(e.detail.datatype)) {
                alert(e.detail.pv + ' values are not numeric: ' + e.detail.datatype);
            }
        } else {
            alert('Could not connect to PV: ' + e.detail.pv);
        }
    };

    window.setInterval(jlab.epics2web.runchart.minimumUpdate, jlab.epics2web.runchart.MIN_UPDATE_MILLIS);
});
