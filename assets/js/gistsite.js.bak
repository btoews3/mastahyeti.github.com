// START CONFIG
username = 'btoews'

site_title_short = 'm.y.'
site_title_long = 'mastahyeti' 

pages_prefix = /gistblog-sitepage/
blogpost_prefix = /gistblog-blogpost/

gists_url = 'https://api.github.com/users/' + username + '/gists?callback=?'
gist_url = 'https://api.github.com/gists/'

homepage = '2495861'
// END CONFIG

History = window.History
cache = {}
converter = new Showdown.converter()

// get a gist from github by its id
function get_gist(id,callback){
	if (id in cache){
		callback(cache[id])
	} 
	else {
		url = gist_url + id + '?callback=?'
		$.getJSON(url,function (response){
			cache[id] = response
			callback(response)
		}
	)}
}

// load specified gist into specified location
function load_gist_into(id,$target){
	console.log('loading:'+id)
	get_gist(id,function (response){
		// make sure we own the gist (XSS protection)
		if (response.data.user.login == username){
			// load in the title
			description = response.data.description.split(':').slice(1).join(':')
			$target.find('.title').html(description)
			// load in the date
			date = new Date(response.data.created_at)
			$target.find('.date').html(date.toLocaleDateString() + " - " + date.toLocaleTimeString())
			// load in links to the full post (for previews)
			$target.find('.linktopost').prop('href','#'+response.data.id)
			// load in file contents
			$target.find('.content').html('')
			$.each(response.data.files,function(k,v){
				fnparts = v.filename.split('.')
				content = v.content
				if(fnparts[fnparts.length - 1] == 'md'){
					content = converter.makeHtml(content)
				}
				$target.find('.content').append(content)
			})
			fix_static_content()
		}
	})
}

// load gist specified in hash into maincontent
function load_gist(){
	id = location.hash.slice(1)
	if (id=='' || id == '#'){
		id=homepage
		location.hash = homepage
	}
	load_gist_into(id,$('#maincontent'))
	// if a hash is set, we update our links			
	$('.active').removeClass('active')
	$('.jslink#'+location.hash.slice(1)).parent().addClass('active')
}

// fix our branding
function fix_static_content(){
	$('.site_title_short').html(site_title_short)
	$('.site_title_long').html(site_title_long)
	$('a.site_title_short').prop('href','#'+homepage)
	$('a.site_title_long').prop('href','#'+homepage)
}

// handle the user clicking a link
$(window).on('hashchange', load_gist)

var foo = ''
$('.brand').mouseenter(function(e){foo=this;$(this).html(site_title_long)})
$('.brand').mouseleave(function(e){foo=this;$(this).html(site_title_short)})

$(document).ready(function(){
	// fix branding
	fix_static_content()

	// if we are on our homepage, set the hash to that
	load_gist()

	// sort out the pages and the posts
	$.getJSON(gists_url,function(response){
		if (response.meta.status != 200){
			console.log(response)
			alert('Ajax error')
		}
		else {
			// keep track of how many posts we find
			post_count = 0
			//element to inject page links into
			$nav = $('<ul class="nav"></ul>')
			//element to inject posts into
			$posts_dropdown = $('<li class="dropdown"><a href="#"class="dropdown-toggle"data-toggle="dropdown">Posts<b class="caret"></b></a><ul class="dropdown-menu"></ul></li>')
			//parse out the pages
			$.each(response.data,function(index){
				if(response.data[index].description.match(pages_prefix)){
					// do page stuff
					pagename = response.data[index].description.split(':').slice(1).join(':')
					id = response.data[index].id
					// add page links
					$nav.append("<li class='navelement'><a href='#"+id+"' id='"+id+"' class='jslink'>"+pagename+"</a></li>")
				}
				if(response.data[index].description.match(blogpost_prefix)){
					// do blogpost stuff
					pagename = response.data[index].description.split(':').slice(1).join(':')
					id = response.data[index].id
					// inject links
					$('.dropdown-menu',$posts_dropdown).append("<li class='navelement'><a href='#"+id+"' id='"+id+"' class='jslink'>"+pagename+"</a></li>")

					// put previews of the first three posts into the preview windows
					if(post_count < 3)
						load_gist_into(id,$('#preview'+post_count))
					post_count += 1
				}
			})
			// add dropdown to the nav menu
			$nav.append($posts_dropdown)
			// add the nav menu to the DOM
			$('.nav-collapse').append($nav)
			// if a hash is set, we update our links
			$('.active').removeClass('active')
			$('.jslink#'+location.hash.slice(1)).parent().addClass('active')
			// hide loading animation
			$('.overlay').addClass('fadeout').removeClass('pre-fadeout')
			// incase they don't support animation
			if($('.overlay').css('opacity')==0)
				$('.overlay').hide()
			else
				setTimeout("$('.overlay').hide()",250)
		}
	})
})