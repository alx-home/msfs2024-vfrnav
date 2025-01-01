#!/bin/env bash

set -e

sed -i 's/"\/assets/"coui:\/\/html_ui\/efb_ui\/efb_apps\/msfs2024-vfrnav\/Assets/g' dist/{index.html,assets/*.js}
sed -ri 's/rgb\(([^ ]+) ([^ ]+) ([^ ]+) \/ ([^\)]+)\)/rgba(\1,\2,\3,\4)/g' dist/assets/*.js