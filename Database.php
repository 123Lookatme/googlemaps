<?php
class Database{
    private $host='localhost';
    private $user='root';
    private $pass='1234';
    private $db_name='Project';
    private $connect;
    private static $instance;

    private function __construct()
    {
        $this->connect=mysql_connect($this->host,$this->user,$this->pass) or die('Извините Ошибка баз данных, попробуйте позже');
        mysql_select_db($this->db_name,$this->connect);
    }
    private function __clone(){}

    public static function get_instance()
    {
        self::$instance?:self::$instance=new self;
        return self::$instance;
    }

    /////////////////////////*BASIC CONTROLS *//////////////////////////////////////////////////////

    public function add_user($login,$pass,$mail)
    {
        $login=mysql_real_escape_string($login);
        $pass=sha1(sha1(mysql_real_escape_string($pass)));
        $mail=mysql_real_escape_string($mail);
        $query="INSERT  INTO users (login,password,email) VALUES ('$login','$pass','$mail')";
        $result=mysql_query($query)or die('Извините ошибка баз данных, попробуйте позже');
        if($result!=false)
        {
            $id=mysql_insert_id();
            return $id;
        }
        return false;
    }

    public function check_pass($id)
    {
        $query="SELECT password FROM users WHERE  userid = $id";
        $result=mysql_query($query) or die(' ');
        return mysql_fetch_row($result);
    }

    public function get_profile($id)
    {
        $query="SELECT * FROM users WHERE userid='$id'";
        $row=mysql_query($query) or die();
        $result=mysql_fetch_assoc($row);
        return $result;
    }

    public function get_user_by_id($id)
    {
        $query="SELECT login FROM users WHERE userid ='$id'";
        $row=mysql_query($query) or die('0');
        $result=mysql_fetch_row($row);
        return $result[0];
    }

    public function get_checks($id)
    {
        $query="SELECT places,msgs,photos FROM checks WHERE userid = '$id' ";
        $rows=mysql_query($query) or die('0');
        $result=mysql_fetch_assoc($rows);
        return $result;
    }

    public function update_checks($places,$msgs,$photos,$id)
    {
        $query="UPDATE checks SET places = '$places', msgs = '$msgs', photos = '$photos' WHERE userid = '$id' ";
        $result=mysql_query($query) or die('0');
    }

    public function get_num_comments()
    {
        $query="SELECT * FROM msgs ";
        $result=mysql_query($query)or die('0');
        $num=mysql_num_rows($result);
        return $num;
    }
    public function check_login_form($login,$password)
    {
        $result=array();
        $login=mysql_real_escape_string($login);
        $password=sha1(sha1(mysql_real_escape_string($password)));
        $query="SELECT userid,login,email,avatar FROM users
                WHERE login = '$login' AND password = '$password'";
        $rows=mysql_query($query) or die('Извините ошибка баз данных, попробуйте позже');
        while($row=mysql_fetch_assoc($rows))
        {
            $result=$row;
        }
        if(count($result)>0)
            return $result;
        else
            return false;
    }
    public function check_login($login)
    {
        $login=mysql_real_escape_string($login);
        $query="SELECT * from users where login = '$login' ";
        $result=mysql_query($query);
        $num=mysql_num_rows($result);
        if($num==0)
            return true;
        else
            return false;
    }
    public function check_email($mail)
    {
        $mail=mysql_real_escape_string($mail);
        $query="SELECT userid FROM users where email = '$mail'";
        $result=mysql_query($query);
        $res=mysql_fetch_row($result);
        if(!$res)
            return true;
        else
            return $res;
    }

    public function update_user($arr,$id)
    {
        $row='';
        foreach($arr as $k=>$v)
        {
            $row.=$k.'='."'".$v."',";
        }
        $query="UPDATE users  SET  ".substr($row,0,-1)." WHERE userid='$id'";
        $result=mysql_query($query) or die();
    }
/*
    public function add_event($eventid,$event,$ownerid,$userid=false)
    {
        switch($event)
        {
            case 'point': $query="INSERT INTO events (eventid, eventname, ownerid)
                                        VALUES ('$eventid','$event','$ownerid')";break;
            case 'comment':$query="INSERT INTO events (eventid, eventname, ownerid, userid)
                                        VALUES ('$eventid','$event',(SELECT userid FROM users u WHERE u.login = '$ownerid'),'$userid')";break;
        }
        if($query)
            $res=mysql_query($query)or die('0');
        return 1;

    }
*/

////////////////////////////////////* MAP CONTROL *///////////////////////////////////////////////////////

    public function add_point($pointA,$pointB,$title,$descript,$user)
    {
        $user=mysql_real_escape_string($user);
        $pointA=mysql_real_escape_string($pointA);
        $pointB=mysql_real_escape_string($pointB);
        $title=mysql_real_escape_string($title);
        $descript=mysql_real_escape_string($descript);
        $query="INSERT  INTO places (pointA,pointB,title,description,userid,date)
                VALUES ('$pointA','$pointB','$title','$descript','$user',NOW())";
        $res=mysql_query($query) or die('0');
        if($res)
                echo "1";
    }

    public function get_points()
    {
        $result=array();
        $query="SELECT u.login,p.pointid,p.pointA,p.pointB,p.title,p.description,p.date
                FROM places p JOIN users u ON p.userid =u.userid ORDER BY pointid DESC ";
        $rows=mysql_query($query);
        while($row=mysql_fetch_assoc($rows))
        {
            $result[]=$row;
        }
        return $result;
    }

    public function add_comment($point_id,$user,$comment,$owner)
    {
        $comment=mysql_real_escape_string($comment);
        $query="INSERT INTO msgs(pointid,userid,msg,ownerid)
                VALUES('$point_id', '$user','$comment',
                (SELECT userid FROM users u WHERE u.login = '$owner'))";
        $result=mysql_query($query) or die('0');
        if($result)
            echo "1";
    }
    public function get_comments($point_id)
    {
        $result=array();
        $query="SELECT m.msg,m.date,login FROM msgs m
                    JOIN users u
                    ON m.userid = u.userid
                    AND m.pointid = '$point_id' ORDER BY m.date DESC";
        $rows=mysql_query($query) or die(false);
        while($row=mysql_fetch_assoc($rows))
        {
            $result[]=$row;
        }
        return $result;
    }


////////////////////////////////////////* NEWS CONTROL *////////////////////////////////////////////////////////////////


    public function get_last_rate_points($offset,$limit,$id)
    {
        $result=array();
        if($id)
            $query="SELECT p.pointid FROM places p WHERE p.userid = '$id'
                        ORDER BY p.rating DESC LIMIT ".$offset.','.$limit;
        else
            $query="SELECT p.pointid FROM places p
                        ORDER BY p.rating DESC LIMIT ".$offset.','.$limit;
        $rows=mysql_query($query);
        while($row=mysql_fetch_assoc($rows))
        {
            $result[]=$row;
        }
        return $result;

    }

    public function get_last_points($offset,$limit,$id)
    {
        $result=array();
        if($id)
            $query="SELECT
                            p.pointid
                        FROM
                            (SELECT
                                user_events.id,
                                    user_events.date,
                                    IF(places.pointid is NULL, msgs.pointid, places.pointid) AS pointid
                            FROM
                                (SELECT
                                *
                            FROM
                                user_events
                            ORDER BY user_events.id DESC) AS user_events
                            LEFT JOIN places ON places.pointid = user_events.eventid
                            LEFT JOIN msgs ON msgs.msgid = user_events.eventid) AS user_events
                                JOIN
                            places p ON p.pointid = user_events.pointid
                            WHERE p.userid = '$id'
                        GROUP BY user_events.pointid
                        ORDER BY id DESC LIMIT ".$offset.','.$limit;
        else
            $query="SELECT
                            p.pointid
                        FROM
                            (SELECT
                                user_events.id,
                                    user_events.date,
                                    IF(places.pointid is NULL, msgs.pointid, places.pointid) AS pointid
                            FROM
                                (SELECT
                                *
                            FROM
                                user_events
                            ORDER BY user_events.id DESC) AS user_events
                            LEFT JOIN places ON places.pointid = user_events.eventid
                            LEFT JOIN msgs ON msgs.msgid = user_events.eventid) AS user_events
                                JOIN
                            places p ON p.pointid = user_events.pointid
                        GROUP BY user_events.pointid
                        ORDER BY id DESC LIMIT ".$offset.','.$limit;

        $rows=mysql_query($query);
        while($row=mysql_fetch_assoc($rows))
        {
            $result[]=$row;
        }
        return $result;
    }

    public function get_last_rate($offset,$limit,$id,$ip,$option)
    {
        if(!$id)
            $id=-1;
        $result=array();
        if($option)
        {
            $query="SELECT p.pointid,p.pointA,p.pointB,p.title,p.description,p.date,p.rating
                    FROM places p
                    WHERE p.userid='$id'
                    ORDER BY p.rating DESC LIMIT ".$offset.','.$limit;
        }else{
            if($id!=-1)
            {
                $query="SELECT u.login,p.pointid,p.pointA,p.pointB,p.title,p.description,p.date,p.rating,
					IF(rating.id IS NOT NUll,NULL,IF(p.userid='$id',null,1)) AS ip
                    FROM places p JOIN users u ON p.userid =u.userid
                    LEFT JOIN rating ON rating.userid='$id' AND p.pointid=rating.postid
                    ORDER BY p.rating DESC LIMIT ".$offset.','.$limit;
            }else{
                $query="SELECT u.login,p.pointid,p.pointA,p.pointB,p.title,p.description,p.date,p.rating,
					IF(rating.id IS NOT NUll,NULL,1) AS ip
                    FROM places p JOIN users u ON p.userid =u.userid
                    LEFT JOIN rating ON rating.ip='$ip' AND p.pointid=rating.postid
                    GROUP BY p.pointid
                    ORDER BY p.rating DESC LIMIT ".$offset.','.$limit;
            }
        }
        $rows=mysql_query($query);
        while($row=mysql_fetch_assoc($rows))
        {
            $result[]=$row;
        }
        return $result;
    }


    public function get_posts($offset,$limit,$ip,$id,$option)
    {
        if(!$id)
            $id=-1;
        $result=array();
        if($option)
            $query="SELECT
                                user_events.id,
                                p.title,
                                p.description,
                                p.pointA,
                                p.pointB,
                                p.pointid,
                                p.date,
                                p.rating

                             FROM
                            (SELECT
                                user_events.id,
                                user_events.date,
                            IF(places.pointid is NULL,msgs.pointid,places.pointid) AS pointid

                            FROM (SELECT *  FROM user_events ORDER BY user_events.id DESC) AS user_events

                            LEFT JOIN places ON places.pointid = user_events.eventid
                            LEFT JOIN msgs on msgs.msgid = user_events.eventid ) AS user_events

                            JOIN places p ON p.pointid = user_events.pointid


                            WHERE p.userid= '$id'
                            GROUP BY user_events.pointid
                            ORDER BY id DESC LIMIT ".$offset.','.$limit;
        else{
            if($id!=-1)
            {
                $query="SELECT
                            user_events.id,
                            p.title,
                            p.description,
                            p.pointA,
                            p.pointB,
                            p.pointid,
                            p.date,
                            u.login,
                            p.rating,
                            IF(rating.id IS NOT NUll,NULL,IF(p.userid='$id',null,1)) AS ip

                         FROM
                        (SELECT
                            user_events.id,
                            user_events.date,
                        IF(places.pointid is NULL,msgs.pointid,places.pointid) AS pointid

                        FROM (SELECT *  FROM user_events ORDER BY user_events.id DESC) AS user_events

                        LEFT JOIN places ON places.pointid = user_events.eventid
                        LEFT JOIN msgs on msgs.msgid = user_events.eventid ) AS user_events

                        JOIN places p ON p.pointid = user_events.pointid
                        JOIN users u ON p.userid = u.userid

                        LEFT JOIN rating ON rating.userid='$id' AND p.pointid=rating.postid

                        GROUP BY user_events.pointid
                        ORDER BY id DESC LIMIT ".$offset.','.$limit;
            }else{
                $query="SELECT
                            user_events.id,
                            p.title,
                            p.description,
                            p.pointA,
                            p.pointB,
                            p.pointid,
                            p.date,
                            u.login,
                            p.rating,
                            IF(rating.id IS NOT NUll,NULL,1) AS ip

                         FROM
                        (SELECT
                            user_events.id,
                            user_events.date,
                        IF(places.pointid is NULL,msgs.pointid,places.pointid) AS pointid

                        FROM (SELECT *  FROM user_events ORDER BY user_events.id DESC) AS user_events

                        LEFT JOIN places ON places.pointid = user_events.eventid
                        LEFT JOIN msgs on msgs.msgid = user_events.eventid ) AS user_events

                        JOIN places p ON p.pointid = user_events.pointid
                        JOIN users u ON p.userid = u.userid

                        LEFT JOIN rating ON rating.ip='$ip' AND p.pointid=rating.postid

                        GROUP BY user_events.pointid
                        ORDER BY id DESC LIMIT ".$offset.','.$limit;
            }
        }
        $rows=mysql_query($query);
        while($row=mysql_fetch_assoc($rows))
        {
            $result[]=$row;
        }
        return $result;
    }


    public function get_all_posts($offset,$limit,$ip,$id,$option)
    {
        if(!$id)
            $id=-1;
        $result=array();
        if($option)
            $query="SELECT p.pointid,p.pointA,p.pointB,p.title,p.description,p.date,p.rating
                    FROM places p   WHERE p.userid = '$id'
                    ORDER BY pointid DESC LIMIT ".$offset.','.$limit;
        else{
            if($id!=-1)
            {
                $query="SELECT u.login,p.pointid,p.pointA,p.pointB,p.title,p.description,p.date,p.rating,
					IF(rating.id IS NOT NUll,NULL,IF(p.userid='$id',null,1)) AS ip
                    FROM places p JOIN users u ON p.userid =u.userid
                    LEFT JOIN rating ON rating.userid='$id' AND p.pointid=rating.postid
                    ORDER BY p.pointid DESC LIMIT ".$offset.','.$limit;
            }else{
                $query="SELECT u.login,p.pointid,p.pointA,p.pointB,p.title,p.description,p.date,p.rating,
					IF(rating.id IS NOT NUll,NULL,1) AS ip
                    FROM places p JOIN users u ON p.userid =u.userid
                    LEFT JOIN rating ON rating.ip='$ip' AND p.pointid=rating.postid
                    GROUP BY p.pointid
                    ORDER BY p.pointid DESC LIMIT ".$offset.','.$limit;
            }
        }
        $rows=mysql_query($query);
        while($row=mysql_fetch_assoc($rows))
        {
            $result[]=$row;
        }
        return $result;
    }


    public function get_all_photos($offset,$limit,$id)
    {
        return 0;
    }



    public function get_all_comments($offset=false,$limit=false,$id=false)
    {
        $result=array();
        if($id)
        {
            $query="SELECT m.msg,m.date,u.login,u.avatar,m.pointid,p.pointA,p.pointB,p.title FROM msgs m
                        JOIN users u
                        ON m.userid = u.userid AND m.ownerid='$id'
                        JOIN places p ON m.pointid = p.pointid
                        ORDER BY m.date DESC LIMIT ".$offset.','.$limit;
        }else{
            $query="SELECT m.msg,m.date,u.login,u.avatar,m.pointid,p.pointA,p.pointB,p.title FROM msgs m
                        JOIN users u
                        ON m.userid = u.userid
                        JOIN places p ON m.pointid = p.pointid
                        ORDER BY m.date DESC LIMIT ".$offset.','.$limit;
        }
         $rows=mysql_query($query) or die(false);
         while($row=mysql_fetch_assoc($rows))
         {
             $result[]=$row;
         }
         return $result;
    }

    public function get_point_comments($point,$offset,$limit)
    {
        $result=array();

            $query="SELECT m.msg,m.date,u.login,u.avatar,m.pointid,p.pointA,p.pointB,p.title FROM msgs m
                            JOIN users u
                            ON m.userid = u.userid
                            JOIN places p ON m.pointid = p.pointid AND m.pointid ='$point'
                            ORDER BY m.date DESC LIMIT ".$offset.','.$limit;

        $rows=mysql_query($query) or die(false);
        while($row=mysql_fetch_assoc($rows))
        {
            $result[]=$row;
        }
        return $result;
    }

    public function check_rating($ip,$id,$postid)
    {
        if(!$id)
            $id=-1;
        if($id!=-1)
        {
            $query="SELECT
                    if(rating.userid = '$id', NULL, p.rating) AS rating
                FROM
                    rating
                        RIGHT JOIN
                    places p ON p.pointid = rating.postid
                WHERE
                    p.pointid = '$postid'";
        }else{
            $query="SELECT
                        if(rating.ip = '$ip', NULL,p.rating)AS rating
                FROM
                    rating
                        RIGHT JOIN
                    places p ON p.pointid = rating.postid
                WHERE
                    p.pointid = '$postid'";
        }
        $row=mysql_query($query) or die(mysql_error());
        $result=mysql_fetch_row($row);
        if($result[0]==null)
            die();
        else
            return $result[0];
    }

    public function update_rating($val,$id)
    {
        $query="UPDATE places
                    SET places.rating = '$val'
                    WHERE places.pointid = '$id' ";
        $result=mysql_query($query) or die();
    }

    public function update_rating_ip($id,$ip,$postid)
    {
        $query="INSERT INTO rating (ip,userid,postid)
                  VALUES('$ip','$id','$postid')";
        $result=mysql_query($query) or die();
    }




}










/*TRIGGERS*/
/*DELIMITER $$
CREATE TRIGGER `before_users_insert` AFTER INSERT ON `users`
FOR EACH ROW BEGIN
INSERT INTO checks Set checks.userid = NEW.userid;
END;
*/
/*
DELIMITER $$
CREATE TRIGGER `after_msgs_insert` AFTER INSERT ON `msgs`
FOR EACH ROW BEGIN
INSERT INTO user_events Set user_events.eventid = NEW.msgid,
user_events.eventname = 'msgs',user_events.ownerid = NEW.ownerid,
user_events.userid = NEW.userid;
END;
*/
/*
 * DELIMITER $$
CREATE TRIGGER `after_places_insert` AFTER INSERT ON `places`
FOR EACH ROW BEGIN
INSERT INTO user_events Set user_events.eventid = NEW.pointid,
user_events.eventname = 'places',user_events.ownerid = NEW.userid;
END;
 */


/*
 *
 * SELECT

    u.login AS owner,
	p.date,
    p.pointid,
    p.pointA,
    p.pointB,
    p.title,
    p.description,
	msgs.msg,
	msgs.date,
    us.login AS sender
FROM
    msgs
        LEFT JOIN
    places p ON p.pointid = msgs.pointid
		LEFT JOIN
	users u ON p.userid = u.userid
		JOIN users us ON msgs.userid = us.userid

WHERE p.pointid = 35*/

/*
 * SELECT
	IF(msgs.pointid is NULL,(SELECT MAX(pointid)FROM places),msgs.pointid) AS pointid
FROM user_events

LEFT JOIN msgs ON  user_events.eventid=msgs.pointid
LEFT JOIN msgs m ON user_events.eventid=m.pointid
WHERE user_events.eventid='39'
GROUP BY  user_events.eventid*/


/*SELECT
	user_events.id,
	m.msg,
	m.date AS msg_date,
	places.title,
	p.title,
	places.date AS place_date,
	p.date AS place_date
FROM user_events
LEFT JOIN places ON user_events.eventid = places.pointid
LEFT JOIN msgs ON places.pointid = msgs.pointid
LEFT JOIN msgs m ON m.msgid = user_events.eventid
LEFT JOIN places p ON p.pointid = m.pointid


ORDER BY user_events.date DESC
LIMIT 3*/

/*SELECT
	user_events.pointid,
	p.title,
	p.description,
	p.pointA,
	p.pointB

 FROM
(SELECT
	user_events.id,
	user_events.date,
IF(places.pointid is NULL,msgs.pointid,places.pointid) AS pointid

FROM (SELECT *  FROM user_events ORDER BY user_events.id DESC) AS user_events

LEFT JOIN places ON places.pointid = user_events.eventid
LEFT JOIN msgs on msgs.msgid = user_events.eventid ) AS user_events

JOIN places p ON p.pointid = user_events.pointid

GROUP BY user_events.pointid
ORDER BY id DESC LIMIT 3*/



