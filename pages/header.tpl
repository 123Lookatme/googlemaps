<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <meta name="author" content="">
    <link rel="icon" href="../../favicon.ico">

    <title>Project</title>

    <!-- Bootstrap core CSS -->
    <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css">
    <!-- Custom styles for this template -->
    <link rel="stylesheet" href="http://getbootstrap.com/examples/jumbotron-narrow/jumbotron-narrow.css">
    <link rel="stylesheet" href="./styles/style.css">
    <link rel="stylesheet" href="./styles/loading.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>

</head>

<body>

<div class="container">
    <div class="header">
        <ul class="nav nav-pills pull-left">
            <li class="active"><a href="index.php">Home</a></li>
            <?php if(isset($_SESSION['id'])):?>
                <li><a href="?nav=cabinet">Личный кабинет</a></li>
                <li><a href="?nav=exit">EXIT</a></li>
            <?php else:?>
                <li><a href="?nav=login">Войти/Зарегистрироваться</a></li>
            <?php endif;?>
        </ul>

    </div>


