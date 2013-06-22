/*********************************************

  jqSimpleTweets v1.0 
  Works with the new Twitter API 1.1

  Copyright http://devfront.net
  Email: hello@devfront.net

**********************************************/

jQuery.fn.jqSimpleTweets = function(options) {
  
  //container is your div id
  var container = this;
  var tweets = []; //will contain tweets

  var settings = $.extend({}, 
    {
	    username: "",
	    tweetcount: 5,
	    includeretweets: true,
      excludereplies: false,
      displaytweetavatar: false,
      displayheaderavatar: true,
      loadingtext: "loading tweets...",
      loadtweetfile: "jqSimpleTweets/tweet.php",
      maxlimit: 20,

      //twitter guidelines require hashtags,urls,usernames to be links 
      linkurls:     true,
      linkusernames: true,
      linkhashtags:  true,

      //twitter guidelines require hashtags,urls,usernames to be links 
      displayactions:   true,

      //user your own class names if needed
      classcontainer: "tweet_container",  
      classheader:    "tweet_header",
      classfeed:      "tweet_feed",
      classavatar:    "tweet_avatar",
      classtweet:     "tweet_text",
      classdate:      "tweet_date",
      classactions:   "tweet_actions"
      
    },options);


  //data to be passed to php 
   var data = {
          name: settings.username,
          maxlimit: settings.maxlimit,
          includeretweets: settings.includeretweets,
          excludereplies: settings.excludereplies
   }
  
   var tweetHeader = "",
       tweetHTML ="",
       finalTweetHTML ="";

 /*
 * While waiting, display your loading text first
 */
  displayDefault(settings.loadingtext);


  $.getJSON(settings.loadtweetfile, data , function(result){
        
        //empty header and tweet list
        tweetHeader = "";
        tweetHTML = "";  


        
        /*
        * Grab the very first result so we can use the
        * information on our header
        */
        var firstTweet = $(result)[0];
    
       /*
        * If user's timeline is empty - display "No tweets to display"
        */
       if (!firstTweet) {displayDefault("No tweets to display"); return false;}

        var username   = firstTweet.user.name,
            screenname = "<a href='http://twitter.com/"+firstTweet.user.screen_name+"'>@"+firstTweet.user.screen_name+"</a>",
            avatar     = "<img src='"+firstTweet.user.profile_image_url+"'"+
                         "alt='"+username+"' class='"+settings.classavatar+"'>";
 
        /*
        * If user decides not to have an avatar on header, add class no_avatar to div
        */
        if (!settings.displayheaderavatar) settings.classheader = settings.classheader+ " no_avatar";
       
        tweetHeader = tweetHeader + "<div class='"+settings.classheader+"'>";
        if (settings.displayheaderavatar) tweetHeader = tweetHeader + avatar;
        tweetHeader = tweetHeader + "<p>"+username+" <span>"+screenname+"</span></p>";
        tweetHeader = tweetHeader + "</div>";


            $.each(result, function(index, d){ 
	
	            //get required data
	            var tweetText = d.text,
	                tweetDate= d.created_at.toString(),
	                tweetID = d.id_str;
                
                //format date
                 var tweetDateArray = tweetDate.split(' '),
                     tweetDay   = tweetDateArray[0],
                     tweetMonth = tweetDateArray[1],
                     tweetDate  = tweetDateArray[2],
                     tweetTime  = tweetDateArray[3],
                     tweetYear  = tweetDateArray[5];
     
                 tweetDate  = tweetDate + ' ' + tweetMonth + ' ' + tweetYear;

                 //format tweet (convert hashtags, usernames, links to clickable links)
                 if (settings.linkurls) tweetText = replaceURLs(tweetText);
                 if (settings.linkusernames) tweetText = replaceUserNames(tweetText);
                 if (settings.linkhashtags) tweetText = replaceHashTags(tweetText);
     
                        
                 
                 if (settings.displayactions) {
                   var tweetActions = "<div class='"+settings.classactions+"'>",
                       tweetActionsURL = "https://twitter.com/intent/",
                       tweetReplyURL = tweetActionsURL + "tweet?in_reply_to="+tweetID,
                       tweetFavoriteURL =tweetActionsURL + "favorite?tweet_id="+tweetID,
                       tweetRetweetURL = tweetActionsURL +"retweet?tweet_id="+tweetID;
                     
                       tweetActions = tweetActions + "<a href='"+tweetReplyURL+"' class='tweet_reply'>Reply</a>";
                       tweetActions = tweetActions + " <a href='"+tweetFavoriteURL+"' class='tweet_favorite'>Favorite</a>";
                       tweetActions = tweetActions + " <a href='"+tweetRetweetURL+"' class='tweet_retweet'>Retweet</a>";
                       tweetActions = tweetActions + "</div>";
                 } else {
	                var tweetActions = "";
                 }
  
                 //each tweet contained in <li></li>                         
                 tweetHTML = tweetHTML + "<li>"; 
                 if (settings.displaytweetavatar) {
	                 settings.classfeed = settings.classfeed + " with_avatar";
	                 tweetHTML = tweetHTML + avatar;
	             } 
                 tweetHTML = tweetHTML + "<p class='tweet_text'>" + tweetText +"</p>";
                 tweetHTML = tweetHTML + "<a href='https://twitter.com/w3c/status/"+tweetID+"' class='"+settings.classdate+"'>"+tweetDate+ "</a>";
                 tweetHTML = tweetHTML + tweetActions;
                 tweetHTML = tweetHTML + "</li>";
                 tweets.push(tweetHTML);
                 
                 //stop once it reaches tweet count
                 if (index==(settings.tweetcount-1)) return false; 
            });
        
           finalTweetHTML = finalTweetHTML + tweetHeader;
           finalTweetHTML = finalTweetHTML + "<ul class='"+settings.classfeed+"'>"+tweetHTML+"</ul>";
           
           /*
           * Remove loading_tweets class once you have tweets to display
           */
		       $(container).removeClass('loading_tweets');

           /*
           * Finally, display the tweets
           */
           displayTweets(finalTweetHTML);
      
           }).error(function(jqXHR, textStatus, errorThrown){
                 console.log(textStatus);
                 displayDefault(errorThrown);
   });


  //functions for SimplyTweets 
  function displayTweets(html) {
	 $(container).html("<div class='"+settings.classcontainer+"'>"+html+"</div>");
  }

  function displayDefault(text) {
	 $(container).addClass('loading_tweets');
	 tweetHeader = "<div class='"+settings.classheader+" no_avatar'>@"+settings.username+"</div>",
	 tweetHTML = "<ul class='tweet_feed'><li>"+text+"</li></ul>",
	 displayTweets(tweetHeader+tweetHTML);
  }

  /*
  * Let's link all the URLs, hashtags, and usernames contained within a tweet
  */
  function replaceURLs(text) {
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp,"<a href='$1' class='tweet_link'>$1</a>"); 
  }

  function replaceUserNames(text){
    var exp = /\B@([_a-z0-9]+)/ig;
    return text.replace(exp,"<a href='http://www.twitter.com/$1' class='tweet_user'>@$1</a>"); 
  }

   function replaceHashTags(text){
    var exp = /(^|\s|[^\w\d])#([\wáéíóú]+)/gi;
    return text.replace(/#(\S*)/g,'<a href="http://twitter.com/#!/search/$1" class="tweet_hashtag">#$1</a>');
  }

};