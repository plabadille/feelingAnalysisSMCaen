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
    getTweet: (callback) => {
        const collection = obj.db.collection('parseTweets');
        collection.find().toArray((err, items) => {
            callback(items);
        });
    }
};

module.exports = obj;