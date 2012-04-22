// START CONFIG
var username = 'mastahyeti'

var site_title_short = 'M.Y.'
var site_title_long = 'MastahYeti' 

var pages_prefix = /gistblog-sitepage/
var blogpost_prefix = /gistblog-blogpost/

var gistapi = 'https://api.github.com'
var gistslisturl = gistapi + '/users/' + username + '/gists?callback=?'
// END CONFIG

// handle the user clicking a link
$('.pagelink').live('click',function(e){
	e.preventDefault()
	var url = e.currentTarget.href
	$.getJSON(url,function(response){
		if(response.meta.status != 200)
			alert("ajax error")
		else {
			$.each(response.data.files,function(k,v){
				$('#maincontent').html(v.content)
			})
		}
	})
})

$(document).ready(function(){
	// our branding into the page
	$('.site_title_short').html(site_title_short)
	$('.site_title_long').html(site_title_long)

	var pages = []
	var posts = []

	// sort out the pages and the posts
	$.getJSON(gistslisturl,function(response){
		if (response.meta.status != 200)
			alert('Ajax error')
		else {
			//parse out the pages
			$.each(response.data,function(index){
				if(response.data[index].description.match(pages_prefix)){
					// do page stuff
					var pagename = response.data[index].description.split(':').slice(1).join(':')
					var url = response.data[index].url
					console.log(pagename)
					// add page links
					$('.nav').append("<li class='navelement'><a href='"+url+"?callback=?' class='pagelink'>"+pagename+"</a></li>")
				}
				if(response.data[index].description.match(blogpost_prefix)){
					// do blogpost stuff
					console.log(response.data[index].description)
				}
			})
		}
	})
})