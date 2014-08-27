
function showNews()
{
    var inp=$('#checks input');
    getChecksFromData().done(function(checks){
        var checkboxes;
        if(checks!=0)
            checkboxes=JSON.parse(checks);
        else
            checkboxes=getChecksFromPage(inp);
        for(opt in checkboxes)
        {
            inp.each(function(){
                if(checkboxes[opt]==0 && $(this).val()==opt)
                {
                    $(this).prop('checked',false);
                }
            })
        }
        showNewsContent();
    });
}


function showNewsContent()
{

    var div=$('.news');
    var inp=$('#checks input');
    var checks=getChecksFromPage(inp);
    if(count(count(checks,1))==0)
        clearNews();
    else if(count(count(checks,1))==1)
    {
        var wrap=Object.keys(checks).toString();
        var offset=$('.'+wrap).length;
        var limit=5;
        getNewsContent(wrap,offset,limit).done(function(data){
            var result=JSON.parse(data);
            switch(wrap)
            {
                case'places':parseNews(result);
                    break;
                case'msgs':getContent('comment').done(function(data){
                    div.append(data);
                    parseComments(result,$('.allCommentsWrappers',div));
                });
                    break;
            }
        });
    }else
    {
        var offset=$('.news .places').length;
        var limit=3;
        getNewsContent('all',offset,limit).done(function(data){
            var result=JSON.parse(data);
            parseNews(result);
            getContent('comment').done(function(data){
                div.children().each(function(){
                    $(this).after().append($(data).attr('id',$(this).attr('id')));
                    var coment=$(this).children().last();
                    getNewsContent('allmsgs',offset,limit,coment.attr('id')).done(function(obj){
                        var com=JSON.parse(obj);
                        if(com.length<limit || com==0)
                        {
                            $('.comtitle>a',coment).hide();
                        }
                        parseComments(com,coment);
                        showhideNews(checks);
                    });
                });
            });
        });

    }
}
function clearNews()
{
    var div=$('.news');
    div.children().each(function(){
        $(this).remove();
    });
}


function parseNews(result)
{
    var div=$('.news');
    getContent('news').done(function(data){
        var newsBlock=data;
        for(var i=0;i<result.length;i++)
        {
            div.append($(newsBlock).attr('id',result[i]['pointid']));

            for(items in result[i])
            {
                switch(items)
                {
                    case'title':$('#'+result[i]['pointid']+' .news_title')
                        .append('<a href="#map">'+result[i]['title']+'</a>')
                        .attr('title',result[i]['pointA']+','+result[i]['pointB'])
                        .on('click',function(){
                            setCenter($(this).attr('title'));
                        });
                        break;
                    case'description':$('#'+result[i]['pointid']+' .news_text')
                        .append(result[i]['description']);
                        break;
                    case'date':$('#'+result[i]['pointid']+' .showCom')
                        .append(result[i]['date']);
                        break;
                }
            }
        }

    });

}

function parseComments(result,div)
{
    getContent('msgs').done(function(data){
        for(var i=0;i<result.length;i++)
        {
            $('.comtitle',div).before(data);
            for(items in result[i])
            {
                switch(items)
                {
                    case'login':$('.msgs .comuser',div).eq(i).append(result[i]['login']+':');
                        break;
                    case'msg':$('.msgs .comtext',div).eq(i).append(result[i]['msg']);
                        break;
                    case'date':$('.msgs .comentDate',div).eq(i).append(result[i]['date']);
                        break;
                    case'title':$('.msgs .pointLink',div).eq(i).append('<a href="#map">'+result[i]['title']+'</a>')
                        .attr('title',result[i]['pointA']+','+result[i]['pointB'])
                        .on('click',function(){
                            setCenter($(this).attr('title'));
                        });
                        break;
                }
            }
        }
    });


}





function getNewsContent(string,offset,limit,point)
{
    return $.ajax({
        type:'POST',
        data:{news:string,offset:offset,limit:limit,point:point},
        url:'ajax.php'
    });
}

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

function getChecksFromPage(inp)
{
    var res={};
    inp.each(function(){
        res[this.value]=+this.checked;
    });
    return res;
}
function getChecksFromData()
{
    return $.ajax({
        type:'POST',
        data:{checks:true},
        url:'ajax.php'
    });
}




function showhideNews(checks)
{
    if(!checks.msgs)
        $('.allCommentsWrappers').slideUp(300);
    else if(!checks.places)
        $('.new').slideUp(300);
}
