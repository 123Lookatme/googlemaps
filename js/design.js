
$(document).ready(function(){
    //$('input[type=file]').bootstrapFileInput();
    $('#opt').on('click',function(){
        $('.ctrls').slideToggle(500);
    });
    $(window).on('scroll',function(){
        var anim=$('.goUp');
        var scrol=$(window).scrollTop();
        if(scrol>1000)
        {
            var op=parseInt(scrol/100*2) < 99 ? parseInt(scrol/100*2) : 99;
            anim.css('opacity','0.'+op);
        }else
            anim.css('opacity','0');
    });

    $('.tab_news>button').first().attr('id','tab_hover').prop('disabled',true);






});