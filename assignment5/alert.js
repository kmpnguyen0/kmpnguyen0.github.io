('ul').on('click','li',function()
{
  (this).toggleClass('completed');
});

('ul').on('click','span',function(event)
{
  (this).parent().fadeOut(1000,function()
  {
    (this).remove();
  });
  event.stopPropagation();
});


