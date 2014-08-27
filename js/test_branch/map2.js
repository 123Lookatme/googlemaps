$(document).ready(function () {
    initialize();
});

function initialize()
{
    /*ИНИЦИАЛИЗАЦИЯ КАРТЫ*/

    var center = new google.maps.LatLng(50.387, 30.541);
    var Options = {
        zoom: 9,
        center: center,
        mapTypeId:  google.maps.MapTypeId.HYBRID,
        disableDefaultUI: true
    }
    var map = new google.maps.Map(document.getElementById("map_canvas"), Options);

    /*ЗАПРОС НА ВЫБОРКУ ВСЕХ МАРКЕРОВ*/

    loadMarkers();
    var form='';
    var info='';

    /*ЗАГРУЗКА КНОПКИ HOME*/

    var homeButton=new Button('home','go home','click',function(){
        map.setCenter(center);
        map.setZoom(9);
    });


    getContent('pointInfo').done(function(data){
        tmp = $('<div/>').html(data);
        getUserId().done(function(id){
            if(id==0){
                $('#infoForm', tmp).remove();
                console.log($('#errorInfo'));
            }else
                $('.infoform span', tmp).text('');
            info = new google.maps.InfoWindow ({
                content: tmp.html(),
                maxWidth:500
            });
        });


    });


    /*ЗАГРУЗКА КНОПКИ(ДОБАВЛЕНИЯ ТОЧЕК) ДЛЯ ЗАЛОГИНЕНЫХ, ЗАГРУЗКА ИНФООКОН*/

    getUserId().done(function(id){
        if(id>0){
            getContent('pointForm').done(function(data){
                form = new google.maps.InfoWindow ({
                    content: data
                });
            });
            var pointButton=new Button('add','add point','click',function(){
                google.maps.event.addListener(map, 'click', function(e) {
                    var position= e.latLng;
                    form.open(map);
                    form.setPosition(position);
                    google.maps.event.addListener(map, 'click', function() {
                        form.close()
                    });
                    $('.addForm').on('submit',function(ev){
                        ev.preventDefault();
                        var point=checkPointForm(position);
                        if(point)
                        {
                            addPoint(point);
                            loadMarkers();
                        }
                    });
                });
            });
        }
    });

    /*ВЫБОРКА ФОРМЫ И ПРОВЕРКА ФОРМЫ*/

    function checkPointForm(pos)
    {
        var point={};
        point['position']=pos.toString();
        $('#addForm').children().each(function(){
            var value=$(this).val();
            var id=$(this).attr('id');
            if(value!='')
                point[id]=value;
        });
        if(Object.keys(point).length==$('#addForm').children().length)
            return point;
        else
        {
            $('.addForm #error').text('заполните все поля');
            return false;
        }

    }

    /*ДОБАВЛЕНИЕ ТОЧКИ В БАЗУ*/

    function addPoint(point)
    {
        $.ajax({
            type: 'POST',
            data: point,
            url: 'ajax.php',
            success: function(msg){
                if(msg>0)
                    form.close();
                else
                    $('.addForm #error').text('заполните все поля');
            }
        });
    }

    /*УСТАНОВКА МАРКЕРА НА КАРТУ*/

    function setMarker(location,title,desc,id,user)
    {
        var marker = new google.maps.Marker({
            position: location,
            map: map,
            title: title,
            zIndex: 999
        });
        marker.id=id;
        marker.desc=desc;
        marker.user=user;
        google.maps.event.addListener(marker, 'click', function() {
            var id=this.id;
            var user=this.user;
            info.open(map,this);
            $('.infoForm h5').text(this.title);
            $('.infoForm .user').text(user+': ');
            $('.infoForm .content').text(this.desc);
            $('.infoForm').on('submit',function(e){
                e.preventDefault();
                var comment=$('#newComment').val();
                if(comment!='')
                {
                    addComment(id,user,comment);
                    info.close();
                }
                else
                    $('#errorInfo').html('Введите сообщение');
            });
            getComments(id).done(function(data){
                var msg=JSON.parse(data);
                showComments(msg);
            });

            google.maps.event.addListener(map, 'click', function(){
                info.close();
            });
        });
    }

    function addComment(pointId,user,comment)
    {
        $.ajax({
            type:'POST',
            url:'ajax.php',
            data:{point:pointId,user:user,comment:comment},
            success:function(msg){
                if(msg<=0)
                    $('#errorInfo').text('Error');
            }
        });
    }

    function getComments(pointid)
    {
        return $.ajax({
            type:'POST',
            url:'ajax.php',
            data:{showComments:pointid}
        });
    }
    function showComments(data)
    {
        for(var i=0;i<data.length;i++)
        {
            var div=$('.infoform .comments');
            var ul=$('<ul><b>'+data[i].login+':</b></ul>');
            var li=$('<li class="msg">'+data[i].msg+'</li>'+'<li class="date">'+data[i].date+'</li>');
            ul.append(li);
            div.append(ul);
        }
    }


    function loadMarkers()
    {
        $.ajax({
            type: 'POST',
            url:'ajax.php',
            data:{ready:true},
            success:  function(json)
            {
                var str=JSON.parse(json);
                var result={};
                var title;
                var text;
                var id;
                var position;
                var user;
                for(var i=0;i<str.length;i++)
                {
                    result.position=new google.maps.LatLng(parseFloat(str[i].pointA),parseFloat(str[i].pointB));
                    result.title=str[i].title;
                    result.text=str[i].description;
                    result.id=str[i].pointid;
                    result.user=str[i].login;
                    setMarker(position,title,text,id,user);
                }
            }
        });
    }

    function getUserId()
    {
        return $.ajax({
            type:'POST',
            data:{userid:true},
            url:'ajax.php'
        });
    }
    function getContent(file)
    {
        return $.get('pages/'+file+'.tpl');
    }

    /*КОНСТРУКТОР КНОПОК*/

    function Button(name,title,event,hendler)
    {
        var controlDiv = document.createElement('div');
        controlDiv.setAttribute('id', name);
        controlDiv.style.padding='5px';

        // Set CSS for the control border.
        var controlUI = document.createElement('div');
        controlUI.style.backgroundColor = 'white';
        controlUI.style.borderStyle = 'solid';
        controlUI.style.borderWidth = '2px';
        controlUI.style.cursor = 'pointer';
        controlUI.style.textAlign = 'center';
        controlUI.title = title;
        controlDiv.appendChild(controlUI);

        // Set CSS for the control interior
        var controlText = document.createElement('div');
        controlText.style.fontFamily = 'Arial,sans-serif';
        controlText.style.fontSize = '12px';
        controlText.style.paddingLeft = '4px';
        controlText.style.paddingRight = '4px';
        controlText.innerHTML = name;
        controlUI.appendChild(controlText);
        map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);
        google.maps.event.addDomListener(controlUI, event, hendler);
    }

}