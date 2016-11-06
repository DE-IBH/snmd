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
if (typeof Scotty.Core === "undefined") {
    Scotty.Core = {};
}

(function ($) {
    "use strict";

    var version = '0.1',
        config;
    this.si_prefs = ['T', 'G', 'M', 'K', '']; //, 'm', 'µ'
    this.si_facts = [ Math.pow(10, 12), Math.pow(10, 9), Math.pow(10, 6), Math.pow(10, 3), 1]; //, Math.pow(10, -3), Math.pow(10, -6)
    this.genid = 0;

    this.srVersion = function () {
        return version;
    };

    this.srURLParam = function (name, defval) {
        var results = new RegExp('[?&]' + name + '=([^&#/]*)([&#/]|$)').exec(window.location.href);
        if (results && results[1]) {
            return decodeURIComponent(results[1]);
        }
    
        return defval;
    };

    this.srConfigLoaded = function (json) {
        this.config = json;

        console.debug('Loading ' + this.config.default_view);

        $.ajax({
            'global': false,
            'url': this.config.default_view + '?nonce=' + Math.random(),
            'dataType': 'json',
            'success': (function (json) {
                Scotty.GUI.srInit(json);

                /* MQTT defaults */
                if (typeof this.config.mqttws_host === "undefined") {
                    this.config.mqttws_host = window.location.hostname;
                }
                if (typeof this.config.mqttws_port === "undefined") {
                    this.config.mqttws_port = 9001;
                }

                Scotty.MQTT.srInit(this.config.mqttws_host, this.config.mqttws_port);
            }).bind(this),
            'error': (function (jqXHR, textStatus, errorThrown) {
                console.error('Failed to load view list: ' + textStatus + ' - ' + errorThrown);
            }).bind(this)
        });
    };
    
    this.srInitLoad = function (configURI, failfn) {
        console.debug('Loading ' + configURI);

        $.ajax({
            'global': false,
            'url': configURI + '?nonce=' + Math.random(),
            'dataType': 'json',
            'success': this.srConfigLoaded.bind(this),
            'error': failfn
        });
    };
    
    this.srInit = function () {
        console.info('Initializing Scotty REVOLUTION ' + version);

        var configName = this.srURLParam('config', 'default');
        if (configName !== 'default') {
            $('#snmd-title').text(configName);
        } else {
            $('#snmd-title').text(window.location.host);
        }

        this.srInitLoad('configs/' + configName + '.json', (function () {
            this.srInitLoad('configs/default.json', function (jqXHR, textStatus, errorThrown) {
                console.error('Failed to load configuration: ' + textStatus + ' - ' + errorThrown);
            });
        }).bind(this));
    };

    this.srSiFormatNum = (function (value, unit, defstr, fracts) {
        if (typeof value === "undefined") { return defstr; }
        if (isNaN(value)) { return defstr; }
        if (typeof fracts === "undefined" || isNaN(fracts)) {
            fracts = 0;
        }

        var j = 4;
        var f = 1;
        for (var i = 0; i < this.si_facts.length; i++) {
            if(value >= this.si_facts[i]*0.99) {
                j = i;
	           break;
	       }
        }
        
        return  sprintf("%." + fracts + "f%s%s", value / this.si_facts[j], this.si_prefs[j], unit);
    }).bind(this);
    
    this.srNagStateColor = (function (state) {
        if(typeof state === "undefined") {
            return "Grey";
        }
            
        if (state == 0) {
            return 'LimeGreen';
        } 
        
        if (state == 1) {
            return 'Gold';
        }

        if (state == 2) {
            return 'Crimson';
        } 

        return "Orange";
    });
    
    this.srGenID = (function (prefix) {
        this.genid += 1;
        return 'snmd-genid-' + prefix + '-' + this.genid;
    }).bind(this);
}).call(Scotty.Core, jQuery);
