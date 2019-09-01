class Tweet {
    tweet;

    constructor(raw, keyword) {
        try {
            this.tweet = JSON.parse(raw);
            // IF TOP LEVEL TWEET IS EXTENDED
            if (typeof this.tweet.extended_tweet !== 'undefined') {
                this.SetExtendedTweet();
            }
            if (typeof this.tweet.quoted_status !== 'undefined'  && this.tweet.retweeted_status == null) {
                console.log('most');
                this.tweet.retweeted_status = this.tweet.quoted_status;
            } else {
                this.tweet.quoted_status = null;
            }
            if (typeof this.tweet.retweeted_status !== 'undefined'){
                // IF RETWEETED TEXT IS EXTENDED
                if (typeof this.tweet.retweeted_status.extended_tweet !== 'undefined'){
                    this.SetExtendedRetweet();
                }
                this.FormatDate(true);
                this.FormatRetweetDate();
                this.SetRetweetProfileURL();
                this.LocateKeywordRetweet(keyword);
            } else {
                this.FormatDate(false);
                this.tweet.retweeted_status = null;
            }
            this.SetProfileURL();
            this.LocateKeyword(keyword);
        } catch(err) {
            console.log('Parse Error -- Skipping');
            this.tweet = null;
        }
    }

    SetExtendedTweet() {
        this.tweet.text = this.tweet.extended_tweet.full_text;
    }

    SetExtendedRetweet() {
        this.tweet.retweeted_status.text = this.tweet.retweeted_status.extended_tweet.full_text;
    }

    SetProfileURL() {
        this.tweet.user.profile_url = 'https://twitter.com/' + this.tweet.user.screen_name;
    }

    FormatDate(retweet) {
        let dateParse = dateFns.parse(this.tweet.created_at);
        let dateFormat = dateFns.format(dateParse, 'h:mm:ss A');
        if (retweet) {
            this.tweet.formatted_date = ' - Retweeted at: ' + dateFormat;
        } else {
            this.tweet.formatted_date = ' - Created at: ' + dateFormat;
        }
    }

    FormatRetweetDate() {
        let dateParseRetweet = dateFns.parse(this.tweet.retweeted_status.created_at);
        let formatRetweet = dateFns.format(dateParseRetweet, 'h:mm:ss A • MMM D, YYYY');
        this.tweet.retweeted_status.formatted_date = ' - Created at: ' + formatRetweet;
    }

    SetRetweetProfileURL() {
        this.tweet.retweeted_status.user.profile_url = 'https://twitter.com/' + this.tweet.retweeted_status.user.screen_name;
    }

    LocateKeywordRetweet(word) {
        var regexp = new RegExp(word, "gi");
        let string = this.tweet.retweeted_status.text;
        let replace = '<b class="keyword">' + word + '</b>';
        this.tweet.retweeted_status.text = string.replace(regexp, replace);
    }

    LocateKeyword(word) {
        var regexp = new RegExp(word, "gi");
        let string = this.tweet.text;
        let replace = '<b class="keyword">' + word + '</b>';
        this.tweet.text = string.replace(regexp, replace);
    }
}