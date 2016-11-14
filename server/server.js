const config = require('../config/config.json');
const path = require("path");
const mongo = require('./mongo.js');
var Twig = require("twig"),
    express = require('express'),
    app = express();


app.use(express.static(path.join(__dirname,"../client")));
app.set('views', path.join(__dirname, '../client/views/'));

app.get('/', (req, res) => {
    mongo.retrieveTweetsWithSentiment((tweets) => {
        mongo.retrieveCommentsWithSentiment((comments) => {
            mongo.countAllFeelingByMatch((feelings) => {
                res.render('index.twig', {
                    feelings : feelings,
                    tweets : tweets,
                    comments : comments
                });
            });
        });
    });
});
app.get('/graph', (req, res) => {
    mongo.retrieveTweetsWithSentiment((tweets) => {
        mongo.retrieveCommentsWithSentiment((comments) => {
            mongo.countAllFeelingByMatch((feelings) => {
                res.render('graph.twig', {
                    feelings : feelings,
                    tweets : tweets,
                    comments : comments
                });
            });
        });
    });
});
 
mongo.init().then(() => {
	app.listen(3000, () => {
		console.log("Le serveur est en train d'écouter...");
	});
}).catch((err) => {
	console.error(err);
});