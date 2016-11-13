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

                        if (sentimentTweets[i].idTweet == tweet.id) {
                            tweetsWithSentiment.push({
                                id : tweet.id,
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
    //4-agregate parse data: <---- temporary function, will be replace client side
    //------------------------------------
    countTweetsFeeling: (callback) => {
        const feeling = {
            pos : 0,
            neg : 0,
            neutral : 0
        };
        privates.getParseTweets((tweets) => {
            tweets.forEach((tweet) => {
                switch (tweet.label){
                    case "pos":
                        feeling.pos ++;
                        break;
                    case "neg":
                        feeling.neg ++;
                        break;
                    case "neutral":
                        feeling.neutral ++;
                        break;
                }
            });
            callback(feeling);
        });
    },
    countPostsFeeling: (callback) => {
        const feeling = {
            pos : 0,
            neg : 0,
            neutral : 0
        };
        privates.getParsePosts((posts) => {
            posts.forEach((post) => {
                switch (post.label){
                    case "pos":
                        feeling.pos ++;
                        break;
                    case "neg":
                        feeling.neg ++;
                        break;
                    case "neutral":
                        feeling.neutral ++;
                        break;
                }
            });
            callback(feeling);
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

        collection.find( {} ,{"id":1,"text":1,"created_at":1} ).toArray((err, items) => {
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