#!/usr/bin/env bash

set -e

# SCRIPT_PATH=$(readlink -f "$0")
# SCRIPT_DIR=$(dirname "$SCRIPT_PATH")

tmp="$(mktemp -d)"
pushd "$tmp"
function cleanup {
	popd
	rm -rf "$tmp"
}
trap cleanup EXIT SIGINT SIGTERM

curl https://raw.githubusercontent.com/microsoft/vscode/refs/heads/main/extensions/theme-defaults/themes/dark_vs.json > vs-dark.json

git clone --depth 1 https://github.com/JetBrains/colorSchemeTool
git clone --depth 1 https://github.com/ajaxorg/ace

pushd ace/tool
sed -iE 's/(function\s*parseColor\s*\(.*?\)\s*\{)/\1;if(color)return null;/' tmtheme.js
npm install
popd

mkdir out

for theme in vs-dark; do
	node ./colorSchemeTool/vscToTm.js "$theme.json" "$theme.tmTheme"
	node ./ace/tool/tmtheme.js "$theme" "$theme.tmTheme" out
done

bash
