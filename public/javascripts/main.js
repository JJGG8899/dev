$(document).ready(function(){
  $('.delete-project').on('click',function(){
    var id = $(this).data('id');
    var url = '/admin/projects/delete/' + id;
    if(confirm("You sure to delete it?")){
      $.ajax({
        url: url,
        type:'DELETE',
        success: function(result){
          window.location.href="/admin/projects";
        },
        error: function(error){
          console.log(error);
        }
      });
    };
  })
});
