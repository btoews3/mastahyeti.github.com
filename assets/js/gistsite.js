// START CONFIG
var username = 'mastahyeti'

var site_title_short = 'M.Y.'
var site_title_long = 'MastahYeti' 

var pages_prefix = /gistblog-sitepage/
var blogpost_prefix = /gistblog-blogpost/

var gists_url = 'https://api.github.com/users/' + username + '/gists?callback=?'
var gist_url = 'https://api.github.com/gists/'

var homepage = '2467411'

// END CONFIG

var History = window.History
var cache = {}

// get a gist from github by its id
function get_gist(id,callback){
	if (id in cache){
		callback(cache[id])
	} else {
		var url = gist_url + id + '?callback=?'
		$.getJSON(url,function (response){
			cache[id] = response
			callback(response)
		})
	}
}

// fix our branding
function fix_static_content(){
	$('.site_title_short').html(site_title_short)
	$('.site_title_long').html(site_title_long)
}

function set_active(){
	hash = location.hash.slice(1)
	if (hash == '')
		hash = homepage
	$('.active').removeClass('active')
	$('.jslink#'+hash).parent().addClass('active')
}

function loading(){
	console.log('loading')
	$('.brand').html("<image src='assets/img/loading.gif'>")
	$('.dropdown').hide()
	$('.jslink').hide()
}

function done_loading(){
	console.log('done loading')
	$('.brand').html(site_title_short)
	$('.dropdown').show()
	$('.jslink').show()	
}

// handle the user clicking a link
$(window).on('hashchange', function(e){
	// get id from location
	id = location.hash.slice(1)
	get_gist(id,function (response){
		// make sure we own the gist (XSS protection)
		if (response.data.user.login == username){
			$.each(response.data.files,function(k,v){
				$('#maincontent').html(v.content)
			})
			fix_static_content()
			set_active()
		}
	})
})

$(document).ready(function(){
	// fix branding
	fix_static_content()
	// if we are on our homepage, do homepage stuff
	if (location.hash == '')
		location.hash = homepage
	
	// display loading animation
//	loading()

	// sort out the pages and the posts
	$.getJSON(gists_url,function(response){
		if (response.meta.status != 200)
			alert('Ajax error')
		else {
			//parse out the pages
			$.each(response.data,function(index){
				if(response.data[index].description.match(pages_prefix)){
					// do page stuff
					var pagename = response.data[index].description.split(':').slice(1).join(':')
					var id = response.data[index].id
					// add page links
					$('.nav').append("<li class='navelement'><a href='#"+id+"' id='"+id+"' class='jslink'>"+pagename+"</a></li>")
				}
				if(response.data[index].description.match(blogpost_prefix)){
					// do blogpost stuff
					var pagename = response.data[index].description.split(':').slice(1).join(':')
					var id = response.data[index].id
					// inject links
					$('.dropdown-menu').append("<li class='navelement'><a href='#"+id+"' id='"+id+"' class='jslink'>"+pagename+"</a></li>")
				}
			})
		}
		set_active()
		// hide loading animation
//		done_loading()
	})
})