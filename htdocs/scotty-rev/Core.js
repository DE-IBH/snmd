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

    this.srVersion = function () {
        return version;
    };
    
    this.srConfigLoaded = function (json) {
        this.config = json;

        console.debug('Loading ' + this.config.default_view);

        $.ajax({
            'global': false,
            'url': this.config.default_view,
            'dataType': 'json',
            'success': (function (json) {
                Scotty.GUI.srInit(json);
                Scotty.MQTT.srInit(this.config.mqttws_host, this.config.mqttws_port);
            }).bind(this),
            'error': (function (jqXHR, textStatus, errorThrown) {
                console.error('Failed to load view list: ' + textStatus + ' - ' + errorThrown);
            }).bind(this)
        });
    };
    
    this.srInit = function (configURI) {
        console.info('Initializing Scotty REVOLUTION ' + version);
        console.debug('Loading ' + configURI);

        $.ajax({
            'global': false,
            'url': configURI,
            'dataType': 'json',
            'success': this.srConfigLoaded.bind(this),
            'error': ((function (jqXHR, textStatus, errorThrown) {
                console.error('Failed to load config: ' + textStatus + ' - ' + errorThrown);
            }).bind(this))
        });
    };
}).call(Scotty.Core, jQuery);
