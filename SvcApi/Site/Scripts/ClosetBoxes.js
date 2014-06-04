var CLOSETBOXUTILS = {
   renderBoxCommon: function(targetCanvas) {
      var ctx = targetCanvas.getContext("2d");
	  ctx.clearRect(0, 0, 50, 50);
	  ctx.fillStyle='blue';
      ctx.strokeStyle='white';
      ctx.fillRect(0,20,30,50);
      ctx.fillStyle='black';
      ctx.beginPath();
      ctx.moveTo(30,20);
      ctx.lineTo(40,10);
      ctx.lineTo(40,40);
      ctx.lineTo(30,50);
      ctx.lineTo(30,20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      return ctx;
     },
   renderBoxClosed: function(targetCanvas) {
       var ctx = CLOSETBOXUTILS.renderBoxCommon(targetCanvas);
       ctx.fillStyle='green';
       ctx.beginPath();
       ctx.moveTo(30,20);
       ctx.lineTo(40,10);
       ctx.lineTo(10,10);
       ctx.lineTo(0,20);
       ctx.lineTo(30,20);
       ctx.closePath();
       ctx.fill();
       ctx.stroke();
     },
   renderBoxOpen: function(targetCanvas) {
       var ctx = CLOSETBOXUTILS.renderBoxCommon(targetCanvas);
       ctx.fillStyle='green';
       ctx.beginPath();
       ctx.moveTo(40,10);
       ctx.lineTo(30,0);
       ctx.lineTo(0,0);
       ctx.lineTo(10,10);
       ctx.lineTo(40,10);
       ctx.closePath();
       ctx.fill();
       ctx.fillStyle='white';
       ctx.beginPath();
       ctx.moveTo(30,20);
       ctx.lineTo(40,10);
       ctx.lineTo(10,10);
       ctx.lineTo(0,20);
       ctx.lineTo(30,20);
       ctx.closePath();
       ctx.fill();
       ctx.stroke();

       ctx.strokeStyle='green';
       ctx.beginPath();
       ctx.moveTo(0,20);
       ctx.lineTo(10,10);
       ctx.stroke();
     }
   
}

$(function(){

    var allBoxes = $('.boxCanvas').css("background","transparent");
    
    allBoxes.prop("itemProp","closed");
    allBoxes.each(function(i){
      CLOSETBOXUTILS.renderBoxClosed(allBoxes[i]);
      
    });
    $( ".closetBox" ).draggable();
    $( ".closetBox" ).droppable({
      drop: function( event, ui ) {
        
          alert(ui.helper[0].id + ' dropped onto ' + this.id);
          $(ui.draggable[0]).remove();
        }
     });
     
    $(".boxCanvas").click(function() {
       var targCanv = $(this);
       if(targCanv.prop("itemProp") === "closed")
       {
	       CLOSETBOXUTILS.renderBoxOpen(targCanv[0]);
	       targCanv.prop("itemProp","open");
	   }
	   else
	   {
	       CLOSETBOXUTILS.renderBoxClosed(targCanv[0]);
	       targCanv.prop("itemProp","closed");
	   }
       });  

    $(".topBox").effect( "size", {
		to: { width: 100, height: 100 }
		}, 1000 );


});



/*
$(function(){
    var allBoxes = $('.boxCanvas').css("background","transparent");
    allBoxes.each(function(i){
      var ctx = allBoxes[i].getContext("2d");
      ctx.fillStyle='blue';
      ctx.strokeStyle='white';
      ctx.fillRect(0,20,30,50);
      ctx.fillStyle='black';
      ctx.moveTo(30,20);
      ctx.lineTo(40,10);
      ctx.lineTo(40,40);
      ctx.lineTo(30,50);
      ctx.lineTo(30,20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle='green';
      ctx.moveTo(30,20);
      ctx.lineTo(40,10);
      ctx.lineTo(10,10);
      ctx.lineTo(0,20);
      ctx.lineTo(30,20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
    });
    $( ".closetBox" ).draggable();
    $( ".closetBox" ).droppable({
      drop: function( event, ui ) {
        alert(ui.helper[0].id + ' dropped onto ' + this.id );
        }
     });
*/
