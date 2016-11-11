const config = require('../config/config.json');
const express = require("express");
const path = require("path");
const mongoClient = require('mongodb').MongoClient;
const app = express();

app.use(express.static(path.join(__dirname,"../client")));

app.get('/data.json', (req, res) => {
mongoClient.connect('mongodb://'+config.host+':'+config.port+'/'+config.database, {auth:{authdb:"admin"}}, function (err, db) {
		if (err) {
			return console.dir(err);
		}

		const collection = db.collection('parseTweets');
		/*collection.find({"label":"pos"}).toArray((err, items) => {
			res.json(items);
			db.close();
		});
		collection.find({"label":"pos"}).count((err, items) => {
			res.json(items);
			db.close();
		});*/
		collection.find({"label":"neg"}).count((err, items) => {
			res.json(items);
			db.close();
		});
	});
})

app.listen(3000, () => {
	console.log("Le serveur est en train d'écouter...");
});
