const config = require('../config/config.json');
const express = require("express");
const app = express();
const path = require("path");
const mongo = require('./mongo.js');
const dbGraph = require('./dbGraph.js');
const dbSearch = require('./dbSearch.js');



app.use(express.static(path.join(__dirname,"../client")));

app.use(dbGraph);
app.use(dbSearch);
app.get('/data.json', (req, res) => {

	mongo.getTweet((tweets) => {
		console.dir(tweets);
		res.json(tweets);
	});

});

mongo.init().then(() => {
	app.listen(3000, () => {
		console.log("Le serveur est en train d'écouter...");
	});
}).catch((err) => {
	console.error(err);
});