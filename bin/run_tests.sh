#!/usr/bin/env sh

# Function to bail out with an error
failure() {
    echo "!!! $@"
    exit
}

[[ -d node_modules ]] || failure 'Tests must be run from the project root.'
[[ -d node_modules/karma ]] || npm install

browser=$1 && [[ -z $browser ]] && browser=PhantomJS
node_modules/karma/bin/karma start --browsers $browser ${@:2}
