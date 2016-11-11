const config = require('../config/config.json');
const path = require("path");
const mongo = require('./mongo.js');
const dbGraph = require('./dbGraph.js');
const dbSearch = require('./dbSearch.js');
var Twig = require("twig"),
    express = require('express'),
    app = express();


app.use(express.static(path.join(__dirname,"../client")));
app.set('views', path.join(__dirname, '../client/views/'));
app.use(dbGraph);
app.use(dbSearch);
/*app.get('/', (req, res) => {
	mongo.getParseTweets((tweets) => {
		res.render('indexGraph.twig', {
    		//tweets : tweets
  		});
	});
});*/
app.get('/', (req, res) => {
	mongo.countTweetsFeeling((tweets) => {
		res.render('indexGraph.twig', {
    		tweets : tweets
  		});
	});
});
 
/*app.get('/', function(req, res) {
    res.render('index.twig', {
    	message : "Hello World"
  	});
});*/

mongo.init().then(() => {
	app.listen(3000, () => {
		console.log("Le serveur est en train d'écouter...");
	});
}).catch((err) => {
	console.error(err);
});