$(document).ready(function(){
    $('.loginform').on('submit',function(e){
        e.preventDefault();
        check_login();
    });
});

function check_login()
{
    $('.loginform .error3').text('');
    var data={};
    data.login=$('.loginform #login').val();
    data.pass=$('.loginform #password').val();
    if(data.pass=='' || data.login=='' )
        $('.loginform .error3').text('Не все поля заполнены');
    else{
        $.ajax({
            type:'POST',
            url:'ajax.php',
            data:{loginForm:data},
            success:function(msg){
                if(msg>0)
                    window.location.href = "index.php";
                else
                    $('.loginform .error3').text('Неправельный пароль');
            }
        });
    }
}
