var vm;
var twitdata = [];
var list = [];
var currentKeyword = '';

var ViewModel = function() {
    var self = this;
    this.list = ko.observableArray();
    this.selected = ko.observable();

    this.addTweet = function(raw) {
        let obj = new Tweet(raw, currentKeyword);
        if (obj.tweet !== null) {
            list.push(obj.tweet);
            if (list.length >= 1) {
                $("#searching-gif").hide();
            }
            this.list.push(obj.tweet);
        }
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
            currentKeyword = input;
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
    let raw = '{"created_at":"Sun Sep 01 21:40:05 +0000 2019","id":1168277370069049348,"id_str":"1168277370069049348","text":"What were the chances?! \ud83d\ude02\ud83d\ude02\ud83d\ude02","source":"\u003ca href=\\"http:\\/\\/twitter.com\\/download\\/iphone\\" rel=\\"nofollow\\"\u003eTwitter for iPhone\u003c\\/a\u003e","truncated":false,"in_reply_to_status_id":null,"in_reply_to_status_id_str":null,"in_reply_to_user_id":null,"in_reply_to_user_id_str":null,"in_reply_to_screen_name":null,"user":{"id":1095101999949991937,"id_str":"1095101999949991937","name":"Delia-Maria Asser","screen_name":"AsserDelia","location":"Ashford, England","url":null,"description":"MasterChef 2019 Contestant \ud83d\udc69\ud83c\udffc\u200d\ud83c\udf73 Foodie \ud83c\udf74\ud83e\udd44 Kent\'s Finest \ud83d\udc6e\ud83c\udffc\u200d\u2640\ufe0fEspa\u00f1a \ud83c\uddea\ud83c\uddf8 UK \ud83c\uddec\ud83c\udde7 Mr B\ud83d\udc6b","translator_type":"none","protected":false,"verified":false,"followers_count":3578,"friends_count":40,"listed_count":6,"favourites_count":132,"statuses_count":47,"created_at":"Mon Feb 11 23:27:17 +0000 2019","utc_offset":null,"time_zone":null,"geo_enabled":true,"lang":null,"contributors_enabled":false,"is_translator":false,"profile_background_color":"F5F8FA","profile_background_image_url":"","profile_background_image_url_https":"","profile_background_tile":false,"profile_link_color":"1DA1F2","profile_sidebar_border_color":"C0DEED","profile_sidebar_fill_color":"DDEEF6","profile_text_color":"333333","profile_use_background_image":true,"profile_image_url":"http:\\/\\/pbs.twimg.com\\/profile_images\\/1099239671706644481\\/ge7v9rME_normal.jpg","profile_image_url_https":"https:\\/\\/pbs.twimg.com\\/profile_images\\/1099239671706644481\\/ge7v9rME_normal.jpg","profile_banner_url":"https:\\/\\/pbs.twimg.com\\/profile_banners\\/1095101999949991937\\/1550914134","default_profile":true,"default_profile_image":false,"following":null,"follow_request_sent":null,"notifications":null},"geo":null,"coordinates":null,"place":{"id":"13dd0eca94d322f1","url":"https:\\/\\/api.twitter.com\\/1.1\\/geo\\/id\\/13dd0eca94d322f1.json","place_type":"city","name":"Basildon","full_name":"Basildon, East","country_code":"GB","country":"United Kingdom","bounding_box":{"type":"Polygon","coordinates":[[[0.383634,51.546378],[0.383634,51.594472],[0.530637,51.594472],[0.530637,51.546378]]]},"attributes":{}},"contributors":null,"quoted_status_id":1167383523721916416,"quoted_status_id_str":"1167383523721916416","quoted_status":{"created_at":"Fri Aug 30 10:28:15 +0000 2019","id":1167383523721916416,"id_str":"1167383523721916416","text":"So the funniest thing happened to me this week. Back in April I placed the below tweet on Twitter. This week, the g\u2026 https:\\/\\/t.co\\/pP9EV7V4P8","display_text_range":[0,140],"source":"\u003ca href=\\"http:\\/\\/twitter.com\\/download\\/iphone\\" rel=\\"nofollow\\"\u003eTwitter for iPhone\u003c\\/a\u003e","truncated":true,"in_reply_to_status_id":null,"in_reply_to_status_id_str":null,"in_reply_to_user_id":null,"in_reply_to_user_id_str":null,"in_reply_to_screen_name":null,"user":{"id":79553700,"id_str":"79553700","name":"Sandy Adams-Crane","screen_name":"SandyA13","location":null,"url":null,"description":null,"translator_type":"none","protected":false,"verified":false,"followers_count":89,"friends_count":138,"listed_count":0,"favourites_count":878,"statuses_count":178,"created_at":"Sat Oct 03 20:06:15 +0000 2009","utc_offset":null,"time_zone":null,"geo_enabled":true,"lang":null,"contributors_enabled":false,"is_translator":false,"profile_background_color":"C0DEED","profile_background_image_url":"http:\\/\\/abs.twimg.com\\/images\\/themes\\/theme1\\/bg.png","profile_background_image_url_https":"https:\\/\\/abs.twimg.com\\/images\\/themes\\/theme1\\/bg.png","profile_background_tile":false,"profile_link_color":"1DA1F2","profile_sidebar_border_color":"C0DEED","profile_sidebar_fill_color":"DDEEF6","profile_text_color":"333333","profile_use_background_image":true,"profile_image_url":"http:\\/\\/pbs.twimg.com\\/profile_images\\/804633359465017344\\/LfrR-f9M_normal.jpg","profile_image_url_https":"https:\\/\\/pbs.twimg.com\\/profile_images\\/804633359465017344\\/LfrR-f9M_normal.jpg","profile_banner_url":"https:\\/\\/pbs.twimg.com\\/profile_banners\\/79553700\\/1427728208","default_profile":true,"default_profile_image":false,"following":null,"follow_request_sent":null,"notifications":null},"geo":null,"coordinates":null,"place":null,"contributors":null,"is_quote_status":false,"extended_tweet":{"full_text":"So the funniest thing happened to me this week. Back in April I placed the below tweet on Twitter. This week, the girl only walked through the door and joined my team!!! Welcome @AsserDelia! I can say that the cake she made for the team was amazing! @MasterChefUK https:\\/\\/t.co\\/xtfQzf6e6J","display_text_range":[0,263],"entities":{"hashtags":[],"urls":[],"user_mentions":[{"screen_name":"AsserDelia","name":"Delia-Maria Asser","id":1095101999949991937,"id_str":"1095101999949991937","indices":[178,189]},{"screen_name":"MasterChefUK","name":"MasterChef UK \ud83c\udf74","id":66985184,"id_str":"66985184","indices":[250,263]}],"symbols":[],"media":[{"id":1167383519733178369,"id_str":"1167383519733178369","indices":[264,287],"media_url":"http:\\/\\/pbs.twimg.com\\/media\\/EDNhIEpXYAE8GYZ.jpg","media_url_https":"https:\\/\\/pbs.twimg.com\\/media\\/EDNhIEpXYAE8GYZ.jpg","url":"https:\\/\\/t.co\\/xtfQzf6e6J","display_url":"pic.twitter.com\\/xtfQzf6e6J","expanded_url":"https:\\/\\/twitter.com\\/SandyA13\\/status\\/1167383523721916416\\/photo\\/1","type":"photo","sizes":{"small":{"w":314,"h":680,"resize":"fit"},"thumb":{"w":150,"h":150,"resize":"crop"},"medium":{"w":554,"h":1200,"resize":"fit"},"large":{"w":946,"h":2048,"resize":"fit"}}}]},"extended_entities":{"media":[{"id":1167383519733178369,"id_str":"1167383519733178369","indices":[264,287],"media_url":"http:\\/\\/pbs.twimg.com\\/media\\/EDNhIEpXYAE8GYZ.jpg","media_url_https":"https:\\/\\/pbs.twimg.com\\/media\\/EDNhIEpXYAE8GYZ.jpg","url":"https:\\/\\/t.co\\/xtfQzf6e6J","display_url":"pic.twitter.com\\/xtfQzf6e6J","expanded_url":"https:\\/\\/twitter.com\\/SandyA13\\/status\\/1167383523721916416\\/photo\\/1","type":"photo","sizes":{"small":{"w":314,"h":680,"resize":"fit"},"thumb":{"w":150,"h":150,"resize":"crop"},"medium":{"w":554,"h":1200,"resize":"fit"},"large":{"w":946,"h":2048,"resize":"fit"}}}]}},"quote_count":0,"reply_count":1,"retweet_count":0,"favorite_count":2,"entities":{"hashtags":[],"urls":[{"url":"https:\\/\\/t.co\\/pP9EV7V4P8","expanded_url":"https:\\/\\/twitter.com\\/i\\/web\\/status\\/1167383523721916416","display_url":"twitter.com\\/i\\/web\\/status\\/1\u2026","indices":[117,140]}],"user_mentions":[],"symbols":[]},"favorited":false,"retweeted":false,"possibly_sensitive":false,"filter_level":"low","lang":"en"},"quoted_status_permalink":{"url":"https:\\/\\/t.co\\/bRqF3V905R","expanded":"https:\\/\\/twitter.com\\/sandya13\\/status\\/1167383523721916416","display":"twitter.com\\/sandya13\\/statu\u2026"},"is_quote_status":true,"quote_count":0,"reply_count":0,"retweet_count":0,"favorite_count":0,"entities":{"hashtags":[],"urls":[],"user_mentions":[],"symbols":[]},"favorited":false,"retweeted":false,"filter_level":"low","lang":"en","timestamp_ms":"1567374005225"}';

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
        $("#stream-button p").text(timeleft);
        timeleft -= 1;
        if(timeleft <= 0){
            clearInterval(downloadTimer);
            $("#stream-button p").text("Stream");
        }
    }, 1000);
}

/* RETIRED

function BuildTweet(json_data) {
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
 */