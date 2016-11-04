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

(function ($) {
    "use strict";
    
    var NagFcBwChart = function (root, svg, desc) {
        this.opts = {
            axis: [
                {
                    max: 100 * 1000000,
                    scale: 'linear'
                }
            ],
            desc: desc,
            dpi: 60 / 5 / 60,
            cls: Scotty.SVGWidget.srClassOpts(desc, "Chart"),               /* rect classes    */
            lcls: ['snmd-lcl-Nag', 'snmd-lcl-NagFc', 'snmd-lcl-NagFcBw'],   /* line classes    */
            mcls: ['snmd-mcl-Nag', 'snmd-mcl-NagFc', 'snmd-mcl-NagFcBw'],   /* maxline classes */
            tcls: ['snmd-tcl-Nag', 'snmd-tcl-NagFc', 'snmd-tcl-NagFcBw']    /* text classes    */
        };

        // get max scaling
        var max = 0;
        for (var t = 0; t < desc.topics.length; t++) {
            max +=   this.opts.axis[0].max;
        }
        this.opts.axis[0].max = max;
        if (typeof desc.max !== "undefined") {
            var m = parseFloat(desc.max);
            if (!isNaN(m)) {
                this.opts.axis[0].max = m;
            }
        }

        this.lines = [
            {
                name: 'in',
                axis: 0,
                unit: 'B'
            },
            {
                name: 'out',
                axis: 0,
                unit: 'B'
            }
        ];
        
        this.desc = desc;
        this.last = {};
        for (var t = 0; t < desc.topics.length; t++) {
            this.last[desc.topics[t]] = [];
            for(var i = 0; i < this.lines.length; i++) {
                this.last[desc.topics[t]][i] = {};
            }
        }

        this.chart = new (Scotty.SVGWidget.srLookupImpl("Chart"))(root, svg, this.opts, this.lines);
    };
    
    NagFcBwChart.prototype.handleUpdate = function (topic, msg) {
        var json;
        try {
            json = JSON.parse(msg);
        } catch (err) {
            console.error('JSON error in performance data: ' + err.message);
            return;
        }
        
        for (var i = 0; i < this.lines.length; i++) {
            this.last[topic][i].val = 0;
            this.last[topic][i].state = 0;
            try {
                this.last[topic][i].val = json.perf_data[this.lines[i].name].val;
                this.last[topic][i].state = json.state;
            } catch (err) {
                console.warn("Error to process performance data of " + line + ": " + err.message);
            }
        }
        
        var vals = [];
        var state = 0;
        for (var i = 0; i < this.lines.length; i++) {
            vals[i] = 0;

            for(var t in this.last) {
                var v = parseFloat(this.last[t][i].val);
                if(isNaN(v)) {
                    v = 0;
                }
                vals[i] += v;
                state = Math.max(state, this.last[t][i].state);
            }
        }
        
        this.chart.update(json._timestamp, vals, state);
    };

    Scotty.SVGWidget.srRegisterWidget(
        "NagFcBwChart",
        NagFcBwChart
    );
}).call(this, jQuery);
