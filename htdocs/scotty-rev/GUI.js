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
    this.TO_SCREEN = 600000;
    this.TO_SWITCH = 30000;
    this.screenState = 0;
    this.viewStates = {};
    this.viewFinalStates = {};
    this.currentStep = 0;

    this.srScreenTimeOut = (function () {
        if (this.screenState === 0) {
            this.screenState += 1;
            $(document.body).addClass('on-screensaver');
        }
        
        $('.srViews').each(function () {
            var a = $(this).children('.srViewsNav').find('a');
            var cur = 0;
            for (var i = 0; i < a.length; i++) {
                if (a[i].hash === Scotty.GUI.currentView) {
                    cur = i;
                }
            }   

            cur += 1;
            if (cur >= a.length) {
                cur = 0;
            }

            a[cur].click();
        });

        this.screenTimeOut = window.setTimeout(this.srScreenTimeOut, this.TO_SWITCH);
    }).bind(this);
    
    this.srStateChanged = (function (root, svg, state) {
        this.viewStates[root][svg] = state;

        if(this.viewFinalStates[root] < state) {
            this.viewFinalStates[root] = state;
            console.log(root + " => " + this.viewFinalStates[root]);
            $('#switch-' + root).css('color', Scotty.Core.srNagStateColor(this.viewFinalStates[root]))
        }
        else {
            if(this.viewFinalStates[root] > state) {
                var fs = state;
                Object.keys(this.viewStates[root]).forEach(function (k) {
                    if(Scotty.GUI.viewStates[root][k] > fs) {
                        fs = Scotty.GUI.viewStates[root][k];
                    }
                });
                this.viewFinalStates[root] = fs;
                console.log(root + " => " + this.viewFinalStates[root]);
                $('#switch-' + root).css('color', Scotty.Core.srNagStateColor(this.viewFinalStates[root]))
            }
            
        }
    }).bind(this);
    
    this.srInit = (function (views) {
        $('.srViews').each(function () {
            var views2id = {};
            
            var nav = $(this).children('.srViewsNav');
            Object.keys(views).forEach(function (k) {
                views2id[k] = 'srView-' + (idCounter += 1).toString(16);
                Scotty.GUI.viewStates[views2id[k]] = {};
                Scotty.GUI.viewFinalStates[views2id[k]] = -1;
                nav.append('<li><a id="switch-' + views2id[k] + '" href="#' + views2id[k] + '"><span>' + views[k] + "</span></a></li>");
            });

            var div = $('#snmd-views');
            var dps = 360 / Object.keys(views).length;
            var step = 0;
            var r = (1906/2) / Math.tan( Math.PI / Object.keys(views).length);
            var oy = ($('#snmd-views').height() - 30 - 1038)/2 + 30;
            
            Object.keys(views).forEach(function (k) {
                div.append('<div class="svgview" id="' + views2id[k] + '"></div>');

                $('#'+views2id[k]).css(
                    'transform', 'rotateY(' + (dps * step) + 'deg) translateZ(' + r + 'px)'
                );

                Scotty.SVG.srLoadSVG(views2id[k], k);
                step += 1;
            });

            $('#snmd-views').css(
                'transform-origin', '100% 50% 50%'
            );
            var tabDivs = div;

            var alignView = (function() {
                var f = Math.min(1/1906 * ($('#snmd-views').width() - 10), 1/1038 * ($('#snmd-views').height()));

                $('#snmd-views').css(
                    'transform', 'scale(' + f + ') translateZ(-' + r  + 'px) rotateY(' + (-1 * dps * Scotty.GUI.currenStep) + 'deg)'
                );
            }).bind(this);
            
            $(window).on('resize', function(){
                alignView();
            });
            
            nav.find('a').click(function (event) {
                console.debug('Viewing '  + this.hash);
                Scotty.GUI.currentView = this.hash;

                div.children().removeClass('current').filter(this.hash).removeClass('next').removeClass('prev').addClass('current');
                $(Scotty.GUI.currentView).prevAll().removeClass('next').addClass('prev');
                $(Scotty.GUI.currentView).nextAll().removeClass('prev').addClass('next');

                nav.find('a').removeClass('selected').filter(this).addClass('selected');

                Scotty.GUI.currenStep = $(Scotty.GUI.currentView).prevAll().size();
                alignView();
                
                return false;
            }).filter(':first').click();
        }).bind(this);

        // Update time of day
        window.setInterval(function () {
            $('div#snmd_clock').text( moment().format("YYYY-MM-DDTHH:mm:ssZZ") );
        }, 1000);

        // Screensaver
        this.screenTimeOut = window.setTimeout(this.srScreenTimeOut, this.TO_SCREEN);

        // Handle mouse moves (reset screen saver timeout)
        $(document).mousemove((function () {
            this.screenState = 0;

            if (typeof this.screenTimeOut !== "undefined") {
                window.clearTimeout(this.screenTimeOut);
                this.screenTimeOut = window.setTimeout(this.srScreenTimeOut, this.TO_SCREEN);
                $(document.body).removeClass('on-screensaver');
            }
        }).bind(this));

        // Handle key press (reset screen saver time, handle shortcuts)
        $(document).keypress((function (ev) {
            this.screenState = 0;

            if (typeof this.screenTimeOut !== "undefined") {
                window.clearTimeout(this.screenTimeOut);
                this.screenTimeOut = window.setTimeout(this.srScreenTimeOut, this.TO_SCREEN);
            }

            // Select view by numpad
            if(ev.which > 47 && ev.which < 58) {
                var key = (ev.which == 48 ? '10' : String.fromCharCode(ev.which));

                $('a[href="#srView-' + key + '"]').click();
            }
        }).bind(this));
    }).bind(this);
}).call(Scotty.GUI, jQuery);
