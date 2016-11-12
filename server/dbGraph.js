const mongo = require('./mongo.js');

const express = require('express');
const router = express.Router();


router.get('/dbGraph', (req, res) => {
    mongo.retrieveTweetsWithSentiment((tweets) => {
        res.json(tweets);
    });
});

module.exports = router;