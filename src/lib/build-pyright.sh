#!/usr/bin/env bash

set -e

SCRIPT_PATH=$(readlink -f "$0")
SCRIPT_DIR=$(dirname "$SCRIPT_PATH")

tmp="$(mktemp -d)"
pushd "$tmp"

function cleanup {
	popd
	rm -rf "$tmp"
}
trap cleanup EXIT SIGINT SIGTERM

git clone https://github.com/microsoft/pyright.git
cd ./pyright

git remote add browser-pyright https://github.com/posit-dev/pyright.git
git fetch --all || bash

git merge browser-pyright/pyright-browser -m 'Merge posit-dev/pyright-browser' || bash
patch -sf -p1 -d . -i "$SCRIPT_DIR/pyright.patch"
pkg="$(which npm)"
if [ -z "$pkg" ]; then
	echo "npm not found, exiting"
	exit
fi

rm ./packages/browser-pyright/package-lock.json
ln -s ../pyright-internal/package-lock.json ./packages/browser-pyright/package-lock.json
$pkg install
cd ./packages/browser-pyright
$pkg install

$pkg run build || bash
cp ../../LICENSE.txt ./dist/LICENSE
mkdir -p "$SCRIPT_DIR/../static/lib/pyright"
cp ./dist/* "$SCRIPT_DIR/../static/lib/pyright/"
