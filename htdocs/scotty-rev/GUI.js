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
if (typeof Scotty.GUI === "undefined") {
    Scotty.GUI = {};
}

(function ($) {
    "use strict";

    var idCounter = 0;
    
    this.srInit = function (views) {
        $('.srViews').each(function () {
            var views2id = {};
            
            var nav = $(this).children('.srViewsNav');
            Object.keys(views).forEach(function (k) {
                views2id[k] = 'srView-' + (idCounter += 1).toString(16);
                nav.append('<li><a href="#' + views2id[k] + '"><span>' + views[k] + "</span></a></li>");
            });

            var div = $(this).children('.srViewsDiv');
            Object.keys(views).forEach(function (k) {
                div.append('<div class="svgview" id="' + views2id[k] + '"></div>');

                Scotty.SVG.srLoadSVG(views2id[k], k);
            });

            var tabDivs = div;

            nav.find('a').click(function () {
                console.debug('Viewing '  + this.hash);

                div.children().fadeOut(600).filter(this.hash).fadeIn(600);
                nav.find('a').removeClass('selected').filter(this).addClass('selected');

                return false;
            }).filter(':first').click();
        });
    };
}).call(Scotty.GUI, jQuery);
