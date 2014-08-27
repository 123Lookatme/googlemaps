/**
 * Created by user on 30.07.14.
 */
$(document).ready(function () {
    initialize();
});

function initialize()
{
    var center = new google.maps.LatLng(50.387, 30.541);

    /*ИНИЦИАЛИЗАЦИЯ КАРТЫ*/
    document.map=createMap(center);
    console.log(document);

    /*ИНИЦИАЛИЗАЦИЯ МАРКЕРОВ*/
    loadMarkers().done(function(data){
        var points=parseMarker(data);
        setMarkers(points);
    });

    /*ИНИЦИАЛИЗАЦИЯ КНОПКИ HOME*/
    var homeButton=new Button('home','go home','click',function(){
        document.map.setCenter(center);
        document.map.setZoom(9);
    });

    /*ИНИЦИАЛИЗАЦИЯ КНОПКИ ДЛЯ ДОБАВЛЕНИЯ ТОЧЕК И ФОРМЫ К НЕЙ*/
    getUserId().done(function(id){
        if(id>0){
            getContent('pointForm').done(function(data){
                document.form = new google.maps.InfoWindow ({
                    content: data
                });
            });
            var pointButton=new Button('add','add point','click',function(){
                google.maps.event.addListener(document.map, 'click', function(e) {
                    var position= e.latLng;
                    document.form.open(document.map);
                    document.form.setPosition(position);
                    google.maps.event.addListener(document.map, 'click', function() {
                        document.form.close()
                    });
                    $('.addForm').on('submit',function(ev){
                        ev.preventDefault();
                        var point=checkPointForm(position);
                        if(point)
                        {
                            addPoint(point);
                            loadMarkers().done(function(data){
                                var points=parseMarker(data);
                                setMarkers(points);
                            })
                        }
                    });
                });
            });
        }
    });

    /*ИНИЦИАЛИЗАЦИЯ ИНФОБЛОКА МАРКЕРА*/
    getContent('pointInfo').done(function(data){
        tmp = $('<div/>').html(data);
        getUserId().done(function(id){
            if(id==0){
                $('#infoForm', tmp).remove();
                console.log($('#errorInfo'));
            }else
                $('.infoform span', tmp).text('');
            document.info = new google.maps.InfoWindow ({
                content: tmp.html(),
                maxWidth:500
            });
        });
    });
}

////////////////////////*БИБЛИОТЕКА*/////////////////////////////////////

/*СОЗДАНИЕ НОВОЙ КАРТЫ*/
function createMap(center)
{
    var Options = {
        zoom: 9,
        center: center,
        mapTypeId:  google.maps.MapTypeId.HYBRID,
        disableDefaultUI: true
    };
    return new google.maps.Map(document.getElementById("map_canvas"), Options);
}


/*ПРОВЕРКА ИД СЕССИИ*/
function getUserId()
{
    return $.ajax({
        type:'POST',
        data:{userid:true},
        url:'ajax.php'
    });
}

/*ВЫБОРКА ШАБЛОНОВ*/
function getContent(file)
{
    return $.get('pages/'+file+'.tpl');
}

/*ВЫБОРКА И ПРОВЕРКА ФОРМЫ ДОБАВЛЕНИЯ МАРКЕРА*/
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

/*ДОБАВЛЕНИЕ МАРКЕРА В БАЗУ*/
function addPoint(point)
{
    $.ajax({
        type: 'POST',
        data: point,
        url: 'ajax.php',
        success: function(msg){
            if(msg>0)
                document.form.close();
            else
                $('.addForm #error').text('заполните все поля');
        }
    });
}

/*ДОБАВЛЕНИЕ КОМЕНТА В БД*/
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

/*ВЫБОРКА КОМЕНТОВ ИЗ БД*/
function getComments(pointid)
{
    return $.ajax({
        type:'POST',
        url:'ajax.php',
        data:{showComments:pointid}
    });
}
/*ПОДКЛЮЧЕНИЕ КОМЕНТОВ К ИНФОБЛОКУ*/
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

/*ВЫБОРКА МАРКЕРОВ ИЗ БД*/
function loadMarkers()
{
    return $.ajax({
        type: 'POST',
        url:'ajax.php',
        data:{ready:true}
    });
}

/*ПАРСИНГ МАРКЕРОВ*/
function parseMarker(data)
{
    var str=JSON.parse(data);
    var result={};
    for(var i=0;i<str.length;i++)
    {
        result[i]={};
        result[i].position=new google.maps.LatLng(parseFloat(str[i].pointA),parseFloat(str[i].pointB));
        result[i].title=str[i].title;
        result[i].text=str[i].description;
        result[i].id=str[i].pointid;
        result[i].user=str[i].login;
    }
    return result;
}

/*УСТАНОВКА МАРКЕРА НА КАРТУ*/

function setMarkers(obj)
{
    for(var j in obj)
    {
        var marker = new google.maps.Marker({
            position: obj[j].position,
            map: document.map,
            title: obj[j].title,
            zIndex: 999
        });
        marker.id=obj[j].id;
        marker.desc=obj[j].text;
        marker.user=obj[j].user;
        google.maps.event.addListener(marker, 'click', function() {
            var id=this.id;
            var user=this.user;
            document.info.open(document.map,this);
            $('.infoForm h5').text(this.title);
            $('.infoForm .user').text(user+': ');
            $('.infoForm .content').text(this.desc);
            $('.infoForm').on('submit',function(e){
                e.preventDefault();
                var comment=$('#newComment').val();
                if(comment!='')
                {
                    addComment(id,user,comment);
                    document.info.close();
                }
                else
                    $('#errorInfo').html('Введите сообщение');
            });
            getComments(id).done(function(data){
                var msg=JSON.parse(data);
                showComments(msg);
            });

            google.maps.event.addListener(document.map, 'click', function(){
                document.info.close();
            });
        });
    }
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
    document.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);
    google.maps.event.addDomListener(controlUI, event, hendler);
}



