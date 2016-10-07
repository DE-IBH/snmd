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
    
    this.srClassOpts = (function (desc, impl) {
        var cls = {
            base: ['snmd-bcl-' + impl],
            state: ['snmd-scl-']
        };

        /* add default base class by widget */
        if (typeof desc.type !== "undefined") {
            cls.base.push('snmd-bcls-' + desc.type);
        }

        /* add CSS base classes */
        if (typeof desc.bcls !== "undefined") {
            cls.base.push.apply(opts.cls.base, desc.bcls);
        }

        if (typeof desc.bcl !== "undefined") {
            cls.base.push(desc.bcl);
        }

        /* add CSS classes depending on state */
        if (typeof desc.scls !== "undefined") {
            cls.state.push.apply(opts.cls.state, desc.scls);
        }

        if (typeof desc.scl !== "undefined") {
            cls.state.push(desc.scl);
        }

        return cls;
    }).bind(this);
    
    this.srCreateWidget = (function (root, svg, desc) {

        if (typeof desc.type === "undefined") {
            console.error("Widget " + svg.id + " has no type set!");
            return;
        }
        
        if (typeof this.Widgets[desc.type] === "undefined") {
            console.error("Widget " + svg.id + " has unknown type: " + desc.type);
            return;
        }
        
        try {
            var obj = new (this.Widgets[desc.type])(root, svg, desc, this.Widgets[desc.type]);
            desc.topics.forEach(function (topic) {
                Scotty.MQTT.srRegisterTopic(topic, obj);
            });
        } catch (err) {
            console.error("Failed to create widget " + svg.id + ": " + err.message);
            return;
        }
    }).bind(this);
}).call(Scotty.SVGWidget, jQuery);
