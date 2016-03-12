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
    
    var NagGaugePerfData = function (root, svg, desc) {
        this.opts = {
            axis: [
                {
                    max: 50,
                    scale: 'linear'
                }
            ],
            stroke: 'yellow',
            fill: 'white',
            desc: desc,
            dpi: 60 / 5 / 60
        };

        
        this.desc = desc;
        if (typeof this.desc.uom === "undefined") {
            this.opts.uom = '';
        } else {
            this.opts.uom = this.desc.uom;
        }

        if (typeof desc.keys === "undefined") {
            this.opts.keys = [desc.key];
        } else {
            this.opts.keys = desc.keys;
        }
        if (typeof desc.factor !== "undefined") {
            this.opts.factor = desc.factor;
        } else {
            this.opts.factor = 1;
        }

        this.last = {};
        for (var i = 0; i < desc.topics.length; i++) {
            this.last[desc.topics[i]] = [];
        }

        this.max = (typeof desc.max === "undefined" ? 100 : desc.max);
        
        this.chart = new (Scotty.SVGWidget.srLookupImpl("Gauge"))(root, svg, this.opts);
    };
    
    NagGaugePerfData.prototype.handleUpdate = function (topic, msg) {
        var json;
        try {
            json = JSON.parse(msg);
        } catch (err) {
            console.error('JSON error in performance data: ' + err.message);
            return;
        }
        
        this.last[topic].val = 0;
        this.last[topic].state = 0;
        try {
            for(var i = 0; i < this.opts.keys.length; i++) {
                if(typeof json.perf_data[this.opts.keys[i]] !== "undefined") {
                    this.last[topic].val += parseFloat(json.perf_data[this.opts.keys[i]].val);
                }
            }
            this.last[topic].state = json.state;
        } catch (err) {
            console.warn("Error to process performance data: " + err.message);
        }
        
        var val = 0;
        var state = 0;
        for(var t in this.last) {
            var v = parseFloat(this.last[t].val);
            if(isNaN(v)) {
                v = 0;
            }
            val += v;
            state = Math.max(state, this.last[t].state);
        }
        
        var stroke = Scotty.Core.srNagStateColor(state);
        this.chart.update(val * this.opts.factor, this.max, stroke);
    };

    Scotty.SVGWidget.srRegisterWidget(
        "NagGaugePerfData",
        NagGaugePerfData
    );
}).call(this, jQuery);
