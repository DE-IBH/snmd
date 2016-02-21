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
if (typeof Scotty.MQTT === "undefined") {
    Scotty.MQTT = {};
}

(function ($) {
    "use strict";
    
    var client,
        flashTO,
        reconnTO,
        topics = {};
    
    this.srReconnect = function () {
        console.debug('Reconnecting...');
        this.srConnect();
    };
    
    this.srRegisterTopic = function (topic, watcher) {
        console.debug("REG: " + topic);
        
        if (typeof this.topics === "undefined") {
            this.topics = {};
        }
        if (typeof this.topics[topic] === "undefined") {
            this.topics[topic] = [watcher];
            
            if (typeof this.client !== "undefined" && this.client.isConnected()) {
                this.client.subscribe(topic);
            }
        } else {
            this.topics[topic].push(watcher);
        }
    };
    
    this.srConnect = function () {
        $('#scotty_hb').css("background", "yellow");
        console.debug('Connecting to MQTT broker ' + this.broker_host + ':' + this.broker_port + '...');
        this.client = new Paho.MQTT.Client(this.broker_host, this.broker_port, '', this.clientId);

               
        this.client.disconnect = (function () {
            console.error("Disconnected");
            $('#scotty_hb').css("background", "#7f0000");
        }).bind(this);
        this.client.onConnectionLost = (function (res) {
            $('#scotty_hb').css("background", "#ff0000");
            console.error("Connection Lost: " + res.errorMessage);

            if (this.reconnTO) {
                clearTimeout(this.reconnTO);
            }
            $('#scotty_hb').css("background", "orange");
            this.reconnTO = setTimeout(this.srConnect.bind(this), 5000);
        }).bind(this);
        this.client.onMessageArrived = (function (msg) {
            $('#scotty_hb').css("background", "#00ff00");
            setTimeout(function () {
                $('#scotty_hb').css("background", "#007f00");
            }, 100);
            
            if (typeof this.topics[msg.destinationName] !== "undefined") {
                for (var i = 0; i < this.topics[msg.destinationName].length; i++) {
                    var watcher = this.topics[msg.destinationName][i];
                    try {
                        watcher.handleUpdate.call(watcher, msg.destinationName, msg.payloadString);
                    } catch (err) {
                        console.error("Failure updating " + msg.destinationName + " in " + watcher + ": " + err.message);
                        return;
                    }
                }
            }
            else {
                console.warn("Received MQTT message for unknown topic " + msg.destinationName + "!")
            }
            
            return 1;
        }).bind(this);

        var me = this;
        this.client.connect({
            onSuccess: (function () {
                console.info('Connected to mqtt://' + this.broker_host + ':' + this.broker_port);
                $('#scotty_hb').css('background', '#7f0000');

                for(var topic in this.topics) {
                    this.client.subscribe(topic);
                }

            }).bind(this),
            onFailure: (function (res) {
                if (this.reconnTO) {
                    clearTimeout(this.reconnTO);
                }
                $('#scotty_hb').css('background', 'orange');
                this.reconnTO = setTimeout(this.srConnect.bind(this), 5000);
            }).bind(this)
        });
    };
    
    this.srInit = function (host, port, clientId) {
        if(typeof clientId === "undefined") {
            clientId = 'RND'+Math.floor(Math.random()*16777215).toString(16);
        }
        console.debug('MQTT broker = ' + host + ':' + port);
        console.debug('MQTT clientId = ' + clientId);
        this.broker_host = host;
        this.broker_port = Number(port);
        this.clientId = clientId;
         
        this.srConnect();
    };
}).call(Scotty.MQTT, jQuery);
