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
if (typeof Scotty.SVGImpl.Gradient === "undefined") {
    Scotty.SVGImpl.Gradient = {};
}

(function ($) {
    "use strict";
    
    var Gradient = function (root, svg, opts, qtip) {
        /* Meta data */
        this.opts = opts;

        /* SVG container */
        this.root = root;
        this.svg = svg;

        /* SVG element */
        opts.cls.base.forEach(function (cl) {
            this.svg.classList.add(cl);
        }, this);

        /* Set qtip if available */
        if (typeof qtip !== "undefined") {
            this.svg.qtip(qtip);
        }

        this.grad = root.linearGradient(null, 'foo', [
            [0.0769, 'hsl(49.16,100%,50%)'],
            [0.2308, 'hsl(50.04,100%,50%)'],
            [0.3846, 'hsl(47.04,100%,50%)'],
            [0.5385, 'hsl(50.40,100%,50%)'],
            [0.6923, 'hsl(49.40,100%,50%)'],
            [0.8462, 'hsl(57.60,100%,50%)'],
            [1.0000, 'hsl(56.16,100%,50%)']
        ], 0, 0, 1, 0);
        svg.style.fill = 'url(#foo)';
    };
    
    Gradient.prototype.update = function (val, state, formatNumeric) {
    };

    Scotty.SVGWidget.srRegisterImpl(
        "Gradient",
        Gradient
    );
}).call(Scotty.SVGImpl.Gradient, jQuery);
