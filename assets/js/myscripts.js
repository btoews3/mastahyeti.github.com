names = {
  mastahyeti:{
    id:'MASTAHYETI',shrt:'mastahyeti',lng:'mastahyeti'},
  toews:{
    id:'TOEWS',shrt:'Ben',lng:'Ben Toews'}
};
// figure out the name of our site
sitename = names.mastahyeti;        
var hostname = document.location.host.replace('.','').toUpperCase();
_.each(names,function(o){
  if(hostname.indexOf(o.id) != -1){
    sitename = o;
  }
});

function fix_name(){
    // make it either mastahyeti or ben toews. not both.
    $('.sitename').html(sitename.lng);
    $('.sitename-shrt').html(sitename.shrt);
}
fix_name();

function set_active(){
    var pathname = document.location.pathname;
    if (pathname != ''){
        pathname = pathname.slice(1).split('.')[0];
    }
    else {
        pathname = 'index';
    }
    $('.navelement').removeClass('active');
    $('.jslink#'+pathname).parent().addClass('active');
}
set_active();

// make sure our name stays fixed
$('#maincontent').on('pjax:end',function(){
    fix_name();
    set_active();
    console.log(document.location.href);
});

$('#learnmore').on('click',function(clickEvent){
    $.pjax({
    url: '/about.html',
    container: '#maincontent',
    title: sitename.lng + ' -- about',
    fragment: '#maincontent'
    })
});

// setup pjax
$('.jslink').pjax({container: "#maincontent", fragment: "#maincontent"})