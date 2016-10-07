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
    
    var Chart = function (root, svg, opts, lines, qtip) {
        /* Meta data */
        this.opts = opts;
        this.lines = lines;

        /* SVG container */
        this.root = root;

        /* Remove placeholder */
	    opts.dim =  {
            id: svg.id,
	        x: svg.x.baseVal.value,
	        y: svg.y.baseVal.value,
	        width: svg.width.baseVal.value,
	        height: svg.height.baseVal.value
	    };
        root.remove(svg);
        
        /* Create SVG background */
        this.rect = root.rect(
            opts.dim.x,
            opts.dim.y,
            opts.dim.width,
            opts.dim.height,
            {
                id: opts.dim.id,
                'class': opts.cls.base.join(' ')
	        }
        );

        /* Set qtip if available */
        if (typeof qtip !== "undefined") {
            this.rect.qtip(qtip);
        }

        /* SVG text elements showing current values */
        this.txt = [
            root.text(opts.dim.x + 2, opts.dim.y + 10, '', {
                fontSize: '10px',
                fill: this.lines[0].style.stroke,
                textAnchor: 'begin'
            })
        ];
        if (lines.length > 1) {
            this.txt[1] = root.text(opts.dim.x + opts.dim.width - 2, opts.dim.y + 10, '', {
                fontSize: '10px',
                fill: this.lines[1].style.stroke,
                textAnchor: 'end'
            });
        }

        /* TS window: used to drop old data */
        this.data_tswin = (opts.dim.width - 6) / opts.dpi;
        /* Variables used for recording data points */
        this.data_ts = [];
        this.data_lines = [];
        this.data_svg = [];
        for (var i = 0; i < lines.length; i++) {
            this.data_lines[i] = [];
        }

        this.axis_maxlines = [];
        this.axis_maxlasts = [];
    };
    
    Chart.prototype.update = function (ts, data, state) {
        var stroke = Scotty.Core.srNagStateColor(state);
        
        /* Record current data points */
        this.data_ts.push(ts);
        var maxy = (typeof this.opts.axis[0].max === "undefined" ? 0 : this.opts.axis[0].max);
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

        /* Axis scaling */
        if(typeof this.opts.axis[0].max !== "undefined") {
            if(this.axis_maxlasts[0] != maxy) {
                this.axis_maxlasts[0] = maxy;
            }
        }

        /* Adjust max Y for log scale */
        if(this.opts.axis[0].scale == "log") {
            maxy = Math.log10(maxy);
        }

        /* Update chart with new lines */
	    var ox = this.opts.dim.x + this.opts.dim.width - 3;
	    var oy = this.opts.dim.y + this.opts.dim.height - 3;
	    var my = this.opts.dim.height - 14;
        var fy = my / maxy;
        var clean = [];
        var last = [];

        /* Axis max lines */
        if(typeof this.opts.axis[0].max !== "undefined") {
            var numlines = (this.opts.axis[0].max < this.axis_maxlasts[0] ? Math.floor(this.axis_maxlasts[0] / this.opts.axis[0].max) : 0);
            for(var i = 0; i < numlines; i++) {
                if(typeof this.axis_maxlines[i] !== "undefined") {
                    clean.push(this.axis_maxlines[i]);
                }

                var y = oy - (i + 1) * this.opts.axis[0].max * fy;
                this.axis_maxlines[i] = this.root.line(this.opts.dim.x, y, this.opts.dim.x + this.opts.dim.width, y, {stroke: 'black', strokeWidth: 0.6});
            }
            if(this.axis_maxlines.length > numlines) {
                clean = clean.concat( this.axis_maxlines.splice(numlines, this.axis_maxlines.length - numlines) );
            }
        }

        /* Data lines */
        for (var l = 0; l < this.data_lines.length; l++) {
            var points = [];
            var is_polygon = (this.lines[l].style.fill.toLowerCase() != 'none');
            
            for (var t = 0; t < this.data_ts.length; t++) {
                var x = ox + (this.data_ts[t] - ts)*this.opts.dpi;

                if(is_polygon && t == 0) {
                    points.push([x, oy]);
                }

                var v = this.data_lines[l][t];
                if(typeof v === "undefined") {
                    v = 0;
                }
                if(isNaN(v)) {
                    v = 0;
                }

                /* Prepare for log scale */
                if(this.opts.axis[0].scale == "log") {
                    if(v > 1) {
                        v = Math.log10(v);
                    }
                    else {
                        v = 0;
                    }
                }
                v *= fy;

                points.push([x, oy - v]);

                if(t == this.data_ts.length - 1) {
                    if(is_polygon) {
                        points.push([x, oy]);
                    }

                    last[l] = this.data_lines[l][t];
                }
            }
            
            if(typeof this.data_svg[l] !== "undefined")
                clean.push(this.data_svg[l]);

            try {
                if(is_polygon) {
                    this.data_svg[l] = this.root.polygon(points, this.lines[l].style);
                }
                else {
                    this.data_svg[l] = this.root.polyline(points, this.lines[l].style);
                }
            } catch (err) {
                console.error("Failed to create poly for " + this.rect.id);
            }

            if(typeof this.txt[l] !== "undefined") {
                this.txt[l].textContent = Scotty.Core.srSiFormatNum(last[l], (typeof this.lines[l].unit === "undefined" ? '' : this.lines[l].unit), '-')
            }
        }

        /* Remove old lines */
        while(clean.length) {
            var s = clean.shift();
            this.root.remove(s);
        }

        if(stroke !== this.last_stroke) {
            this.rect.style.stroke = stroke;
            this.last_stroke = stroke;
        }

        if (state !== this.last_state) {
            this.opts.cls.state.forEach(function (cl) {
                this.rect.classList.remove(cl + this.last_state);
            }, this);

            this.opts.cls.state.forEach(function (cl) {
                this.rect.classList.add(cl + state);
            }, this);
            
            this.last_state = state;

            Scotty.GUI.srStateChanged(this.rect.parentElement.parentElement.id, this.rect.id, state);
        }
    };

    Scotty.SVGWidget.srRegisterImpl(
        "Chart",
        Chart
    );
}).call(Scotty.SVGImpl.Chart, jQuery);
