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

    this.clearList = function () {
        this.selected(undefined);
        this.list([]);
        list = [];
        twitdata = [];
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

    // Need to simplify this mess
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

    $('#available-tweets-text').click(function() {
        FormatTesting(true);
    });

    $("#clear-button").click(function () {
        vm.clearList();
        UnselectTweet();
    })

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
        UnselectTweet();
        $("#"+ID).addClass("selected");
        vm.clearSelected();
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
            $("#searching-gif").hide();

            if (list.length === 0) {
                FormatTesting(false);
            }

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

function FormatTesting(test) {
    let raw = '{"created_at":"Mon Sep 02 19:22:10 +0000 2019","id":1168605050228199425,"id_str":"1168605050228199425","text":"Oops! Nobody is currently sending Tweets containing the keyword you entered. Please try again, or try another keyword.","source":"\u003ca href=\\"https:\\/\\/mobile.twitter.com\\" rel=\\"nofollow\\"\u003eTwitter Web App\u003c\\/a\u003e","truncated":false,"in_reply_to_status_id":null,"in_reply_to_status_id_str":null,"in_reply_to_user_id":null,"in_reply_to_user_id_str":null,"in_reply_to_screen_name":null,"user":{"id":1031582380891332608,"id_str":"1031582380891332608","name":"Twitter Stream","screen_name":"rtoombs44","location":null,"url":"http:\\/\\/rtoombs.com","description":"This is my Twitter development account.","translator_type":"none","protected":false,"verified":false,"followers_count":0,"friends_count":0,"listed_count":0,"favourites_count":0,"statuses_count":5,"created_at":"Mon Aug 20 16:43:00 +0000 2018","utc_offset":null,"time_zone":null,"geo_enabled":false,"lang":null,"contributors_enabled":false,"is_translator":false,"profile_background_color":"F5F8FA","profile_background_image_url":"","profile_background_image_url_https":"","profile_background_tile":false,"profile_link_color":"1DA1F2","profile_sidebar_border_color":"C0DEED","profile_sidebar_fill_color":"DDEEF6","profile_text_color":"333333","profile_use_background_image":true,"profile_image_url":"http:\\/\\/pbs.twimg.com\\/profile_images\\/1168408495294541825\\/bXiFBhDb_normal.jpg","profile_image_url_https":"https:\\/\\/pbs.twimg.com\\/profile_images\\/1168408495294541825\\/bXiFBhDb_normal.jpg","default_profile":true,"default_profile_image":false,"following":null,"follow_request_sent":null,"notifications":null},"geo":null,"coordinates":null,"place":null,"contributors":null,"is_quote_status":false,"quote_count":0,"reply_count":0,"retweet_count":0,"favorite_count":0,"entities":{"hashtags":[],"urls":[],"user_mentions":[],"symbols":[]},"favorited":false,"retweeted":false,"filter_level":"low","lang":"en","timestamp_ms":"1567452130263"}';

    let tst = '{"created_at":"Mon Sep 02 20:14:58 +0000 2019","id":1168618338773360641,"id_str":"1168618338773360641","text":"just a lovely thought - Conor @NBTConor (@NBThieves) and Matt @MattBellamy (@muse) singing a Beatles song from Abby\u2026 https:\\/\\/t.co\\/D57KCIVFzh","source":"\u003ca href=\\"http:\\/\\/twitter.com\\/download\\/iphone\\" rel=\\"nofollow\\"\u003eTwitter for iPhone\u003c\\/a\u003e","truncated":true,"in_reply_to_status_id":null,"in_reply_to_status_id_str":null,"in_reply_to_user_id":null,"in_reply_to_user_id_str":null,"in_reply_to_screen_name":null,"user":{"id":918541186285080577,"id_str":"918541186285080577","name":"Pauline \ud83d\udda4","screen_name":"_Plien","location":"Amsterdam, Nederland","url":null,"description":"\ud83d\udda4 nothing but thieves :: muse :: radiohead :: editors :: snow patrol :: kate bush :: a-ha :: jeff buckley :: bowie :: and more...","translator_type":"none","protected":false,"verified":false,"followers_count":12,"friends_count":36,"listed_count":0,"favourites_count":199,"statuses_count":329,"created_at":"Thu Oct 12 18:17:39 +0000 2017","utc_offset":null,"time_zone":null,"geo_enabled":false,"lang":null,"contributors_enabled":false,"is_translator":false,"profile_background_color":"F5F8FA","profile_background_image_url":"","profile_background_image_url_https":"","profile_background_tile":false,"profile_link_color":"1DA1F2","profile_sidebar_border_color":"C0DEED","profile_sidebar_fill_color":"DDEEF6","profile_text_color":"333333","profile_use_background_image":true,"profile_image_url":"http:\\/\\/pbs.twimg.com\\/profile_images\\/1063378604866842624\\/xT9x1cCI_normal.jpg","profile_image_url_https":"https:\\/\\/pbs.twimg.com\\/profile_images\\/1063378604866842624\\/xT9x1cCI_normal.jpg","profile_banner_url":"https:\\/\\/pbs.twimg.com\\/profile_banners\\/918541186285080577\\/1541928486","default_profile":true,"default_profile_image":false,"following":null,"follow_request_sent":null,"notifications":null},"geo":null,"coordinates":null,"place":null,"contributors":null,"is_quote_status":false,"extended_tweet":{"full_text":"just a lovely thought - Conor @NBTConor (@NBThieves) and Matt @MattBellamy (@muse) singing a Beatles song from Abby Road, because in september the album will be 50 \ud83d\udda4","display_text_range":[0,165],"entities":{"hashtags":[],"urls":[],"user_mentions":[{"screen_name":"NBTConor","name":"Conor Mason","id":322855437,"id_str":"322855437","indices":[30,39]},{"screen_name":"NBThieves","name":"Nothing But Thieves","id":259269984,"id_str":"259269984","indices":[41,51]},{"screen_name":"MattBellamy","name":"Matt Bellamy","id":271310204,"id_str":"271310204","indices":[62,74]},{"screen_name":"muse","name":"muse","id":14583400,"id_str":"14583400","indices":[76,81]}],"symbols":[]}},"quote_count":0,"reply_count":0,"retweet_count":0,"favorite_count":0,"entities":{"hashtags":[],"urls":[{"url":"https:\\/\\/t.co\\/D57KCIVFzh","expanded_url":"https:\\/\\/twitter.com\\/i\\/web\\/status\\/1168618338773360641","display_url":"twitter.com\\/i\\/web\\/status\\/1\u2026","indices":[117,140]}],"user_mentions":[{"screen_name":"NBTConor","name":"Conor Mason","id":322855437,"id_str":"322855437","indices":[30,39]},{"screen_name":"NBThieves","name":"Nothing But Thieves","id":259269984,"id_str":"259269984","indices":[41,51]},{"screen_name":"MattBellamy","name":"Matt Bellamy","id":271310204,"id_str":"271310204","indices":[62,74]},{"screen_name":"muse","name":"muse","id":14583400,"id_str":"14583400","indices":[76,81]}],"symbols":[]},"favorited":false,"retweeted":false,"filter_level":"low","lang":"en","timestamp_ms":"1567455298499"}\n';

    if (test) {
        currentKeyword = 'beatles';
        vm.addTweet(tst);
    } else {
        vm.addTweet(raw);
    }
    console.log(vm.list());
}

function UnselectTweet() {
    $('.tweet-queue-item').each(function (index, element) {
        if ($(this).hasClass("selected")) {
            $(this).removeClass("selected");
        }
    })
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
