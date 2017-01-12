// Run the script on DOM ready:
$(function(){
// $('table').visualize({type: 'pie', height: '300px', width: '420px'});

	$('#tableviewdiv1').visualize({type: 'bar',width: '500px'}).trigger('visualizeRefresh');
	//$('#tableviewdiv2').visualize({type: 'line', width: '1000px',height : '500'});
	//$('table').visualize({type: 'area', width: '420px'});
	//$('table').visualize({type: 'line', width: '420px'});
});