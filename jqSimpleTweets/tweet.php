<?php
   session_start();
   require_once("twitteroauth/twitteroauth.php"); 
   require_once("config.php"); 

  $user = $_REQUEST['name'];
  $maxlimit = $_REQUEST['maxlimit'];
  $includeretweets = $_REQUEST['includeretweets'];
  $excludereplies = $_REQUEST['excludereplies'];

  
  $apilink_user = "https://api.twitter.com/1.1/statuses/user_timeline.json";
  $apilink = $apilink_user."?";

  $query = "screen_name=".$user."&count=".$maxlimit."&exclude_replies=".$excludereplies."&include_rts=".$includeretweets;

 
   function authenticateConnection($cons_key,$cons_secret,$acc_token,$acc_secret){
        $connection = new TwitterOAuth($cons_key, $cons_secret,$acc_token,$acc_secret);
        return $connection;
   }
  
   $connection = authenticateConnection(CONSUMER_KEY,CONSUMER_SECRET,ACCESS_TOKEN,ACCESS_SECRET);
   $tweets = $connection->get($apilink.$query);

    echo json_encode($tweets);
  
?>