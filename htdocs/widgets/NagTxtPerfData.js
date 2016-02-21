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
    
    var NagTxtPerfData = function (root, svg, desc) {
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
        if(typeof this.desc.uom === "undefined") {
            this.opts.uom = '';
        } else {
            this.opts.uom = this.desc.uom;
        }
        this.last = {};
        for (var i = 0; i < desc.topics.length; i++) {
            this.last[desc.topics[i]] = [0];
        }

        this.chart = new (Scotty.SVGWidget.srLookupImpl("Text"))(root, svg, this.opts);
    };
    
    NagTxtPerfData.prototype.handleUpdate = function (topic, msg) {
        var json;
        try {
            json = JSON.parse(msg);
        } catch (err) {
            console.error('JSON error in performance data: ' + err.message);
            return;
        }
        
        this.last[topic] = 0;
        try {
            this.last[topic] = json.perf_data[this.desc.key].val;
        } catch (err) {
            console.warn("Error to process performance data: " + err.message);
        }
        
        var val = 0;
        for(var t in this.last) {
            var v = parseFloat(this.last[t]);
            if(isNaN(v)) {
                v = 0;
            }
            val += v;
        }
        
        this.chart.update(json._timestamp, val);
    };

    Scotty.SVGWidget.srRegisterWidget(
        "NagTxtPerfData",
        NagTxtPerfData
    );
}).call(this, jQuery);
