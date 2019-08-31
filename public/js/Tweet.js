class Tweet {
    tweet;
    extendedTweet;

    constructor(raw, keyword) {
        try {
            this.tweet = JSON.parse(raw);
            if (typeof this.tweet.extended_tweet !== 'undefined') {
                this.SetExtendedTweet();
            }
            if (typeof this.tweet.retweeted_status !== 'undefined'){
                this.FormatDate(true);
                this.FormatRetweetDate();
                this.SetRetweetProfileURL();
            } else {
                this.FormatDate(false);
                this.tweet.retweeted_status = null;
            }
            this.SetProfileURL();
        } catch(err) {
            console.log('Parse Error -- Skipping');
            this.tweet = null;
        }
    }

    SetExtendedTweet() {
        this.extendedTweet = true;
        this.tweet.text = this.tweet.extended_tweet.full_text;
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
}