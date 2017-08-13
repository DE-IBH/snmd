#!/usr/bin/env nodejs

/*
SNMD - Simple Network Monitoring Dashboard
  https://github.com/DE-IBH/snmd/

Authors:
  Thomas Liske <liske@ibh.de>

Copyright Holder:
  2012 - 2013 (C) Thomas Liske [https://fiasko-nw.net/~thomas/]
  2014 - 2017 (C) IBH IT-Service GmbH [https://www.ibh.de/]

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

var crypto = require('crypto');
var fs = require('fs');
var os = require('os');

/* build pseudo random unique hash */
var hash  = crypto.createHash('sha1').update(
    new Date().toISOString() +
    os.hostname() +
    os.uptime() +
    os.freemem()
                                            ).digest('hex');

fs.writeFile("cache.id", hash, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("cache id: " + hash);
}); 
