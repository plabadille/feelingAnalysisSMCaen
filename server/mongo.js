const config = require('../config/config.json');
const mongoClient = require('mongodb').MongoClient;

//------------------------------------
//navigation
//------------------------------------
//1- Global function (module.exports)
    //1-1- connexion to MongoDb
    //1-2- tweets associated with sentiment
    //1-3- posts associated with sentiment
    //1-4- agregate parse data: <---- temporary function, will be replace client side later on
//2- Private function needed by 1-
//------------------------------------

//------------------------------------
//1- Global function (module.exports)
//------------------------------------
const matchDates = {
    SMC_ASSE : ['2016-10-22', '2016-10-23', '2016-10-24'],
    ASNL_SMC : ['2016-10-25', '2016-10-26', '2016-10-27'],
    ASNL_SMC2 : ['2016-10-28', '2016-10-29', '2016-10-30'],
    SMC_OGN : ['2016-11-05', '2016-11-06', '2016-11-07']
};

const public = {
    //1-1- connexion to MongoDb:
    //------------------------------------
    init: () => {
        return new Promise((resolve, reject) => {
            mongoClient.connect('mongodb://'+config.host+':'+config.port+'/'+config.database, {auth:{authdb:"admin"}}, (err, db) => {
                if (err) {
                    reject(err);
                    return console.dir(err);
                }
                public.db = db;

                resolve(db);
            });
        });
    },
    //1-2- tweets associated with sentiment:
    //------------------------------------
    retrieveTweetsWithSentiment: (callback) => {
        const tweetsWithSentiment = [];

        privates.getCrawlTweetsMessages((tweets) => {
            privates.getParseTweets((sentimentTweets) => {
                tweets.forEach((tweet) => {
                    let tweetToReturn = {
                        id : null,
                        message : null,
                        created_time : null,
                        feeling : null,
                        match : null
                    }
                    for (let i = 0; i < sentimentTweets.length; i++) {
                        if (sentimentTweets[i].idTweet == tweet.id_str) {
                            tweetToReturn["id"] = tweet.id_str;
                            tweetToReturn["message"] = tweet.text;
                            tweetToReturn["created_time"] = tweet.created_at;
                            tweetToReturn["feeling"] = sentimentTweets[i].label;
                            break;
                        }
                    }
                    for (let match in matchDates) {
                        matchDates[match].forEach((date, index) => {
                            //boucle twitter:
                            let explodeDate = tweet.created_at.split(" ");
                            if (explodeDate[1] == "Oct") {
                                var month = "10";
                            } else { // explode == Nov <-- valable uniquement pour notre bd. transformer en switch sinon
                                var month = "11";
                            }
                            let dateTmp = explodeDate[5] + "-" + month + "-" + explodeDate[2];
                            if (date == dateTmp) {
                                tweetToReturn["match"] = match;
                            }
                        });
                    }
                    if (tweetToReturn["feeling"] != null && tweetToReturn["match"] != null) { //solve async issue
                        tweetsWithSentiment.push(tweetToReturn);
                    }

                });
                callback(tweetsWithSentiment);
            });
        });
    },
    //1-3- posts associated with sentiment:
    //------------------------------------
    retrieveCommentsWithSentiment: (callback) => {
        const postsWithSentiment = [];

        privates.getCrawlPostsMessages((posts) => {
            privates.getParsePosts((sentimentPosts) => {
                posts.forEach((post) => {
                    post.comments.data.forEach((comment) => {
                        let commentToReturn = {
                            id : null,
                            message : null,
                            created_time : null,
                            like_count : null,
                            feeling : null,
                            match : null
                        }
                        commentToReturn["id"] = comment.id;
                        commentToReturn["message"] = comment.message;
                        commentToReturn["created_time"] = comment.created_time;
                        commentToReturn["like_count"] = comment.like_count;
                        for (let i = 0; i < sentimentPosts.length; i++) {
                            if (sentimentPosts[i].idComment == comment.id) {
                                commentToReturn["feeling"] = sentimentPosts[i].label;
                                break;
                            }
                        }
                        for (let match in matchDates) {
                            matchDates[match].forEach((date, index) => {
                                //boucle twitter:
                                let dateTmp = comment.created_time.split("T")[0];
                                if (date == dateTmp) {
                                    commentToReturn["match"] = match;
                                }
                            });
                        }
                        if (commentToReturn["feeling"] != null && commentToReturn["match"] != null) {//solve async issue
                            postsWithSentiment.push(commentToReturn);
                        }  
                    });
                });
                callback(postsWithSentiment);
            });
        });
    },
    //4-agregate parse date by date:
    countAllFeelingByMatch: (callback) => {
        const feelings = {
            SMC_ASSE : {
                facebook : {
                    pos : 0,
                    neg : 0,
                    neutral : 0
                },
                twitter : {
                    pos : 0,
                    neg : 0,
                    neutral : 0
                } 
            },
            ASNL_SMC : {
                facebook : {
                    pos : 0,
                    neg : 0,
                    neutral : 0
                },
                twitter : {
                    pos : 0,
                    neg : 0,
                    neutral : 0
                } 
            },
            ASNL_SMC2 : {
                facebook : {
                    pos : 0,
                    neg : 0,
                    neutral : 0
                },
                twitter : {
                    pos : 0,
                    neg : 0,
                    neutral : 0
                } 
            },
            SMC_OGN : {
                facebook : {
                    pos : 0,
                    neg : 0,
                    neutral : 0
                },
                twitter : {
                    pos : 0,
                    neg : 0,
                    neutral : 0
                } 
            },
            ALL : {
               facebook : {
                    pos : 0,
                    neg : 0,
                    neutral : 0
                },
                twitter : {
                    pos : 0,
                    neg : 0,
                    neutral : 0
                } 
            }
        };

        public.retrieveCommentsWithSentiment((comments) => {
            public.retrieveTweetsWithSentiment((tweets) => {
                tweets.forEach((tweet) => {
                    switch (tweet.feeling) {
                        case "pos":
                            feelings[tweet.match].twitter.pos ++;
                            feelings.ALL.twitter.pos ++;
                            break;
                        case "neg":
                            feelings[tweet.match].twitter.neg ++;
                            feelings.ALL.twitter.neg ++;
                            break;
                        case "neutral":
                            feelings[tweet.match].twitter.neutral ++;
                            feelings.ALL.twitter.neutral ++;
                            break;
                    }
                });
                //boucle facebook:
                comments.forEach((comment) => {
                    switch (comment.feeling) {
                        case "pos":
                            feelings[comment.match].facebook.pos ++;
                            feelings.ALL.facebook.pos ++;
                            break;
                        case "neg":
                            feelings[comment.match].facebook.neg ++;
                            feelings.ALL.facebook.neg ++;
                            break;
                        case "neutral":
                            feelings[comment.match].facebook.neutral ++;
                            feelings.ALL.facebook.neutral ++;
                            break;
                    }
                });
                callback(feelings);
            });
        });
    }
};

module.exports = public;
//------------------------------------


//------------------------------------
//2- Privates functions (needed by 1-)
//------------------------------------
const privates = {
    getParseTweets: (callback) => {
        const collection = public.db.collection('parseTweets');
        collection.find().toArray((err, items) => {
            callback(items);
        });
    },
    getParsePosts: (callback) => {
        const collection = public.db.collection('parseComments');
        collection.find().toArray((err, items) => {
            callback(items);
        });
    },
    getCrawlTweetsMessages: (callback) => {
        const collection = public.db.collection('tweets'); 

        collection.find( {} ,{"id_str":1,"text":1,"created_at":1} ).toArray((err, items) => {
            callback(items);
        });
    },
    getCrawlPostsMessages: (callback) => {
        const collection = public.db.collection('posts'); 

        collection.find( {} ,{"comments":1} ).toArray((err, items) => {
            callback(items);
        });
    }
};