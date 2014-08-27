<?php

$data=$this->get_profile($_SESSION['id']);
?>
<div class="cabinet_wrap">
    <h3><?=$data['login']?></h3>
    <a class="deleteprofile" href="JavaScript:deleteProfile()">Удалить профиль</a>

    <div class="profile">
        <div id="floatingBarsG">
            <div class="blockG" id="rotateG_01">
            </div>
            <div class="blockG" id="rotateG_02">
            </div>
            <div class="blockG" id="rotateG_03">
            </div>
            <div class="blockG" id="rotateG_04">
            </div>
            <div class="blockG" id="rotateG_05">
            </div>
            <div class="blockG" id="rotateG_06">
            </div>
            <div class="blockG" id="rotateG_07">
            </div>
            <div class="blockG" id="rotateG_08">
            </div>
        </div>
        <a class="rotateImg" ></a>
        <img  src="user_img/<?=$data['avatar']?>">
    </div>
    <div class="cabinet">

        <form id="cabinet">
            <label for "email" ><strong>email:</strong></label>
            <input type="text" id="email"  value="<?=$data['email']?>">
            <a href="Javascript:slide()">Изменить пароль</a>
            <div class="changePass">
                <label for="oldpass"><strong>Cтарый пароль:</strong></label>
                <input type="password" id="oldpass" /><div></div>
                <label for="pass"><strong>Новый пароль:</strong></label>
                <input type="password" id="pass"  disabled/>
                <label for="repass"><strong>Повторите пароль:</strong></label>
                <input type="password" id="repass" disabled/>
            </div>
            <button type="submit">Сохранить изменения</button>
        </form>
    </div>
    <div class="changePhoto">
        <form method="POST" enctype="multipart/form-data" id="upload" name="upload">
            Изменить фото:  <input type="file" name="file" data-filename-placement="inside">
            <input type="hidden" name="MAX_FILE_SIZE" value="30000" />
        </form>
    </div>
    <div class="error"></div>
</div>

<script>
    function slide()
    {
        $('.changePass').slideToggle(500);
    }
    function deleteProfile()
    {
        return(confirm("Вы уверены что хотите удалить профиль?"))
    }
</script>






