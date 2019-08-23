var vm;
var twitdata = [];
var list = [];


function Tweet(json_data) {
	let parse = JSON.parse(json_data);
	if (typeof parse.extended_tweet !== 'undefined') {
        parse.text = parse.extended_tweet.full_text
    }
	parse.user.profile_url = 'https://twitter.com/' + parse.user.screen_name;

	let dateParse = dateFns.parse(parse.created_at);
    let format = dateFns.format(dateParse, 'h:mm:ss A');
    if (typeof parse.retweeted_status !== 'undefined') {
        parse.formatted_date = ' - Retweeted at: ' + format;
        parse.retweeted_status.user.profile_url = 'https://twitter.com/' + parse.retweeted_status.user.screen_name;
        let dateParseRetweet = dateFns.parse(parse.retweeted_status.created_at);
        let formatRetweet = dateFns.format(dateParseRetweet, 'h:mm:ss A • MMM D, YYYY');
        parse.retweeted_status.formatted_date = ' - Created at: ' + formatRetweet;

    } else {
        parse.formatted_date = ' - Created at: ' + format;
        parse.retweeted_status = null;
    }
    list.push(parse);
    if (list.length >= 1) {$("#searching-gif").hide();}
    return parse;
}

var ViewModel = function() {
    var self = this;
    this.list = ko.observableArray();
    this.selected = ko.observable();

    this.addTweet = function(raw) {
        this.list.push(new Tweet(raw));
    }

    this.selectTweet = function(data) {
        this.selected(data);
    }

    this.clearSelected = function () {
        this.selected(undefined);
    }
};

$(document).ready(function() {
    IntroFadeIn();
    vm = new ViewModel();
    ko.applyBindings(vm);

    $('#go-button').click(function() {
        StartApplication();
    });

    $('#search-button').click(function() {
        SearchUser();
    });

    $('#stream-button').click(function() {
        let input = $('#input').val().trim();
        if (input.length === 0) {
            $("#input").css("border", "1px solid red");
        } else {
            $("#input").css("border", "1px solid #ccc");
            if (!($("#stream-button").hasClass("disabled"))) {
                $("#stream-button").addClass("disabled");
                $("#searching-gif").show();
                console.log('starting');
                StreamTimerHandler();
                StreamTwitter(input);
            }
        }
    });

    $('#test-button').click(function() {
        FormatTesting();
    });

    $("#overlay-close-icon").click(function () {
        $("#about").fadeOut();
    })

    $("#about-button").click(function () {
        $("#about").fadeIn();
    })

    $("#start-button").click(function () {
        StartHandler();
    })

    $("#keyword-button").click(function () {
        KeywordButtonHandler();
    })

    $("#options-expand-bar").click(function () {
        ShowStreamOptions();
    })

    $(document).on('click','.tweet-queue-item',function(){
        let ID = this.getAttribute('id');
        vm.clearSelected();
        //let selected = '#' + ID + ' .tweet-expanded';
        FindTweet(ID);
    });

});

function StartApplication() {
    jQuery.ajax({
        url: '/stream/start',
        type: 'GET',
        success: function (msg) {
            console.log('Amazing');
        },
        error: function (xhr, errormsg) {

        }
    });
}

function SearchUser() {
    jQuery.ajax({
        url: '/stream/search_user',
        type: 'POST',
        data: {user: 'realDonaldTrump'},
        success: function (msg) {
            console.log('Straight Fire');
        },
        error: function (xhr, errormsg) {

        }
    });
}

function StreamTwitter(input) {
    var d = '';
    var last_response_len = false;
    $.ajax({url: '/stream/filter',
            type: 'POST',
            data: {'data' : input},
            xhrFields: {
            onprogress: function(e)
            {
                var this_response, response = e.currentTarget.response;
                if(last_response_len === false) {
                    this_response = response;
                    last_response_len = response.length;
                } else {
                    this_response = response.substring(last_response_len);
                    last_response_len = response.length;
                }

                let data = this_response.trimStart().split("\r\n\r\n");
                for (let i = 0; i < data.length; ++i){
                    twitdata.push(data[i].trim());
                }
                if (twitdata.length >= 2) {
                    ParseStream();
                }
            }
        }
    })
        .done(function(data)
        {
            $("#stream-button").removeClass("disabled");
            if (data !== '[SIP]'){
                EndStream();
            }
        })
        .fail(function(data)
        {
            console.log('Error: ', data);
        });
    console.log('Request Sent');
}

function ParseStream () {
    let pop = twitdata.shift();
    if (pop.includes('{"created_at')) {
        let first = pop;
        if (pop.includes('timestamp_ms')) {
            vm.addTweet(pop);
            //done.push(JSON.parse(pop));
        } else {
            let last = twitdata.shift();
            first += last;
            vm.addTweet(first);
            //done.push(JSON.parse(first));
        }
    }
    //console.log(done);
}

function EndStream() {
    jQuery.ajax({
        url: '/stream/end',
        type: 'GET',
        success: function (msg) {
            console.log('Straight Fire');
        },
        error: function (xhr, errormsg) {
        }
    });
}

function FormatTesting() {
    let raw = '{"created_at":"Sat Aug 03 15:41:07 +0000 2019","id":1157677787974684672,"id_str":"1157677787974684672","text":"RT @foodandwine: How to make a disgusting cookie sheet look brand new:  https:\\/\\/t.co\\/sxtj1bsvYs","source":"\u003ca href=\\"https:\\/\\/twitter.com\\/\\" rel=\\"nofollow\\"\u003eItalianWine\u003c\\/a\u003e","truncated":false,"in_reply_to_status_id":null,"in_reply_to_status_id_str":null,"in_reply_to_user_id":null,"in_reply_to_user_id_str":null,"in_reply_to_screen_name":null,"user":{"id":2348285916,"id_str":"2348285916","name":"ItalianWineMarketing","screen_name":"TwitItalianWine","location":"Fiume Veneto","url":"http:\\/\\/www.zunelliassociati.it\\/","description":"#Italian #Wine #Wineries #Sommelier #Distributor  #Blog  #WineTourism #WineLovers #vino : News from #wineworld and  #International #Fairs","translator_type":"none","protected":false,"verified":false,"followers_count":26425,"friends_count":28918,"listed_count":932,"favourites_count":275119,"statuses_count":373034,"created_at":"Mon Feb 17 10:46:48 +0000 2014","utc_offset":null,"time_zone":null,"geo_enabled":true,"lang":null,"contributors_enabled":false,"is_translator":false,"profile_background_color":"084D66","profile_background_image_url":"http:\\/\\/abs.twimg.com\\/images\\/themes\\/theme15\\/bg.png","profile_background_image_url_https":"https:\\/\\/abs.twimg.com\\/images\\/themes\\/theme15\\/bg.png","profile_background_tile":true,"profile_link_color":"DD2E44","profile_sidebar_border_color":"FFFFFF","profile_sidebar_fill_color":"C0DFEC","profile_text_color":"333333","profile_use_background_image":true,"profile_image_url":"http:\\/\\/pbs.twimg.com\\/profile_images\\/938428825444212739\\/4oUUWhtE_normal.jpg","profile_image_url_https":"https:\\/\\/pbs.twimg.com\\/profile_images\\/938428825444212739\\/4oUUWhtE_normal.jpg","profile_banner_url":"https:\\/\\/pbs.twimg.com\\/profile_banners\\/2348285916\\/1441963046","default_profile":false,"default_profile_image":false,"following":null,"follow_request_sent":null,"notifications":null},"geo":null,"coordinates":null,"place":null,"contributors":null,"retweeted_status":{"created_at":"Sat Aug 03 14:02:04 +0000 2019","id":1157652859682467842,"id_str":"1157652859682467842","text":"How to make a disgusting cookie sheet look brand new:  https:\\/\\/t.co\\/sxtj1bsvYs","source":"\u003ca href=\\"http:\\/\\/www.socialflow.com\\" rel=\\"nofollow\\"\u003eSocialFlow\u003c\\/a\u003e","truncated":false,"in_reply_to_status_id":null,"in_reply_to_status_id_str":null,"in_reply_to_user_id":null,"in_reply_to_user_id_str":null,"in_reply_to_screen_name":null,"user":{"id":30278532,"id_str":"30278532","name":"Food & Wine","screen_name":"foodandwine","location":null,"url":"http:\\/\\/foodandwine.com","description":"Upgrade your everyday. Our social media terms: http:\\/\\/fandw.me\\/1GQcIYi","translator_type":"none","protected":false,"verified":true,"followers_count":6645037,"friends_count":740,"listed_count":14721,"favourites_count":4426,"statuses_count":110277,"created_at":"Fri Apr 10 18:28:51 +0000 2009","utc_offset":null,"time_zone":null,"geo_enabled":true,"lang":null,"contributors_enabled":false,"is_translator":false,"profile_background_color":"FFFFFF","profile_background_image_url":"http:\\/\\/abs.twimg.com\\/images\\/themes\\/theme1\\/bg.png","profile_background_image_url_https":"https:\\/\\/abs.twimg.com\\/images\\/themes\\/theme1\\/bg.png","profile_background_tile":false,"profile_link_color":"0084B4","profile_sidebar_border_color":"FFFFFF","profile_sidebar_fill_color":"F5F5F5","profile_text_color":"333333","profile_use_background_image":false,"profile_image_url":"http:\\/\\/pbs.twimg.com\\/profile_images\\/738810295301246977\\/sJKDqlWh_normal.jpg","profile_image_url_https":"https:\\/\\/pbs.twimg.com\\/profile_images\\/738810295301246977\\/sJKDqlWh_normal.jpg","profile_banner_url":"https:\\/\\/pbs.twimg.com\\/profile_banners\\/30278532\\/1515453818","default_profile":false,"default_profile_image":false,"following":null,"follow_request_sent":null,"notifications":null},"geo":null,"coordinates":null,"place":null,"contributors":null,"is_quote_status":false,"quote_count":0,"reply_count":0,"retweet_count":14,"favorite_count":47,"entities":{"hashtags":[],"urls":[{"url":"https:\\/\\/t.co\\/sxtj1bsvYs","expanded_url":"https:\\/\\/trib.al\\/enVFXFV","display_url":"trib.al\\/enVFXFV","indices":[55,78]}],"user_mentions":[],"symbols":[]},"favorited":false,"retweeted":false,"possibly_sensitive":false,"filter_level":"low","lang":"en"},"is_quote_status":false,"quote_count":0,"reply_count":0,"retweet_count":0,"favorite_count":0,"entities":{"hashtags":[],"urls":[{"url":"https:\\/\\/t.co\\/sxtj1bsvYs","expanded_url":"https:\\/\\/trib.al\\/enVFXFV","display_url":"trib.al\\/enVFXFV","indices":[72,95]}],"user_mentions":[{"screen_name":"foodandwine","name":"Food & Wine","id":30278532,"id_str":"30278532","indices":[3,15]}],"symbols":[]},"favorited":false,"retweeted":false,"possibly_sensitive":false,"filter_level":"low","lang":"en","timestamp_ms":"1564846867923"}';

    vm.addTweet(raw);
    console.log(vm.list());
}

function IntroFadeIn() {
    $("#title").fadeIn(400, function () {
        $("#description").fadeIn("slow", function () {
            $("#start").fadeIn("slow");
        });
    });
}

function StartHandler() {
    $("#intro").fadeOut("slow", function() {
        $("#application-selector").fadeIn();
    });
}

function KeywordButtonHandler() {
    $("#application-selector").fadeOut(function () {
        $("#keyword-stream-container").fadeIn( function () {
            ShowStreamOptions();
        });
    })
}

function FindTweet(ID) {
    intID = parseInt(ID);
    for (let i = 0; i < list.length; ++i){
        if (list[i].id_str == intID) {
            vm.selectTweet(list[i]);
        }
    }
}

function ShowStreamOptions() {
    if ($("#options-expand-bar").hasClass("collapsed")){
        $("#options-expanded").slideDown(function () {
            $("#expand-arrow").attr("src","images/up-arrow.png");
        });
        $("#options-expand-bar").removeClass("collapsed").addClass("expanded");
    } else {
        $("#options-expanded").slideUp(function () {
            $("#expand-arrow").attr("src","images/down-arrow.png");
        });
        $("#options-expand-bar").removeClass("expanded").addClass("collapsed");
    }
}

function StreamTimerHandler() {
    var timeleft = 30;
    var downloadTimer = setInterval(function(){
        //document.getElementById("countdown").innerHTML = timeleft + " seconds remaining";
        $("#stream-button p").text(timeleft);
        timeleft -= 1;
        if(timeleft <= 0){
            clearInterval(downloadTimer);
            $("#stream-button p").text("Stream");
            //document.getElementById("countdown").innerHTML = "Finished"
        }
    }, 1000);
}