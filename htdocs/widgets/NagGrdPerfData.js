/*
SNMP - Scotty Network Monitoring Dashboard

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
    
    var NagGrdPerfData = function (root, svg, desc) {
        this.opts = {
            cls: Scotty.SVGWidget.srClassOpts(desc, "Gradient")
        };

        this.desc = desc;
        this.last = {};
        this.states = {};
        this.tmap = {};

        for (var stop in desc.stops) {
            this.last[stop] = [];
            for(var t = 0; t < this.stops[stop].length; t++) {
                var topic = desc.stops[stop][t];

                if (this.tmap[topic].indexOf(stop) == -1) {
                    this.tmap[topic].push(stop);
                }

                this.last[stop][topic] = 0;
            }
        }

        this.grad = new (Scotty.SVGWidget.srLookupImpl("Gradient"))(root, svg, this.opts);

        /* subscribe to topics */
        for (var topic in this.tmap) {
            console.warn(topic);
            Scotty.MQTT.srRegisterTopic(topic, this);
        };
    };
    
    NagGrdPerfData.prototype.handleUpdate = function (topic, msg) {
        var json;
        try {
            json = JSON.parse(msg);
        } catch (err) {
            console.error('JSON error in performance data: ' + err.message);
            return;
        }

        /* set last value of current topic to zero */
        for (var i = 0; i < this.tmap[topic].length; i++) {
            this.last[ this.tmap[topic][i] ][topic] = val;
        }

        /* extract current value */
        var val = 0;
        try {
            this.states[topic] = json.state;

            for (var i = 0; i < this.opts.keys.length; i++) {
                if(typeof json.perf_data[this.opts.keys[i]] !== "undefined") {
                    val += parseFloat(json.perf_data[this.opts.keys[i]].val) * this.factors[topic];
                }
            }

            for (var i = 0; i < this.tmap[topic].length; i++) {
                this.last[ this.tmap[topic][i] ][topic] = val;
            }

        } catch (err) {
            console.err("Error to process performance data [" + topic + "]: " + err.message);
        }
        
        var state = 0;
        var stops = [];
        for(var stop in this.last) {
            var val = 0;

            for(var topic in this.last[stop]) {
                var v = parseFloat(this.last[stop][topic]);
                if(isNaN(v)) {
                    v = 0;
                }
                val += v;

                state = Math.max(state, this.states[topic]);
            }

            stops[stop] = val / this.last[stop].length;
        }
        
        this.grad.update(stops, state);
    };

    Scotty.SVGWidget.srRegisterWidget(
        "NagGrdPerfData",
        NagGrdPerfData
    );
}).call(this, jQuery);
