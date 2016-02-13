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
if (typeof Scotty.SVGImpl === "undefined") {
    Scotty.SVGImpl = {};
}
if (typeof Scotty.SVGImpl.Chart === "undefined") {
    Scotty.SVGImpl.Chart = {};
}

(function ($) {
    "use strict";
    
    var Chart = function (root, opts, lines) {
        /* Meta data */
        this.opts = opts;
        this.lines = lines;

        /* SVG container */
        this.root = root;
        
        /* Create SVG background */
        this.rect = root.rect(
            opts.dim.x,
            opts.dim.y,
            opts.dim.w,
            opts.dim.h,
            {
                id: opts.id,
                stroke: opts.stroke,
                fill: opts.fill
	        }
        );

        /* TS window: used to drop old data */
        this.data_tswin = opts.dim.w / opts.dpi;
        /* Variables used for recording data points */
        this.data_ts = [];
        this.data_lines = [];
        this.data_svg = [];
        for (var i = 0; i < lines.length; i++) {
            this.data_lines[i] = [];
        }
    };
    
    Chart.prototype.update = function (ts, data) {
        /* Record current data points */
        this.data_ts.push(ts);
        var maxy = 0;
        for (var i = 0; i < this.data_lines.length; i++) {
            this.data_lines[i].push(data[i]);
            maxy = Math.max(maxy, Math.max.apply(null, this.data_lines[i]));
        }
        
        /* Drop old data reaching TS window */
        while(this.data_ts[0] < ts - this.data_tswin) {
            this.data_ts.shift();
            for (var i = 0; i < this.data_lines.length; i++) {
                this.data_lines[i].shift();
            }
        }

        /* Update chart with new lines */
	    var ox = this.opts.dim.x + this.opts.dim.w - 2;
	    var oy = this.opts.dim.y + this.opts.dim.h - 2;
	    var my = this.opts.dim.h - 14;
        var fy = my / maxy;
        var clean = [];
        for (var l = 0; l < this.data_lines.length; l++) {
            var points = [];
            var is_polygon = (this.lines[l].style.fill.toLowerCase() != 'none');
            
            for (var t = 0; t < this.data_ts.length; t++) {
                var x = ox + (this.data_ts[t] - ts)*this.opts.dpi;

                if(is_polygon && t == 0)
                    points.push([x, oy]);

                var v = this.data_lines[l][t];
                if(typeof v === "undefined")
                    v = 0;
                v *= fy;

                points.push([x, oy - v]);

                if(is_polygon && t == this.data_ts.length - 1)
                    points.push([x, oy]);
            }
            
            if(typeof this.data_svg[l] !== "undefined")
                clean.push(this.data_svg[l]);

            if(is_polygon) {
                this.data_svg[l] = this.root.polygon(points, this.lines[l].style);
            }
            else {
                this.data_svg[l] = this.root.polyline(points, this.lines[l].style);
            }
        }
        
        /* Remove old lines */
        while(clean.length) {
            var s = clean.shift();
            this.root.remove(s);
        }
    };

    Scotty.SVGWidget.srRegisterImpl(
        "Chart",
        Chart
    );
}).call(Scotty.SVGImpl.Chart, jQuery);
