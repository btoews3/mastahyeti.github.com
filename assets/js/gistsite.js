// START CONFIG
var username = 'mastahyeti';

var site_title_short = 'M.Y.';
var site_title_long = 'MastahYeti'; 

var pages_prefix = /gistblog-sitepage/;
var blogpost_prefix = /gistblog-blogpost/;

var gistapi = 'https://gist.github.com';
var gistslisturl = gistapi + '/api/v1/json/gists/' + username + '?callback=?';
// END CONFIG

$(document).ready(function(){
	// our branding into the page
	$('.site_title_short').html(site_title_short);
	$('.site_title_long').html(site_title_long);

	var pages = [];
	var posts = [];

	// sort out the pages and the posts
	$.getJSON(gistslisturl,function(data){
		//parse out the pages
		$.each(data.gists,function(index){
			if(data.gists[index].description.match(pages_prefix)){
				// do page stuff
				var pagename = data.gists[index].description.split(':').slice(1).join(':');
				console.log(data.gists[index].description)
				// add page links
				$('.nav').append("<li class='navelement'><a href='#' class='jslink' id='index'>"+pagename+"</a></li>");
			}
			if(data.gists[index].description.match(blogpost_prefix)){
				// do blogpost stuff
				console.log(data.gists[index].description);
			}
		})
	})
});