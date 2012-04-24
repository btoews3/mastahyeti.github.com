#! /bin/sh

# minify js
cat assets/js/showdown.js assets/js/gistsite.js | slimit -m > assets/js/common.js
#minify css
cat assets/css/bootstrap.css assets/css/gistsite.css assets/css/bootstrap-responsive.css | cssmin > assets/css/common.css