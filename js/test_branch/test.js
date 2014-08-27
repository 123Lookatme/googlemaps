$(document).ready(function(){
    function pagination(div,maxPage,limit,perPage){
        for(var j=1;j<=limit;j++)
        {
            div.append('<a class="pge">'+j+'</a>');
        }
        $('.pge').each(function(i){
            if(i==Math.ceil(limit/2))
            {
                pagination.middle=$(this);
            }
        });
        this.draw=function(text,middle){
            var plus=function(){
                return plus.counter++;
            };
            var minus=function(){
                return minus.counter--;
            };
            this.go=function(text,middle)
            {
                plus.counter=text!==undefined ? text+1 : plus.counter;
                minus.counter=text!==undefined ? text-1 : minus.counter;
                middle.text(text);
                middle.nextAll().each(function(){
                    $(this).text(plus());
                });
                middle.prevAll().each(function(){
                    $(this).text(minus());
                });
            };
            return go(text,middle);
        };
        function current()
        {
            return this.current;
        }
        function load(current,perPage)
        {
            console.log(current,perPage);
        }

        //pagination.current=1;
        $('a').on('click',function(){
            this.current=$(this).text();
            load(current(),perPage);
            var text=parseInt($(this).text());
            if(text>maxPage-Math.ceil(limit/2))
                text=maxPage-Math.ceil(limit/2)+1;
            else if(text<=Math.ceil(limit/2))
                text=Math.ceil(limit/2)+1;
            draw(text,pagination.middle);
        });
    }
    pagination('div',38,6,4);

});
/*
 function Pagination(divMenu,divCont,maxPage,limit,perPage,obj){
 this.divMenu=divMenu;
 this.divCont=divCont;
 this.maxPage=maxPage;
 this.limit=limit;
 this.perPage=perPage;
 this.current=1;
 for(var j=1;j<=limit;j++)
 {
 divMenu.append('<a class="pge">'+j+'</a>');
 }
 $('.pge',divMenu).each(function(i){
 if(i==Math.ceil(limit/2))
 {
 Pagination.middle=$(this);
 }
 });
 function current()
 {
 return this.current;
 }
 load(current(),this.perPage,this.obj);

 var drawMenu=function(text,middle){
 var plus=function(){
 return plus.counter++;
 };
 var minus=function(){
 return minus.counter--;
 };
 var go=function(text,middle)
 {
 plus.counter=text!==undefined ? text+1 : plus.counter;
 minus.counter=text!==undefined ? text-1 : minus.counter;
 middle.text(text);
 middle.nextAll().each(function(){
 $(this).text(plus());
 });
 middle.prevAll().each(function(){
 $(this).text(minus());
 });
 };
 go(text,middle);
 };
 var drawContent=function(start,limit,content,divCont)
 {

 };

 function load(current,perPage,obj)
 {
 if(obj)
 {
 //console.log(obj);
 }
 //return drawContent(start,limit,content,divCont);
 }

 //Pagination.current=1;
 $('.pge',this.divMenu).on('click',function(){
 console.log(divMenu);
 Pagination.current=$(this).text();
 load(current(),perPage,obj);
 var text=parseInt($(this).text());
 if(text>maxPage-Math.ceil(limit/2))
 text=maxPage-Math.ceil(limit/2)+1;
 else if(text<=Math.ceil(limit/2))
 text=Math.ceil(limit/2)+1;
 drawMenu(text,Pagination.middle);
 });
 }
 */
