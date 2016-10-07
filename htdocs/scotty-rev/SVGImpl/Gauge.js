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
if (typeof Scotty.SVGImpl.Gauge === "undefined") {
    Scotty.SVGImpl.Gauge = {};
}

(function ($) {
    "use strict";
    
    var Gauge = function (root, svg, opts, lines, qtip) {
        /* Meta data */
        this.opts = opts;
        this.lines = lines;
        this.cls = opts.cls.base;

        /* SVG container */
        this.root = root;

        /* Remove placeholder */
	    opts.dim = {
            id: svg.id,
	        x: svg.x.baseVal.value,
	        y: svg.y.baseVal.value + svg.height.baseVal.value,
	        width: svg.width.baseVal.value,
	        height: svg.height.baseVal.value
	    };
        
        /* Create SVG background */
        root.remove(svg);
        this.pathdata = new SVGPathData("m " + opts.dim.x + "," + opts.dim.y + " a " + (opts.dim.width / 2) + "," + (opts.dim.height) + " 0 0 1 " + opts.dim.width + ",0");

        /* Set qtip if available */
        if (typeof qtip !== "undefined") {
            this.rect.qtip(qtip);
        }

        this.last_stroke = '';
        this.last_val = -1;

        var alpha = Math.PI;
        this.pathdata.commands[1].x = (1 - Math.cos(alpha / 2)) * 2 * this.pathdata.commands[1].rX;
        this.pathdata.commands[1].y = -1 * Math.sin(alpha) * this.pathdata.commands[1].rY;
        this.root.path(this.pathdata.encode(), {
            'class': this.cls.map(function (cl) {
                return cl + '-BG';
            }).join(' ')
        });
        
        
        //this.update(1, 1, '#404040');
    };
    
    Gauge.prototype.update = function (val, max, state) {
        if (val === this.last_val && state === this.last_state) {
            return;
        }

        if (val > max) {
            val = max;
        }
        var alpha = (val / max) * Math.PI;
        this.pathdata.commands[1].x = (1 - Math.cos(alpha / 2)) * 2 * this.pathdata.commands[1].rX;
        this.pathdata.commands[1].y = -1 * Math.sin(alpha) * this.pathdata.commands[1].rY;

        if (state !== this.last_state) {
            this.opts.cls.state.forEach(function (cl) {
                
                var idx = this.cls.indexOf(cl + this.last_state);
                if (idx > -1) {
                    this.cls.splice(idx, 1);
                }
            }, this);

            this.opts.cls.state.forEach(function (cl) {
                this.cls.push(cl + state);
            }, this);
        }
        
        if (typeof this.svg !== "undefined") {
            this.root.remove(this.svg);
        }
        this.svg = this.root.path(this.pathdata.encode(), {
            id: this.opts.dim.id,
            'class': this.cls.join(' ')
        });
    
        this.last_val = val;

        if (state !== this.last_state) {
            this.last_state = state;

            Scotty.GUI.srStateChanged(this.root._svg.parentElement.id, this.opts.dim.id, state);
        }
    };

    Scotty.SVGWidget.srRegisterImpl(
        "Gauge",
        Gauge
    );
}).call(Scotty.SVGImpl.Gauge, jQuery);
