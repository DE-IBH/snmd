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

if (typeof Scotty === "undefined") {
    Scotty = {};
}
if (typeof Scotty.SVGImpl === "undefined") {
    Scotty.SVGImpl = {};
}
if (typeof Scotty.SVGImpl.Class === "undefined") {
    Scotty.SVGImpl.Class = {};
}

(function ($) {
    "use strict";
    
    var Class = function (root, svg, opts, qtip) {
        /* Meta data */
        this.opts = opts;
        
        /* SVG element */
        this.el = svg;

        /* Set qtip if available */
        if (typeof qtip !== "undefined") {
            this.el.qtip(qtip);
        }
    };
    
    Class.prototype.update = function (state) {
        if (state === this.last_state) {
            return;
        }
        
        /* Update Class elements */
        this.txt.classList.add('snmd-state-' + state);
        this.txt.classList.remove('snmd-state-' + this.last_state);

        this.last_state = state;
        Scotty.GUI.srStateChanged(this.root._svg.parentElement.id, this.txt.id, state);
    };

    Scotty.SVGWidget.srRegisterImpl(
        "Class",
        Class
    );
}).call(Scotty.SVGImpl.Class, jQuery);
