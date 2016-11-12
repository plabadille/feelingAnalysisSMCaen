const config = require('../config/config.json');
const mongoClient = require('mongodb').MongoClient;

//Navigation:
//1- get the connexion to MongoDb
//2- Get the data needed in mongo
//3- Set of data needed for Twitter and Facebook displaying
    //3-1- Generic function called by the function in 3-2
    //3-2- Function returning the set of Data needed client size <---- FUNCTION to launch and get in FRONT 
//4- Agregate parse data: <---- temporary function, will be replace client side later on

const obj = {
    //1-get the connexion to MongoDb
    init: () => {
        return new Promise((resolve, reject) => {
            mongoClient.connect('mongodb://'+config.host+':'+config.port+'/'+config.database, {auth:{authdb:"admin"}}, (err, db) => {
                if (err) {
                    reject(err);
                    return console.dir(err);
                }
                obj.db = db;

                resolve(db);
            });
        });
    },
    //2-Get the data needed in mongo
    getParseTweets: (callback) => {
        const collection = obj.db.collection('parseTweets');
        collection.find().toArray((err, items) => {
            callback(items);
        });
    },
    getParsePosts: (callback) => {
        const collection = obj.db.collection('parseComments');
        collection.find().toArray((err, items) => {
            callback(items);
        });
    },
    // getCrawlTweets: (callback) => {
    //     const collection = obj.db.collection('tweets');
    //     collection.find().toArray((err, items) => {
    //         callback(items);
    //     });
    // },
    // getCrawlPosts: (callback) => {
    //     const collection = obj.db.collection('posts');
    //     collection.find().toArray((err, items) => {
    //         callback(items);
    //     });
    // },
    //get message (and id):
    getCrawlTweetsMessages: (callback) => {
        const collection = obj.db.collection('tweets'); 

        collection.find( {} ,{"id":1,"text":1,"created_at":1} ).toArray((err, items) => {
            callback(items);
        });
    },
    getCrawlPostsMessages: (callback) => {
        const collection = obj.db.collection('posts'); 

        collection.find( {} ,{"comments":1} ).toArray((err, items) => {
            callback(items);
        });
    },
    //3-Set of data needed for Twitter and Facebook displaying:
    //3-1- Generic function called by the function in 3-2 (use to add the sentiment):
    addSentimentToComments: (comment, callback) => {
        let called = false;

        obj.getParsePosts((sentimentPosts) => {
            sentimentPosts.forEach((sentimentPost) => {
                if (sentimentPost.idComment == comment.id) {
                    callback({
                        id : comment.id,
                        message : comment.message,
                        created_time : comment.created_time,
                        like_count : comment.like_count,
                        feeling : sentimentPost.label
                    });
                    called = true;
                    return;
                }
            });
            if (!called){
                callback();
            }    
        });
    },
    addSentimentToTweets: (tweet, callback) => {
        let called = false;

        obj.getParseTweets((sentimentTweets) => {
            sentimentTweets.forEach((sentimentTweet) => {
                if (sentimentTweet.idTweet == tweet.id) {
                    callback({
                        id : tweet.id,
                        text : tweet.text,
                        created_at : tweet.created_at,
                        feeling : sentimentTweet.label
                    });
                    called = true;
                    return;
                }
            });
            if (!called){
                callback();
            } 
        });
    },
    //3-2- function returning the set of Data needed client size:
    retrieveTweetsWithSentiment: (callback) => {
        const tweetsWithSentiment = [];
        let total = 0;

        obj.getCrawlTweetsMessages((tweets) => {
            tweets.forEach((tweet) => {
                total++;
                obj.addSentimentToTweets(tweet, (data) => {
                    if (data != undefined) {
                        tweetsWithSentiment.push(data);
                    } else { //no match
                        console.log(tweet);
                    }

                    if (--total === 0) {
                        callback(tweetsWithSentiment);
                    }
                });
            });
        });
    },
    retrieveCommentsWithSentiment: (callback) => {
        const postsWithSentiment = [];
        let total = 0;

        obj.getCrawlPostsMessages((posts) => {
            posts.forEach((post) => {
                post.comments.data.forEach((comment, index) => {
                    total++;
                    obj.addSentimentToComments(comment, (data) => {
                        if (data != undefined) {
                            postsWithSentiment.push(data);
                        } else { //no match
                            console.log(comment);
                        }

                        if (--total === 0) {
                            callback(postsWithSentiment);
                        }
                    });
                });
            });
        });
    },
    //4-agregate parse data: <---- temporary function, will be replace client side
    countTweetsFeeling: (callback) => {
        const feeling = {
            pos : 0,
            neg : 0,
            neutral : 0
        };
        obj.getParseTweets((tweets) => {
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
        obj.getParsePosts((posts) => {
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
    },
    //displaying content message function:
    //generic function to add the feeling:
    
    
    // retrieveCommentsByDate: (callback) => {
    //     const date = "2016-10-23";
    //     const postByDate = [];
    //     let total = 0;

    //     obj.getCrawlPostsMessages((posts) => {
    //         posts.forEach((post) => {
    //             post.comments.data.forEach((comment, index) => {
    //                 const dateTmp = comment.created_time.split("T")[0];
    //                 if (date == dateTmp) {
    //                     total++;

    //                     obj.addSentimentToComments(comment, (data) => {
    //                         if (data != undefined) {
    //                             postByDate.push(data);
    //                         } else {
    //                             console.log(comment);
    //                         }

    //                         if (--total === 0) {
    //                             callback(postByDate);
    //                         }
    //                     });
    //                 }
    //             });
    //         });
    //     });
    // },
};

module.exports = obj;