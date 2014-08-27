////////////////////////*БИБЛИОТЕКА*/////////////////////////////////////


/*КОНТРОЛЛЕР НОВОСТНОЙ ЛЕНТЫ*/
function showNewsContent(limit)
{
    var butn=$('.more');
    butn.attr('disabled','disabled');
    var inp=$('#checks input');
    var checks=getChecksFromPage(inp);
    var wrap=Object.keys(count(checks,1));
    var tab=$('#tab_hover').attr('class');
    var offset;
    var loadOption;
    var noData=false;
    if(count(wrap)==1)
    {
        limit+=2;
        loadOption=1;
    }
    for(var i=0;i<count(wrap);i++)
    {
        offset=$('.'+wrap[0]).length;
            loadNews(tab,wrap[i],offset,limit,loadOption).done(function(data){
                if(data)
                {
                    var result=JSON.parse(data);
                    for(opt in result)
                    {
                        if(result[opt].length<limit || result<limit)
                        {
                            noData=true;
                        }

                        switch(opt)
                        {
                            case'posts':parsePosts(result[opt]);
                                break;
                            case'All_comments':parseComments(result,limit,loadOption);
                                break;
                            case'point_comments':parseComments(result[opt],limit);
                                break;
                            case'photos':parsePhotos(result[opt]);
                                break;
                            default:return;
                        }
                    }
                    if(!noData)
                        butn.show().removeAttr('disabled');
                    else
                        butn.hide();
                }
            });
        }
    if($('.news').is(':empty'))
    {
        butn.hide();
    }
}

/*ВЫБОРКА НОВОСТЕЙ*/
function loadNews(tab,content,offset,limit,option)
{
    if(option)
    {
        return $.ajax({
            type:'POST',
            data:{news:'All_'+content,offset:offset,limit:limit,tab:tab},
            url:'ajax.php'
        });
    }
    else{
        return $.ajax({
            type:'POST',
            data:{news:content,offset:offset,limit:limit,tab:tab},
            url:'ajax.php'
        });
    }
}

/*ПАРСИНГ ПОСТОВ НОВОСТНОЙ ЛЕНТЫ*/
function parsePosts(result)
{
    var div=$('.news');
    getContent('news').done(function(data){
        for(var i=0;i<result.length;i++)
        {
            var conteiner=($(data).attr('id',result[i]['pointid']));

            for(items in result[i])
            {
                switch(items)
                {
                    case'title':$(' .point',conteiner)
                        .html('<a href="#map">'+result[i]['title']+'</a>')
                        .attr('title',result[i]['pointA']+','+result[i]['pointB'])
                        .on('click',function(){
                            setCenter($(this).attr('title'));
                        });
                        break;
                    case'description':$('.news_text',conteiner)
                        .html(result[i]['description']);
                        break;
                    case'date':$('.showCom',conteiner)
                        .html(result[i]['date']);
                        break;
                    case'login':$('.news_link',conteiner).html(result[i]['login']);
                        break;
                    case'rating':$('.rating>span',conteiner).text(result[i]['rating'] ? result[i]['rating'] : '0' )
                        .css('color',function(){
                            if($(this).text()>=0)
                                return 'green';
                            else
                                return 'red';
                        });
                        break;
                    case 'ip': if(result[i]['ip']>0)
                                    $('.rating',conteiner).append('<a class="plus"></a>').append('<a class="minus"></a>');
                        break;
                    default:break;
                }
            }
            var search=$('#'+conteiner.attr('id'),div);
            if(search.length>0)
                search.eq(0).before(conteiner);
            else
               div.append(conteiner);
        }
        $('.rating>a').on('click',function(){
            var div=$(this).closest('.places');
            $('.rating>a',div).hide();
            updateRating(div.attr('id'),$(this).attr('class')).done(function(data){
               if(data)
               {
                   $('.rating>span',div).html(data)
                       .css('color',function(){
                           if($(this).text()>=0)
                               return 'green';
                           else
                               return 'red';
                       }).siblings().remove();
               }
            });
        });
    });

}

/*ПАРСИНГ КОМЕНТОВ НОВОСТНОЙ ЛЕНТЫ*/
function parseComments(result,limit,option)
{
    var div=$('.news');
    getContent('comment').done(function(data){
        for(ids in result)
        {
            var container;
            if(isNaN(ids))
            {
                var search=$('#'+ids,div);
                if(search.length==0)
                    container=$(data).attr('id',ids);
                else
                    container=search;
            }
            else
                container=$(data).attr('id',ids);
            var containerLength=$('.msgs',container).length-1;
            parseMsgs(container,result[ids],containerLength);
            if($('.msgs',container).length==limit && !option)
                $('.comtitle>.showmore',container).show()
                    .on('click',function(){
                        var initiator=$(this).parent().parent();
                        var invis=$('.msgs:hidden',initiator);
                        if(!invis.length>0)
                        {
                            loadMore('point',$('.msgs',initiator).length,limit,initiator.attr('id'))
                                .done(function(data){
                                    var result=JSON.parse(data);
                                    var containerLength=$('.msgs',initiator).length;
                                    parseMsgs(initiator,result,containerLength);
                                    if(result.length<limit || data==0)
                                    {
                                        $('.msgs',initiator).eq(-1).after('<div class="nomore">Больше сообщений не найдено</div>');
                                        $('.comtitle>.showmore',initiator).hide();
                                        $('.comtitle>.showless',initiator).show().on('click',function(){
                                            $(this).hide();
                                            $('.nomore',initiator).hide();
                                            $('.showmore',initiator).show();
                                            var hide=$('.msgs',initiator).splice(limit,$('.msgs',initiator).length);
                                            $(hide).hide();
                                        });
                                    }
                                });
                        }else{
                            $(this).hide();
                            $('.nomore',initiator).show();
                            $('.showless',initiator).show();
                            invis.show();
                        }
                    });
            if(!option)
                $('.pointLink',container).hide();
            var search=$('#'+container.attr('id'),div);
            if(search.length>0)
                container.appendTo(search);
            else
                div.append(container);
        }
    });



    function parseMsgs(container,msgs,containerLength)
    {
        var contentLength=containerLength+msgs.length;
        for(var i=containerLength;i<contentLength;i++)
        {
            var j=i-containerLength;
            var lastMsg=$('.msgs',container).eq(-1);
            if($('.msgs',container).eq(i).length==0)
                lastMsg.after(lastMsg.clone());
            for(items in msgs[j])
            {
                switch(items)
                {
                    case'login':$('.msgs .the_user',container).eq(i).html(msgs[j]['login']+':');
                        break;
                    case'msg':$('.msgs .comtext',container).eq(i).html(msgs[j]['msg']);
                        break;
                    case'date':$('.msgs .comentDate',container).eq(i).html(msgs[j]['date']);
                        break;
                    case'title':$('.msgs .pointLink',container).eq(i).html('<a href="#map">'+msgs[j]['title']+'</a>')
                        .attr('title',msgs[j]['pointA']+','+msgs[j]['pointB'])
                        .on('click',function(){
                            setCenter($(this).attr('title'));
                        });
                        break;
                    case'avatar':$('.msgs .comimg',container).eq(i).html('<img src="./user_img/'+msgs[j]['avatar']+'">');
                        break;
                }

            }
        }
    }
}

/*ПОДГРУЗКА КОМЕНТОВ*/
function loadMore(content,offset,limit,point)
{
    return $.ajax({
        type:'POST',
        data:{loadmore:content,point:point,offset:offset,limit:limit},
        url:'ajax.php'
    });
}

function updateRating(post,value)
{
    return $.ajax({
       type:'POST',
        data:{update:post,value:value},
        url:'ajax.php'
    });
}



function parsePhotos(result)
{
    console.log(result);
}


/*УСТАНОВКА ЧЕКОВ*/
function setChecks()
{
    var inp=$('#checks input');
    getChecksFromData().done(function(checks){
        var checkboxes;
        if(checks!=0)
            checkboxes=JSON.parse(checks);
        for(opt in checkboxes)
        {
            inp.each(function(){
                if(checkboxes[opt]==0 && $(this).val()==opt)
                {
                    $(this).prop('checked',false);
                }
            })
        }
        showNewsContent(3);
    });
}

/*ИЗМЕНЕНИЕ ЧЕКОВ В БАЗЕ*/
function updateChecks()
{
    var inp=$('#checks input');
    var checks=getChecksFromPage(inp);
    $.ajax({
        type:'POST',
        data:{checkUp:checks},
        url:'ajax.php'
    });
}

/*ВЫБОРКА ЧЕКОВ СО СТРАНИЦЫ*/
function getChecksFromPage(inp)
{
    var res={};
    inp.each(function(){
        res[this.value]=+this.checked;
    });
    return res;
}

/*ВЫБОРКА ЧЕКОВ С БАЗЫ*/
function getChecksFromData()
{
    return $.ajax({
        type:'POST',
        data:{checks:true},
        url:'ajax.php'
    });
}


/*Переход к маркеру по ссылке*/
function setCenter(pos)
{
    var a=pos.substr(0,pos.indexOf(','));
    var b=pos.substr(a.length+1);
    var center=new google.maps.LatLng(parseFloat(a),parseFloat(b));
    document.map.setCenter(center);
    document.map.setZoom(16);
}

/*СОЗДАНИЕ НОВОЙ КАРТЫ*/
function createMap(center)
{
    var Options = {
        zoom: 10,
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

/*ДОБАВЛЕНИЕ КОМЕНТА В БД*/
function addComment(pointId,user,comment)
{
    return $.ajax({
        type:'POST',
        url:'ajax.php',
        data:{point:pointId,user:user,comment:comment}
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
        var div=$('.comments');
        var ul=$('<ul><b>'+data[i].login+':</b></ul>');
        var li=$('<li class="msg">'+data[i].msg+'</li>'+'<li class="date">'+data[i].date+'</li>');
        ul.append(li);
        div.append(ul);
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
    result.length=str.length;
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
                    addComment(id,user,comment).done(function(result){
                        if(result<=0)
                            $('#errorInfo').html('Ошибка базы данных');
                        else
                            document.info.close();
                    });
                }
                else
                    $('#errorInfo').html('Введите сообщение');
                $('.news').empty();
                showNewsContent(3);
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

function count(obj,param)
{
    var i=0;
    if(param)
    {
        for(opt in obj)
        {
            if(obj[opt]!=param)
            delete obj[opt];
        }
        return obj;
    }else{

        for(opt in obj)
        {
            i++
        }
    }
    return i;
}