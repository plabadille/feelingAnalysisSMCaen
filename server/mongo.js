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
                    for (var i = 0; i < sentimentTweets.length; i++) {
                        if (sentimentTweets[i].idTweet == tweet.id_str) {
                            tweetsWithSentiment.push({
                                id : tweet.id_str,
                                message : tweet.text,
                                created_time : tweet.created_at,
                                feeling : sentimentTweets[i].label
                            });
                            break;
                        }
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
                    post.comments.data.forEach((comment, index) => {
                        sentimentPosts.forEach((sentimentPost) => {
                            if (sentimentPost.idComment == comment.id) {
                                postsWithSentiment.push({
                                    id : comment.id,
                                    message : comment.message,
                                    created_time : comment.created_time,
                                    like_count : comment.like_count,
                                    feeling : sentimentPost.label
                                });
                            }
                        });
                    });
                });
                callback(postsWithSentiment);
            });
        });
    },
    //4-agregate parse date by date:
    countAllFeelingByMatch: (callback) => {
        const feelings = {
            MHSC_SMC : {
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
            ASSE_SMC : {
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

        var matchDates = {
            MHSC_SMC : ['2016-10-14', '2016-10-15', '2016-10-16'],
            SMC_ASSE : ['2016-10-22', '2016-10-23', '2016-10-24'],
            ASSE_SMC : ['2016-10-25', '2016-10-26', '2016-10-27'],
            ASNL_SMC : ['2016-10-28', '2016-10-29', '2016-10-30'],
            SMC_OGN : ['2016-11-05', '2016-11-06', '2016-11-07']
        };

        public.retrieveCommentsWithSentiment((comments) => {
            public.retrieveTweetsWithSentiment((tweets) => {
                for (var match in matchDates) {
                    matchDates[match].forEach((date, index) => {
                        //boucle twitter:
                        tweets.forEach((tweet) => {
                            let explodeDate = tweet.created_time.split(" ");
                            if (explodeDate[1] == "Oct") {
                                var month = "10";
                            } else { // explode == Nov <-- valable uniquement pour notre bd. transformer en switch sinon
                                var month = "10";
                            }
                            //Sun Oct 30 12:50:40 +0000 2016 (exemple format date twitter)
                            let dateTmp = explodeDate[5] + "-" + month + "-" + explodeDate[2];

                            if (date == dateTmp) {
                                switch (tweet.feeling) {
                                        case "pos":
                                            feelings[match].twitter.pos ++;
                                            feelings.ALL.twitter.pos ++;
                                            break;
                                        case "neg":
                                            feelings[match].twitter.neg ++;
                                            feelings.ALL.twitter.neg ++;
                                            break;
                                        case "neutral":
                                            feelings[match].twitter.neutral ++;
                                            feelings.ALL.twitter.neutral ++;
                                            break;
                                }
                            }
                        });
                        //boucle facebook:
                        comments.forEach((comment) => {
                            let dateTmp = comment.created_time.split("T")[0];
                            if (date == dateTmp) {
                                switch (comment.feeling) {
                                    case "pos":
                                        feelings[match].facebook.pos ++;
                                        feelings.ALL.facebook.pos ++;
                                        break;
                                    case "neg":
                                        feelings[match].facebook.neg ++;
                                        feelings.ALL.facebook.neg ++;
                                        break;
                                    case "neutral":
                                        feelings[match].facebook.neutral ++;
                                        feelings.ALL.facebook.neutral ++;
                                        break;
                                }
                            }
                        });
                    });
                }
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