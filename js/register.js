$(document).ready(function(){
    $('#register').on('submit',function(e){
        e.preventDefault();
        checkForm();
    });
});

function checkForm()
{
    $('.error').text('');
    var data={};
    $('#register input').each(function(){
        var value=this.value;
        var id=$(this).attr('id');
        switch(id)
        {
            case 'login':var loginReg=/^[A-Za-z0-9]{3,16}$/
                        if($(this).val()=='')
                            $(this).next().text('Поле обязательно для заполнения');
                        else if(!loginReg.test($(this).val()))
                            $(this).next().text('3-16 символов только буквы и цифры');
                        else
                            data[id]=value;break;
            case 'email':var mailReg = /\S+@\S+\.\S+/;
                        if($(this).val()=='')
                            $(this).next().text('Поле обязательно для заполнения');
                        else if (!mailReg.test($(this).val()))
                            $(this).next().text('Не корректный email');
                        else
                            data[id]=value;break;
            case 'pass':var passReg=/^[A-Za-z0-9]{6,16}$/
                        if($(this).val()=='')
                            $(this).next().text('Поле обязательно для заполнения');
                        else if(!passReg.test($(this).val()))
                            $(this).next().text('Только быквы и цифры от 6-до 16 символов');
                        else
                            data[id]=value;break;
            case 'repass':if(($(this).val()!=$('#pass').val()) || $(this).val()=='')
                            $(this).next().text('Пароли не совпадают');
                        else
                            data[id]=value;break;
        }
        if(Object.keys(data).length==$('#register input').length)
        {
           $.ajax({
                type:'POST',
                data:{register_data:data},
                url:'ajax.php',
                success: function(result){
                            if(result==1)
                            {
                                window.location.href = "?nav=mailconfirm";
                            }else
                            {
                                $('.loginform #error').html(result);
                            }
                        }
            });
        }
    });

}

