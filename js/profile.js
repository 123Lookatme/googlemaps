$(document).ready(function(){

    $('.profile').on('mouseenter',function(){
        $('a',$(this)).fadeIn(200);
    });
    $('.profile').on('mouseleave',function(){
        $('a',$(this)).fadeOut(200);
    });
    $('.rotateImg').on('click',function(){
        var img=$(this).next();
        var a = getRotationDegrees(img);
        img.css({
            transform: 'rotate('+ (a+90)+ 'deg)'
        });
    });

    $('#upload').on('submit',function(e){
        e.preventDefault();
        $('.cabinet_wrap .error').html('');
        var formData= new FormData(this);
        loadImg(formData).done(function(data){
            var error=+data.substr(0,2);
            if(!isNaN(error))
                $('.profile>img').attr('src','tmp_img/'+data).css({
                    transform: 'rotate(0deg)'
                });
            else
                $('.cabinet_wrap .error').html(data);
        }).then(function(){
            $('#floatingBarsG').fadeIn();
        }).always(function(){
            $('#floatingBarsG').fadeOut();
        });

    });
    $('#upload').on('click',function(){
        $('input',$(this)).eq(0).change(function(){
            $('#upload').submit();
        });
    });

    $('#oldpass').on('keyup',function(){
        var input=$('#oldpass');
        if(this.value!=='')
        {
            var data=this.value;
            $.ajax({
                type: "POST",
                url: 'ajax.php',
                data: {oldpass:data},
                success: function(data){
                    if(data<=0)
                    {
                        $('.cabinet_wrap .error').html('Неправельный пароль');
                        input.css('border','2px solid red').prev().css('color','red');
                        input.siblings().attr('disabled',true);
                    }else{
                        input.css('border','2px solid green').prev().css('color','green');
                        input.siblings().removeAttr('disabled').eq(2).focus();
                    }

                },
                beforeSend:function(){
                    $('#oldpass').next().addClass('loading');
                },
                complete:function(){
                    $('#oldpass').next().removeAttr('class');
                }
            });
        }else{
            input.css('border','').prev().css('color','');
            input.siblings().attr('disabled',true);
            $('.cabinet_wrap .error').html('');
        }


    }).on('focus',function(){
        $('.cabinet_wrap .error').html('');
    });
    $('#pass').on('blur',function(){
        if(this.value!=='')
        {
            if(this.value.length<6 || this.value.length>16)
            {
                $(this).css('border','2px solid red').prev().css('color','red');
                $('.cabinet_wrap .error').html('Не меньше 6 и не больше 16 символов');
            }
            else
                $(this).css('border','2px solid green').prev().css('color','green');
        }else{
            $(this).css('border','').prev().css('color','');
        }

    }).on('focus',function(){
        $(this).css('border','').prev().css('color','');
        $('.cabinet_wrap .error').html('');
    });
    $('#repass').on('keyup',function(){
        if(this.value!==$('#pass').val() || this.value.length<6 || this.value.length>16)
        {
            $(this).css('border','2px solid red').prev().css('color','red');
            $('.cabinet_wrap .error').html('Пароли не совпадают');
        }
        else{
            $(this).css('border','2px solid green').prev().css('color','green');
            $('.cabinet_wrap .error').html('');
            $('.cabinet>button').removeAttr('disabled');
        }
    });

    $('#cabinet').on('submit',function(e){
        if($('.cabinet_wrap .error').html()=='')
        {
            e.preventDefault();
            var img=$('.profile>img');
            var result={};
            result['angle']=getRotationDegrees(img);
            result['img']=img.attr('src').substring(img.attr('src').lastIndexOf('/')+1);
            $('input',$(this)).each(function(){
                if(this.value!=='')
                    result[$(this).attr('id')]=this.value;
            });
            editProfile(result).done(function(data){
                if(data!='')
                    $('.cabinet_wrap .error').html(data);
                else{
                    $('.cabinet_wrap .error').html('Профиль успешно изменен').css('color','green');
                }
            });
        }else
            e.preventDefault();
    });

    function loadImg(formData)
    {
        return $.ajax({
            type:'POST',
            url: 'ajax.php',
            data:formData,
            contentType: false,
            cache:false,
            processData: false
        });
    }

    function editProfile(result)
    {
        return $.ajax({
            type:'POST',
            url: 'ajax.php',
            data:{profile:result}
        });
    }


    function getRotationDegrees(obj) {
        var matrix = obj.css("-webkit-transform") ||
            obj.css("-moz-transform")    ||
            obj.css("-ms-transform")     ||
            obj.css("-o-transform")      ||
            obj.css("transform");
        if(matrix !== 'none') {
            var values = matrix.split('(')[1].split(')')[0].split(',');
            var a = values[0];
            var b = values[1];
            var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
        } else { var angle = 0; }
        return (angle < 0) ? angle +=0 : angle;
    }

});
