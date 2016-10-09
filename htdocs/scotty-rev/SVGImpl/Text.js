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
if (typeof Scotty.SVGImpl === "undefined") {
    Scotty.SVGImpl = {};
}
if (typeof Scotty.SVGImpl.Text === "undefined") {
    Scotty.SVGImpl.Text = {};
}

(function ($) {
    "use strict";
    
    var Text = function (root, svg, opts, qtip) {
        /* Meta data */
        this.opts = opts;

        /* SVG container */
        this.root = root;

        /* SVG text element */
        this.txt = svg;
        this.txt.style.stroke = "";
        this.txt.style.fill = "";
        this.txt.textContent = "?";
        opts.cls.base.forEach(function (cl) {
            this.txt.classList.add(cl);
        }, this);

        /* Set qtip if available */
        if (typeof qtip !== "undefined") {
            this.txt.qtip(qtip);
        }
    };
    
    Text.prototype.update = function (val, state, formatNumeric) {
        if (this.last_val === val && state === this.last_state) {
            return;
        }

        if (typeof formatNumeric === "undefined") {
            formatNumeric = true;
        }
        
        /* Update text elements. */
        this.txt.textContent = (formatNumeric ? Scotty.Core.srSiFormatNum(val, this.opts.uom, '-', this.opts.fracts) : val);
        this.last_val = val;

        /* Add state classes. */
        if (state !== this.last_state) {
            this.opts.cls.state.forEach(function (cl) {
                this.txt.classList.remove(cl + this.last_state);
            }, this);

            this.opts.cls.state.forEach(function (cl) {
                this.txt.classList.add(cl + state);
            }, this);

            this.last_state = state;

            Scotty.GUI.srStateChanged(this.root._svg.parentElement.id, this.txt.id, state);
        }
    };

    Scotty.SVGWidget.srRegisterImpl(
        "Text",
        Text
    );
}).call(Scotty.SVGImpl.Text, jQuery);
