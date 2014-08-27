<?php
include_once('Database.php');
session_start();

//is_loggined
if(isset($_POST['userid']) && $_POST['userid']==true)
{
    if(isset($_SESSION['id']))
        exit($_SESSION['id']);
    else
        die('0');
}
//ADD POINT
if(isset($_POST['position']))
{
    if(!empty($_POST['title']) && !empty($_POST['text']) && !empty($_POST['position']) && isset($_SESSION['id']))
    {
        $db=Database::get_instance();
        $user_id=$_SESSION['id'];
        $title=trim(strip_tags($_POST['title']));
        $text=trim(strip_tags($_POST['text']));
        $position=$_POST['position'];
        $strpos=strpos($position,',');
        $posA=substr($position,1,$strpos-1);
        $posB=substr($position,$strpos+2,$position-1);
        $db->add_point($posA,$posB,$title,$text,$user_id);
        exit();
    }else
        die('0');

}
//GET POINTS OR NEWS FROM DB
if(isset($_POST['ready']) && ($_POST['ready']==true))
{
    $db=Database::get_instance();
    $arr=$db->get_points();
    exit(json_encode($arr));
}
if(isset($_POST['rows']) && ($_POST['rows']==true))
{
    $db=Database::get_instance();
    $num=$db->get_num_comments();
    if($num)
    {
        echo $num;
        exit();
    }
    else
        die('0');
}

if(isset($_POST['checks']) && $_POST['checks']==true)
{
    if(isset($_SESSION['id']))
    {
        $db=Database::get_instance();
        $result=$db->get_checks($_SESSION['id']);
        exit(json_encode($result));
    }
    else
        die('0');
}

if(isset($_POST['checkUp']))
{
    if(isset($_SESSION['id']))
    {
        $places=$_POST['checkUp']['places'];
        $msgs=$_POST['checkUp']['msgs'];
        $photos=$_POST['checkUp']['photos'];
        $db=Database::get_instance();
        $db->update_checks($places,$msgs,$photos,$_SESSION['id']);
        exit();
    }else
        die('0');
}

//ADD COMMENT TO DB
if(isset($_POST['comment']))
{
    $owner=$_POST['user'];
    $point_id=$_POST['point'];
    $comment=trim(strip_tags($_POST['comment']));
    $user_id=$_SESSION['id'];
    if($user_id!=0)
    {
        $db=Database::get_instance();
        $db->add_comment($point_id,$user_id,$comment,$owner);
        exit();
    }
    else
        die('0');
}

//GET COMMENTS FROM DB
if(isset($_POST['showComments']) && $_POST['showComments']>0)
{
    $point_id=$_POST['showComments'];
    $db=Database::get_instance();
    $result=$db->get_comments($point_id);
    exit(json_encode($result));
}


//REGISTRATION
if(isset($_POST['register_data']))
{
    $errors='';
    $db=Database::get_instance();
    foreach($_POST['register_data'] as $k=>$v)
    {
        if(empty($v))
            $errors.='Не все поля заполне80ны';
        else{
            switch($k)
            {
                case'login':$login=$v;break;
                case 'email':$email=$v;break;
                case 'pass':$pass=$v;break;
                case 'repass':$repass=$v;break;
            }
        }
    }
    if(preg_match('/^[A-Za-z0-9]{3,16}$/',$login)==0)
        $errors.='Неверный логин</br>';
    elseif(!$db->check_login($login))
        $errors.='Этот логин уже занят</br>';
    if(preg_match('/\S+@\S+\.\S+/',$email)==0)
        $errors.='Неверный email</br>';
    elseif(!$db->check_email($email))
        $errors.='Этот email уже существует</br>';
    if(preg_match('/^[A-Za-z0-9]{6,16}$/',$pass)==0)
        $errors.='Неверный пароль</br>';
    if($repass!=$pass)
        $errors.='Пароли не совпадают</br>';

    if(strlen($errors)>0)
        die($errors);
    else
    {
        $id=$db->add_user($login,$pass,$email);
        $link=md5($login.$id);
        mail($email,'Подтверждение регистрации','<h3>Спасибо за регистрацию</h3></br><span>пройдите по указанной ссылке</span></br><a href="localhost/project/index.php?confirm=".$link');
        exit('1');
    }
}

//SIGN IN CHECK
if(isset($_POST['loginForm']))
{
    $db=Database::get_instance();
    $login=$_POST['loginForm']['login'];
    $pass=$_POST['loginForm']['pass'];
    $user=$db->check_login_form($login,$pass);
    if($user)
    {
        $_SESSION['id']=$user['userid'];
        $_SESSION['login']=$user['login'];
        $_SESSION['email']=$user['email'];
        $_SESSION['avatar']=$user['avatar'];
        exit($_SESSION['id']);
    }
    else
        die('0');
}

if(isset($_POST['news']))
{
    $db=Database::get_instance();
    $result=array();
    $content=$_POST['news'];
    $tab=$_POST['tab'];
    $offset=$_POST['offset'];
    $ip=$_SERVER['REMOTE_ADDR'];
    $limit=$_POST['limit'];
    $point=$_POST['point'] ? $_POST['point'] : false;
    $id=$_SESSION['id'] ? $_SESSION['id'] : false;
    switch($tab)
    {
        case'all_date':
                switch($content)
                {
                    case'places':$result['posts']=$db->get_posts($offset,$limit,$ip,$id,0);
                        break;
                    case'msgs':$points=$db->get_last_points($offset,$limit,false);
                        for($i=0;$i<count($points);$i++)
                        {
                            foreach($points[$i] as $v)
                            {
                                $result['point_comments'][$v]=$db->get_point_comments($v,0,$limit);
                            }
                        }
                        break;
                    case'photos':exit();
                        break;
                    case'All_places':$result['posts']=$db->get_all_posts($offset,$limit,$ip,$id,0);
                        break;
                    case'All_msgs':$result['All_comments']=$db->get_all_comments($offset,$limit);
                        break;
                    case'All_photos':$result['photos']=$db->get_all_photos($offset,$limit,false);
                        break;
                }break;
        case'my_date':
                switch($content)
                {
                    case'places':$result['posts']=$db->get_posts($offset,$limit,$ip,$id,1);
                        break;
                    case'msgs':$points=$db->get_last_points($offset,$limit,$id);
                        for($i=0;$i<count($points);$i++)
                        {
                            foreach($points[$i] as $v)
                            {
                                $result['point_comments'][$v]=$db->get_point_comments($v,0,$limit);
                            }
                        }
                        break;
                    case'photos':exit();
                        break;
                    case'All_places':$result['posts']=$db->get_all_posts($offset,$limit,$ip,$id,1);
                        break;
                    case'All_msgs':$result['All_comments']=$db->get_all_comments($offset,$limit,$id);
                        break;
                    case'All_photos':$result['photos']=$db->get_all_photos($offset,$limit,$id);
                        break;
                }break;
        case'all_rate':
                switch($content)
                {
                    case'All_places':
                    case'places':$result['posts']=$db->get_last_rate($offset,$limit,$id,$ip,0);
                        break;
                    case'msgs':$points=$db->get_last_rate_points($offset,$limit,false);
                        for($i=0;$i<count($points);$i++)
                        {
                            foreach($points[$i] as $v)
                            {
                                $result['point_comments'][$v]=$db->get_point_comments($v,0,$limit);
                            }
                        }
                        break;
                    case'photos':exit();
                        break;
                    case'All_msgs':$result['All_comments']=$db->get_all_comments($offset,$limit);
                        break;
                    case'All_photos':$result['photos']=$db->get_all_photos($offset,$limit,false);
                        break;
                }break;
        case'my_rate':
                switch($content)
                {
                    case'All_places':
                    case'places':$result['posts']=$db->get_last_rate($offset,$limit,$id,$ip,1);
                        break;
                    case'msgs':$points=$db->get_last_rate_points($offset,$limit,$id);
                        for($i=0;$i<count($points);$i++)
                        {
                            foreach($points[$i] as $v)
                            {
                                $result['point_comments'][$v]=$db->get_point_comments($v,0,$limit);
                            }
                        }
                        break;
                    case'photos':exit();
                        break;
                    case'All_msgs':$result['All_comments']=$db->get_all_comments($offset,$limit);
                        break;
                    case'All_photos':$result['photos']=$db->get_all_photos($offset,$limit,false);
                        break;
                }break;
    }


    if($result)
        exit(json_encode($result));
    else
        die('0');


}

if(isset($_POST['loadmore']))
{
    $content=$_POST['loadmore'];
    $offset=$_POST['offset'];
    $limit=$_POST['limit'];
    $point=$_POST['point'];
    $db=Database::get_instance();
    $result=$db->get_point_comments($point,$offset,$limit);
    if($result)
        exit(json_encode($result));
    else
        die('0');
}

if(isset($_POST['update']))
{
    $id=$_SESSION['id'] ? $_SESSION['id'] : false;
    $db=Database::get_instance();
    $postid=$_POST['update'];
    $increm=$_POST['value'];
    $ip=$_SERVER['REMOTE_ADDR'];
    $value=$db->check_rating($ip,$id,$postid);
    if($increm=='plus')
        $value++;
    elseif($increm=='minus')
        $value--;
    else
        die();
    $db->update_rating($value,$postid);
    $db->update_rating_ip($id,$ip,$postid);
    echo $value;
    exit();
}

if(isset($_FILES['file']))
{
    if($_SESSION['id'])
    {
        try {
            if (!isset($_FILES['file']['error']) || is_array($_FILES['file']['error']))
            {
                throw new RuntimeException('Ошибка: ');
            }
            switch ($_FILES['file']['error']) {
                case UPLOAD_ERR_OK:
                    break;
                case UPLOAD_ERR_NO_FILE:
                    throw new RuntimeException('Файл не выбран.');
                case UPLOAD_ERR_INI_SIZE:
                case UPLOAD_ERR_FORM_SIZE:
                    throw new RuntimeException('Недопустимый объем файла.');
                default:
                    throw new RuntimeException('Неизвестная ошибка, обратитесь к администратору.');
            }
            if ($_FILES['file']['size'] > 30000) {
                throw new RuntimeException('Недопустимый объем файла.');
            }

            $finfo = new finfo(FILEINFO_MIME_TYPE);
            if (false === $ext = array_search(
                    $finfo->file($_FILES['file']['tmp_name']),
                    array(
                        'jpg' => 'image/jpeg',
                        'png' => 'image/png',
                        'gif' => 'image/gif'
                    ),
                    true
                )) {
                throw new RuntimeException('Недопустимый формат файла.');
            }
            $file=$_SESSION['id'].substr(md5($_SESSION['login']),0,7).'.'.$ext;
            $path=getcwd().DIRECTORY_SEPARATOR.'tmp_img/';
            if (!move_uploaded_file($_FILES['file']['tmp_name'],$path.$file))
            {
                throw new RuntimeException('Ошибка на сервере, обратитесь к администратору.');
            }
           exit($file);
        } catch (RuntimeException $e) {

            exit($e->getMessage());
        }
    }

}

if(isset($_POST['oldpass']))
{
    $password=sha1(sha1($_POST['oldpass']));
    $db=Database::get_instance();
    $result=$db->check_pass($_SESSION['id']);
    if($password==$result[0])
        exit('1');
    else
        die('0');
}

if(isset($_POST['profile']))
{
    $db=Database::get_instance();
    $errors="";
    $new_path='user_img/';
    $tmp_path='tmp_img/';
    $angle=$_POST['profile']['angle'];
    $filename=is_file($tmp_path.$_POST['profile']['img']) ?
        $tmp_path.$_POST['profile']['img'] :
        $new_path.$_POST['profile']['img'];
    $oldpass=$_POST['profile']['oldpass'] ? $_POST['profile']['oldpass'] : false;
    $pass=$_POST['profile']['pass'] ? $_POST['profile']['pass'] : false;
    $repass=$_POST['profile']['repass'] ? $_POST['profile']['repass'] : false;
    $email=$_POST['profile']['email'] ? $_POST['profile']['email'] : false;
    $update=array();
    if(is_file($filename))
    {
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $ext = array_search($finfo->file($filename),
            array(
                'jpg' => 'image/jpeg',
                'png' => 'image/png',
                'gif' => 'image/gif'
            ),
            true
        );
        switch($ext)
        {
            case'jpg':  $source = imagecreatefromjpeg($filename);
                        $rotate = imagerotate($source, $angle, 0);
                        imagejpeg($rotate,$filename);
                        imagedestroy($source);
                break;
            case'png':  $source = imagecreatefrompng($filename);
                        $rotate = imagerotate($source, $angle, 0);
                        imagepng($rotate,$filename);
                        imagedestroy($source);
                break;
            case'gif':  $source = imagecreatefromgif($filename);
                        $rotate = imagerotate($source, $angle, 0);
                        imagegif($rotate,$filename);
                        imagedestroy($source);
                break;
        }
        chmod($filename, 0777);
        $new_file=sha1($filename).'.'.$ext;
        $update['avatar']=$new_file;
        rename($filename,$new_path.$new_file);
    }
    if($oldpass || $pass || $repass)
    {
        $result=$db->check_pass($_SESSION['id']);
        if(sha1(sha1($oldpass))!=$result[0] || $repass!=$pass)
        {
            $errors.="Неправельный пароль</br>";
        }else{
            $update['password']=$pass;
        }
    }
    if($email)
    {
        $res=$db->check_email($email);
        if(!$res[0] || $res[0]==$_SESSION['id'])
        {
            $update['email']=$email;
        }else{
            $errors.="Этот email уже занят</br>";
        }
    }
    $db->update_user($update,$_SESSION['id']);
    exit($errors);
}

