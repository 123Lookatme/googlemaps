<?php
session_start();
 class Controller{
     private $get;
     private $post;
     private $db;

     function __construct()
     {
         $this->get=$_GET;
         $this->post=$_POST;
         $this->db=Database::get_instance();
     }
     private function loadView($view)
     {
         include('pages/'.$view.'.tpl');
     }

     public function get_profile($id)
     {
         $result=$this->db->get_profile($id);
         return $result;
     }
     public function route()
     {
         $this->loadView('header');
         if($this->get)
         {
             foreach($this->get as $k=>$v)
             {
                 switch($k)
                 {
                     case'nav':
                         switch($v)
                         {
                             case 'register' : $this->loadView('register');break;
                             case 'login' : $this->loadView('login');break;
                             case 'mailconfirm':$this->loadView('mailconfirm');break;
                             case 'cabinet':if($_SESSION['id'])
                                                $this->loadView('cabinet');
                                            else
                                                 header("Location:index.php");break;
                             case 'exit':session_unset();
                                         header("Location:index.php");break;

                         }break;
                 }
             }
         }else
         {
             $this->loadView('main');

         }


         $this->loadView('footer');
     }

 }