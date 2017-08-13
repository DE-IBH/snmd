/*
SNMD - Simple Network Monitoring Dashboard
  https://github.com/DE-IBH/snmd/

Authors:
  Thomas Liske <liske@ibh.de>

Copyright Holder:
  2012 - 2013 (C) Thomas Liske [https://fiasko-nw.net/~thomas/]
  2014 - 2016 (C) IBH IT-Service GmbH [https://www.ibh.de/]

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
    devel: true,
    plusplus: true,
    vars: true
*/

/*global
    require
*/

require.config({
    baseUrl: "blib",
    paths: {
        "jquery": "jquery/dist/jquery",
        "js-logger": "js-logger/src/logger.min",
        "JSON.minify" : "../lib/JSON.minify-javascript/minify.json.min",
        "jquery-mobile" : "../lib/jquery.mobile/jquery.mobile.custom.min"
    },
    shim: {
        "JSON.minify" : {
            exports: "JSON"
        }
    },
    enforceDefine: true,
    urlArgs: "cid=" + (new Date()).getTime()
});

require(["jquery", "jquery-mobile", "js-logger", "JSON.minify"], function ($, jqm, Logger, JSON) {
    'use strict';

    var version = '0.3.3';
    Logger.useDefaults();
    Logger.setLevel(Logger.INFO);

    var loadSNMD = function(cache_id) {
        $.ajax({
            url: 'config.json',
            dataType: 'json',
            dataFilter: function (data, type) {
                return JSON.minify(data);
            },
            success: function (config, textStatus) {
                if (config.snmd_devel === true) {
                    Logger.setLevel(Logger.DEBUG);

                    // use non-minified snmd-core package
                    require.config({
                        paths: {
                            "snmd-core": "snmd-core"
                        },
                        urlArgs: "cid=" + cache_id
                    });
                } else {
                    // use minified snmd-core package and allow js caching
                    require.config({
                        paths: {
                            "snmd-core": "snmd-core/dist"
                        },
                        urlArgs: "cid=" + cache_id
                    });
                }


                require(["snmd-core/js/Main"], function (Main) {
                    var main = new Main(config);
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                var msg = "Failed to config file due to " + textStatus + ": " + errorThrown;
                Logger.error(msg);
                $('body').text(msg).css({
                    'font-size': 'larger',
                    'font-weight': 'bold',
                    color: 'red'
                });
            }
        });
        
    };

    
    $.ajax({
        url: 'cache.id',
        dataType: 'text',
        success: function (cache_id) {
            loadSNMD(cache_id);
        },
        error: function () {
            loadSNMD(version);
        }
    });
});
