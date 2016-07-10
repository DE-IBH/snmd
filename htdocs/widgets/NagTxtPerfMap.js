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
    
    var NagTxtPerfMap = function (root, svg, desc) {
        this.opts = {
            axis: [
                {
                    max: 50,
                    scale: 'linear'
                }
            ],
            stroke: 'grey',
            fill: 'white',
            desc: desc,
            dpi: 60 / 5 / 60
        };

        
        this.desc = desc;
        
        this.opts.key = desc.key;
        
        if (typeof desc.map !== "undefined") {
            this.opts.map = desc.map;
        } else {
            this.opts.map = {};
        }

        if (desc.topics.length !== 1) {
            throw "NagTextPerfMap supports a single topic, only!";
        }

        this.chart = new (Scotty.SVGWidget.srLookupImpl("String"))(root, svg, this.opts);
    };
    
    NagTxtPerfMap.prototype.handleUpdate = function (topic, msg) {
        var json;
        try {
            json = JSON.parse(msg);
        } catch (err) {
            console.error('JSON error in performance data: ' + err.message);
            return;
        }
        
        try {
            var val = '';
            if (typeof json.perf_data[this.opts.key] !== "undefined") {
                val = json.perf_data[this.opts.key].val;
                if (val in this.opts.map) {
                    val = this.opts.map[val];
                }
            }
            console.warn("val = " + val + "; state = " + json.state);
            this.chart.update(val, json.state);
        } catch (err) {
            console.err("Error to process performance data [" + topic + "]: " + err.message);
        }
    };

    Scotty.SVGWidget.srRegisterWidget(
        "NagTxtPerfMap",
        NagTxtPerfMap
    );
}).call(this, jQuery);
