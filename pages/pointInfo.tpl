<div class="infoForm">
    <h5></h5>
    <span class="user"></span>
    <div class="content"></div>

    <div class="comments"></div>
    <span id="errorInfo">Для отправки сообщений: <a href="?nav=login">войдите</a> в систему или <a href="?nav=register">зарегистрируйтесь</a></span>
    <?php if(isset($_SESSION['id']))?>
        <form id="infoForm">
            <textarea id="newComment" style="width: 200px;  rows="2" ></textarea>
            <button type="submit">коментировать</button>
            </form>
        </div>
    <?php endif?>