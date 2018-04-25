console.log('hi');

$(function() {
  // Your interactions go here
$( ".image" ).click(function() {
  $( ".image" ).animate({ "left": "+=200px" }, "slow" );
});

})