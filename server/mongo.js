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
        const collection = obj.db.collection('parsePosts');
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
        collection.find( {} ,{"_id":1,"text":1} ).toArray((err, items) => {
            callback(items);
        });
    },
    getCrawlPostsMessages: (callback) => {
        const collection = obj.db.collection('posts'); 
        collection.find( {} ,{"_id":1,"message":1} ).toArray((err, items) => {
            callback(items);
        });
    },
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
    }
};

//label: pos, neg, neutral

module.exports = obj;