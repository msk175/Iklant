$(function(){
       
    $('#listview').click(function(){
        
        // don't create duplicate/double filter
        $(".ui-listview-filter").remove();
        
        $('#listview').listview('option', 'filter', true);

        $('#listview').trigger("listviewcreate");
    });
});
