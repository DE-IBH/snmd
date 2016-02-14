/*
scotty-rev - Scotty REVOLUTION Network Management Dashboard

Authors:
  Thomas Liske <liske@ibh.de>

Copyright Holder:
  2012 - 2013 (C) Thomas Liske [https://fiasko-nw.net/~thomas/tag/scotty]
  2014 - 2016 (C) IBH IT-Service GmbH [http://www.ibh.de/OSS/Scotty]

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

/*jslint
    devel: true
*/

if (typeof Scotty === "undefined") {
    Scotty = {};
}
if (typeof Scotty.SVG === "undefined") {
    Scotty.SVG = {};
}

(function ($) {
    "use strict";

    var svg = {};
    
    this.srParseSVG = function (svg, error) {
        if (error) {
            console.error('Failed loading SVG: ' + error);
            svg.text(10, 20, error, {fill: 'red'});
            return;
        }

        $('[id^="sr_"]', svg.root()).each(function () {
	        console.log(' ' + this.id.substring(3));
	        var chart = {
                id: this.id,
	            x: this.x.baseVal.value,
	            y: this.y.baseVal.value,
	            width: this.width.baseVal.value,
	            height: this.height.baseVal.value
	        };
           
            var json;
            try {
                json = JSON.parse($(this).find("desc").text());
            } catch (err) {
                console.error('JSON error in description for graph #' + this.id + ': ' + err.message);
            }
            if (json) {
                svg.remove(this);
                Scotty.SVGWidget.srCreateWidget(svg, chart, json);
            }
        });
    };
    
    this.srLoadSVG = function (id, url) {
        console.debug('Loading #' + id + ': ' + url);
        $('#' + id).svg({loadURL: url, 'max-width': '100%', 'max-height': '100%', onLoad: this.srParseSVG});
    };
}).call(Scotty.SVG, jQuery);
