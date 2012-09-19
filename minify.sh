#! /bin/sh

# compile coffeescript
cd assets/js
coffee -c gistsite.coffee

# minify js
cat showdown.js gistsite.js | slimit -m > common.js

cd ../css

#minify css
cat bootstrap.css gistsite.css bootstrap-responsive.css | cssmin > common.css

cd ../../
