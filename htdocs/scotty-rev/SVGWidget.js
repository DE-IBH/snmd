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
if (typeof Scotty.SVGWidget === "undefined") {
    Scotty.SVGWidget = {};
}

(function ($) {
    "use strict";
    
    this.Impl = {};
    this.Widgets = {};
    
    this.srRegisterImpl = (function (name, impl) {
        this.Impl[name] = impl;
    }).bind(this);

    this.srLookupImpl = (function (name) {
        return this.Impl[name];
    }).bind(this);
    
    this.srRegisterWidget = (function (name, widget) {
        this.Widgets[name] = widget;
    }).bind(this);

    this.srLookupWidget = (function (name) {
        return this.Widgets[name];
    }).bind(this);
    
    this.srCreateWidget = (function (root, dim, desc) {

        if (typeof desc.type === "undefined") {
            console.error("Widget " + dim.id + " has no type set!");
            return;
        }
        
        if (typeof this.Widgets[desc.type] === "undefined") {
            console.error("Widget " + dim.id + " has unknown type: " + desc.type);
            return;
        }
        
        try {
            var obj = new (this.Widgets[desc.type])(root, dim, desc, this.Widgets[desc.type]);
            desc.topics.forEach(function (topic) {
                Scotty.MQTT.srRegisterTopic(topic, obj);
            });
        } catch (err) {
            console.error("Failed to create widget " + dim.id + ": " + err.message);
            return;
        }
    }).bind(this);
}).call(Scotty.SVGWidget, jQuery);
