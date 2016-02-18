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
    
    var NagiosCpuUtil = function (root, dim, desc) {
        this.opts = {
            dim: {
                x: dim.x,
                y: dim.y,
                w: dim.width,
                h: dim.height
            },
            id: dim.id,
            axis: [
                {
                    max: 100,
                    scale: 'linear'
                }
            ],
            stroke: 'yellow',
            fill: 'white',
            desc: desc,
            dpi: 60 / 5 / 60
        };
        this.lines = [
            {
                name: 'util',
                axis: 0,
                unit: '%',
                style: {
                    stroke: 'Orchid',
                    strokeLineCap: 'round',
                    strokeLineJoin: 'round',
                    strokeWidth: 1,
                    fill: 'Orchid'
                }
            }
        ];
        
        this.desc = desc;
        this.last = {};
        for (var i = 0; i < desc.topics.length; i++) {
            this.last[desc.topics[i]] = [0, 0];
        }

        this.chart = new (Scotty.SVGWidget.srLookupImpl("Chart"))(root, this.opts, this.lines);
    };
    
    NagiosCpuUtil.prototype.handleUpdate = function (topic, msg) {
        var json;
        try {
            json = JSON.parse(msg);
        } catch (err) {
            console.error('JSON error in performance data: ' + err.message);
            return;
        }
        
        for (var i = 0; i < this.lines.length; i++) {
            this.last[topic][i] = 0;
            try {
                this.last[topic][i] = json.perf_data[this.lines[i].name].val;
            } catch (err) {
                console.warn("Error to process performance data of " + line + ": " + err.message);
            }
        }
        
        var vals = [];
        for (var i = 0; i < this.lines.length; i++) {
            vals[i] = 0;

            for(var t in this.last) {
                vals[i] += this.last[t][i];
            }
        }
        
        this.chart.update(json._timestamp, vals);
    };

    Scotty.SVGWidget.srRegisterWidget(
        "NagiosCpuUtil",
        NagiosCpuUtil
    );
}).call(this, jQuery);
