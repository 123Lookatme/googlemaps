
$(document).ready(function () {
    initialize();
    setChecks();
    $('.tab_news>button').on('click',function(){
        $(this).attr('id','tab_hover');
        $(this).siblings().removeAttr('id').prop('disabled',false);
        $(this).prop('disabled',true);
        $('.news').empty();
        showNewsContent(3);
    });
    $('#checks').on('submit',function(e){
        e.preventDefault();
        updateChecks();
        $('.news').empty();
        showNewsContent(3);
        $(this).parent().slideUp(500);
    });
    $('.more').on('click',function(e){
        if($(this).attr('disabled'))
            e.preventDefault();
        else
            showNewsContent(3);
    });


});

function initialize()
{

    var center = new google.maps.LatLng(50.47848271564207, 30.61614990234375);
    /*ИНИЦИАЛИЗАЦИЯ КАРТЫ*/
    document.map=createMap(center);

    /*ИНИЦИАЛИЗАЦИЯ МАРКЕРОВ*/
    loadMarkers().done(function(data){
        var points=parseMarker(data);
        setMarkers(points);
    });
    /*ИНИЦИАЛИЗАЦИЯ ИНФОБЛОКА МАРКЕРА*/
    getContent('pointInfo').done(function(data){
        var tmp = $('<div/>').html(data);
        getUserId().done(function(id){
            if(id>0){
                $('#errorInfo', tmp).text('');
            }else
                $('#infoForm', tmp).remove();
                document.info = new google.maps.InfoWindow ({
                    content: tmp.html(),
                    maxWidth:500,
                    disableAutoPan: false
            });
        });
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
                    content: data,
                    maxWidth:200,
                    disableAutoPan: false
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
                        console.log($(this).parent().parent().parent());
                        var point=checkPointForm(position);
                        if(point)
                        {
                            addPoint(point);
                            loadMarkers().done(function(data){
                                var points=parseMarker(data);
                                setMarkers(points);
                                $('.news').empty();
                                showNewsContent(3);
                            })
                        }
                    });
                });
            });
        }
    });
}




