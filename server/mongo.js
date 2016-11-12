const config = require('../config/config.json');
const mongoClient = require('mongodb').MongoClient;

const obj = {
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
    //get full table of db:
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
    getCrawlTweets: (callback) => {
        const collection = obj.db.collection('tweets');
        collection.find().toArray((err, items) => {
            callback(items);
        });
    },
    getCrawlPosts: (callback) => {
        const collection = obj.db.collection('posts');
        collection.find().toArray((err, items) => {
            callback(items);
        });
    },
    //get message (and id):
    getCrawlTweetsMessages: (callback) => {
        const collection = obj.db.collection('tweets'); 
        collection.find( {} ,{"_id":1,"text":1,"created_at":1} ).toArray((err, items) => {
            callback(items);
        });
    },
    getCrawlPostsMessages: (callback) => {
        const collection = obj.db.collection('posts'); 
        collection.find( {} ,{"comments":1} ).toArray((err, items) => {
            callback(items);
        });
    },
    //agregate parse data:
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
    //Request for displaying content:
    //generic fonction for adding feeling to the message:
    addSentimentToComments: (comment, callback) => {
        obj.getParsePosts((sentimentPosts) => {
            console.log(comment);
            sentimentPosts.forEach((sentimentPost) => {
                if (sentimentPost.idComment == comment.id) {
                    callback({
                        id : comment.id,
                        message : comment.message,
                        created_time : comment.created_time,
                        like_count : comment.like_count,
                        feeling : sentimentPost.label
                    });
                    return;
                }
            });
        });
    },
    //displaying content function (all, by date, by word..., by match?)
    retrieveCommentsByDate: (callback) => {
        const date = "2016-10-23";
        const postByDate = [];
        let total = 0;

        obj.getCrawlPostsMessages((posts) => {
            posts.forEach((post) => {
                post.comments.data.forEach((comment, index) => {
                    const dateTmp = comment.created_time.split("T")[0];
                    if (date == dateTmp) {
                        total++;
                        obj.addSentimentToComments(comment, (data) => {
                            postByDate.push(data);
                            if (--total === 0) {
                                callback(postByDate);
                            }
                        });
                    }
                });
            });
        });
    },

    
};
//2016-10-23T15:50:53+0000
// JSON.stringify()
module.exports = obj;