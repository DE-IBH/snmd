#!/usr/bin/env python

from colorspacious import cspace_converter
from collections import OrderedDict

colors = OrderedDict()
colors['yellow'] = [0xb5, 0x89, 0x00]
colors['orange'] = [0xcb, 0x4b, 0x16]
colors['red'] = [0xdc, 0x32, 0x2f]
colors['magenta'] = [0xd3, 0x36, 0x82]
colors['violet'] = [0x6c, 0x71, 0xc4]
colors['blue'] = [0x26, 0x8b, 0xd2]
colors['cyan'] = [0x2a, 0xa1, 0x98]
colors['green'] = [0x85, 0x99, 0x00]
colors['green2'] = [0x00, 0x99, 0x00]

colors['undefined'] = [0x65, 0x7b, 0x83]
colors['ok'] = [0x32, 0xcd, 0x32]
colors['warning'] = [0xff, 0xd7, 0x00]
colors['critical'] = [0xdc, 0x14, 0x3c]
colors['unknown'] = [0xff, 0xa5, 0x00]

rgb2lab = cspace_converter("sRGB255", "CIELab")
lab2rgb = cspace_converter("CIELab", "sRGB255")

def norm(val):
    return int(max(0, min(val, 255)))

for name, rgb in colors.items():
    lab = rgb2lab(rgb)
    lab[0] = 65.0
    colors[name] = lab2rgb(lab)

print("CSS3 Variables:\n")
print("    /* SNMD Colors */")
for name, rgb in colors.items():
    print("    --SNMD_{0:12} #{1:02x}{2:02x}{3:02x};".format(
        name + ":",
        norm(rgb[0]),
        norm(rgb[1]),
        norm(rgb[2]))
    )

print("\n\nGPL Entries:\n")
for name, rgb in colors.items():
    print("{1:3d} {2:3d} {3:3d} SNMD {0}".format(
        name,
        norm(rgb[0]),
        norm(rgb[1]),
        norm(rgb[2]))
    )
