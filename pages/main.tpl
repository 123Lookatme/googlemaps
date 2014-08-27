
    <a name="map"></a><div id="map_canvas" style="width: 700px; height: 350px"></div>
    <div class="news_content">
        <div class="controls">Новости:<a id="opt"><img  height="30px" src="./img/gear.png"></a></div>
        <div class="ctrls">
            <form id="checks">
                <label><input type="checkbox" value="places" checked> Места</label>
                <label><input type="checkbox" value="msgs" checked> Коментарии</label>
                <button type="submit" class="btn btn-primary btn-xs">ok</button>
            </form>
        </div>

        <div id="news_wrap">
            <div class="tab_news">
                <?php if(isset($_SESSION['id'])):?>
                <button class="my_date">Мои новости </br>по дате</button>
                <button class="my_rate">Мои новости </br>по рейтингу</button>
                <?php endif;?>
                <button class="all_date">Общие новости </br>по дате</button>
                <button class="all_rate">Общие новости </br>по рейтингу</button>
            </div>

            <div class="news" id="news">


            </div>
            <div class="more"><button class="btn primary">Загрузить еще...</button></div>
        </div>
        <div class="goUp" ><a href="#">Up</a></div>
<script src="./js/map.js"></script>
<script src="./js/map_libs.js"></script>