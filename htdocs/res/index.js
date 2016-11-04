/*
scotty-rel - Scotty RELOADED Network Management Tool

Authors:
  Thomas Liske <thomas@fiasko-nw.net>

Copyright Holder:
  2012 - 2013 (C) Thomas Liske [https://fiasko-nw.net/~thomas/tag/scotty]
  2014        (C) IBH IT-Service GmbH [http://www.ibh.de/OSS/Scotty]

License:
  This program is free software; you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation; either version 2 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this package; if not, write to the Free Software
  Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301 USA
*/

$(function () {
    var tabDivs = $('div.tabs > div');

    $('div.tabs ul.nav a').click(function () {
        tabDivs.hide().filter(this.hash).show();

        $('div.tabs ul.nav a').removeClass('selected');
        $(this).addClass('selected');

        window.CURRENT_VIEW = this.hash;
        log('Viewing '  + this.hash.substr(1) + '...');

        scotty_updatesvg(this.hash, 1);

        return false;
    }).filter(':first').click();
});

function log(msg) {
    $('#log').append(new Date().toTimeString() + " " + msg + "\n");
    $('#log').scrollTop($('#log')[0].scrollHeight - $('#log').height());
}

function scotty_about() {
    var popup = $('#scotty_about_popup');
    popup.offset({
	top: ($(document).height() -  popup.height())/2,
	left: ($(document).width() -  popup.width())/2,
    });
    popup.toggle();
}

var ws;
var idmap;
var ridmap = new Object();
var series = new Object();
var sermax = new Object();
var services = new Object();
var svgviews = new Object();
var svgdirty = new Object();
var svgcharts = new Object();
var viewstoload = new Array();
var viewsloaded = new Array();
var flashTO;
var si_prefs = ['T', 'G', 'M', 'k', '', 'm', 'µ'];
var si_facts = [ Math.pow(10,12), Math.pow(10,9), Math.pow(10,6), Math.pow(10,3), 1, Math.pow(10,-3), Math.pow(10,-6)];
var spinner;

function scotty_fnum(value, unit) {
    if(isNaN(value))
	return value;

    var j = 4;
    var f = 1;
    for(var i = 0; i < si_facts.length; i++) {
	if(value >= si_facts[i]*0.99) {
	    j = i;
	    break;
	}
    }
    return Math.round(value / si_facts[j]) + si_prefs[j] + unit;
}

function scotty_init() {
    var wsurl = window.location.toString().replace(/^http/i, "ws");
    if(wsurl.charAt(wsurl.length-1) != '/') {
	wsurl += '/';
    }
    wsurl += 'ws';
    log("[WS] URL = '" + wsurl + "'");
    ws = new WebSocket(wsurl);

    ws.onopen = function() {
        $(window.CURRENT_VIEW).spin();
        log("[WS] open");
        $('#scotty_hb').css("background", "yellow");
    };
    ws.onmessage = function(e) {
        var m = JSON.parse(e.data);
        switch(m[0]) {
	    case "map":
		log("[WS] map:");
		idmap = m[1];
		for(var key in m[1]) {
		    log(key + " = " + m[1][key]);
		    ridmap[m[1][key]] = key;
		}
		break;
	    case "series":
		log("[WS] services:");
		for(var srv in m[1]) {
		    log(" " + ridmap[srv]);
		    services[srv] = new Object();
		    for(var opt in m[1][srv]) {
			services[srv][opt] = m[1][srv][opt];
			if(opt == "max") {
			    for(var i in services[srv][opt]) {
				services[srv][opt][i] = parseInt(services[srv][opt][i]);
			    }
			}
		    }
		}
		break;
	    default:
		$(window.CURRENT_VIEW).spin(false);
		clearTimeout(flashTO);
		$('#scotty_hb').css("background", "#00ff00");
		for(var key in m) {
		    scotty_adddata(key, m[key]);
		}
		scotty_updatesvg(window.CURRENT_VIEW);
		flashTO = setTimeout("$('#scotty_hb').css('background', '#007f00');", 150);
		break;
        }
    };
    ws.onclose = function() {
        log("[WS] closed");
	$('#scotty_hb').css("background", "#7f0000");
	$(window.CURRENT_VIEW).spin(false);
    };
    ws.onerror = function() {
        log("[WS] failed");
	$('#scotty_hb').css("background", "#ff0000");
	$(window.CURRENT_VIEW).spin(false);
    };
}

function scotty_adddata(key, value) {
    if(typeof series[key] == "undefined") {
	series[key] = new Array(60);
    }

    try {
	series[key].push(value);
	if(series[key].length > 60) {
	    series[key].shift();
	}

	for(idx in value) {
	    var v = value[idx];

	    if(isNaN(v))
		continue;

	    var f = (isNaN(services[key]["max"][idx]) ? 1.2 : 1);
	    if(typeof sermax[key] == "undefined")
		sermax[key] = new Array();
	    else if(typeof sermax[key][idx] == "undefined")
		sermax[key][idx] = v * f;
	    else if(value[idx] > sermax[key][idx])
		sermax[key][idx] = v * f;
	}

	svgdirty[key] = 1;
    }
    catch(err) {
	log(ridmap[key] + ": [" + value + "] => " + err);
    }
}

function scotty_getmax(chartid, idx) {
    var max = services[chartid]["max"];
    var ret = (isNaN(max[idx]) ?
	(
	    idx > 0 && services[chartid]["unit"][idx] == services[chartid]["unit"][idx-1] ?
	    scotty_getmax(chartid, idx-1)
	    :
	    sermax[chartid][idx]
	) : max[idx]);
    return (ret > 0 ? ret : 1);
}

function scotty_updatesvg(view, redraw) {
    var svg = svgviews[view];

    if(redraw) {
	svgdirty = new Object();
	for(id in ridmap) {
	    svgdirty[id] = 1;
	}
    }

    for(var chartid in svgdirty) {
	if(typeof svgcharts[view][ridmap[chartid]] != "undefined") {
	    if(typeof services[chartid] == "undefined") {
		log("Unknown service '" + chartid + "' (chart '" + ridmap[chartid] + "')!");
	    }

	    var chart = svgcharts[view][ridmap[chartid]];
	    var dx = (chart.width - 4) / 60;
	    var ox = chart.x + 2 + dx;
	    var oy = chart.y + chart.height - 2;
	    var my = chart.height - 14;
	    for(idx in services[chartid].label.slice(0,2)) {
		var points = new Array();
		var maxy = scotty_getmax(chartid, idx);
		var fy = my / maxy;
		var last;
		for(var i=0; i < 60; i++) {
		    if(typeof series[chartid][i] != "undefined") {
			if((idx == 0) &&
			   (i == 0 || typeof series[chartid][i-1] == "undefined"))
			    points.push([ox + dx*i, oy]);

			var v = series[chartid][i][idx];
			last = v;
			if(typeof v == "undefined")
			    v = 0;
			
			v *= fy;
			points.push([ox + dx*i, oy - (v < my ? v : my)]);

			if((idx == 0) && (i == 59))
			    points.push([ox + dx*i, oy]);
		    }
		}

		if(typeof chart.line == "undefined") {
		    chart.line = new Array();
		}

		if(typeof chart.line[idx] != "undefined") {
		    svg.remove(chart.line[idx]);
		}

		if(idx == 0) {
		    chart.line[idx] = svg.polygon(points, {stroke: services[chartid].color[idx], strokeWidth: 1, fill: services[chartid].color[idx]});
		}
		else {
		    chart.line[idx] = svg.polyline(points, {stroke: services[chartid].color[idx], strokeWidth: 1.5, fill: 'none'});
		}

		if(typeof chart.cval == "undefined") {
		    chart.cval = new Array();
		}

		if(typeof chart.cval[idx] != "undefined") {
		    chart.cval[idx].textContent = (last > 0 ? scotty_fnum(last, services[chartid].unit[idx]) : '');
		}
		else {
		    if(idx == 0)
			chart.cval[idx] = svg.text(
			    chart.x + 2, chart.y + 10,
			    (last > 0 ? scotty_fnum(last, services[chartid].unit[idx]) : ''),
			    {
				fontSize: '10px',
				fill: services[chartid].color[idx],
				textAnchor: 'begin',
			    }
			);
		    else
			chart.cval[idx] = svg.text(
			    chart.x + chart.width - 2, chart.y + 10,
			    (last > 0 ? scotty_fnum(last, services[chartid].unit[idx]) : ''),
			    {
				fontSize: '10px',
				fill: services[chartid].color[idx],
				textAnchor: 'end',
			    }
			);
		}
	    }
	}
    }

    svgdirty = new Object();
}

function scotty_createChart(svg, chart) {
    var rect = svg.rect(
	chart.x, chart.y, chart.width, chart.height, 
	{
	    id: chart.id,
	    stroke: 'black',
	    fill: 'white'
	}
    );
}

function scotty_loadView(id, view) {
    viewstoload.push(id);
    $('#' + id).svg({loadURL: view, onLoad: scotty_loadViewDone});
}

function scotty_loadViewDone(svg, error) {
    if(error) {
	log('Failed: ' + error);
	svg.text(10, 20, error, {fill: 'red'});
	return;
    }

    log('Searching charts...');
    var view = this.id;
    svgviews["#" + view] = svg;
    svgcharts["#" + view] = new Object();
    $('rect[id^="so_"]', svg.root()).each(function() {
	log(' ' + this.id.substring(3));
	var chart = {
	    id: this.id.substring(3),
	    x: parseInt(this.getAttribute("x")),
	    y: parseInt(this.getAttribute("y")),
	    width: parseInt(this.getAttribute("width")),
	    height: parseInt(this.getAttribute("height")),
	};
	svg.remove(this);
	scotty_createChart(svg, chart);
	svgcharts["#" + view][this.id.substring(3)] = chart;
    });

    $('rect:not([id^="rect"])').qtip({
	content: {
	    title: {
		text: function(api) {
		    var chartid = idmap[this.attr('id')];
		    var descr = this.attr('id').split('_');
		    return (typeof services[chartid] != 'undefined' && services[chartid].title ? descr[0] + ": " + services[chartid].title : descr[0]);
	        }
	    },
	    text: function(api) {
		var chartid = idmap[this.attr('id')];
		var data = new Array();
		if(typeof services[chartid] != 'undefined' && typeof series[chartid] != 'undefined')
		    for(l in services[chartid].label) {
			data.push(
			    "<span style='color:" +
				services[chartid].color[l] +
				"'>" +
				services[chartid].label[l] +
				" = " +
				(series[chartid][59][l] != null ? scotty_fnum(series[chartid][59][l], services[chartid].unit[l]) : "?") +
				(isNaN(sermax[chartid][l]) || series[chartid][59][l] == sermax[chartid][l] || series[chartid][59][l] == null ? '' :
				 " &#8804; " + scotty_fnum(sermax[chartid][l], services[chartid].unit[l])
				    ) +
				"</span>"
			);
		    }
		return data.join('<br/>');
	    }
	}
    });

    viewsloaded.push(this.id);
    if(viewstoload.length == viewsloaded.length) {
	log("[WS] Request map...");
	ws.send("connect");
    }
}
