const mongo = require('./mongo.js');

const express = require('express');
const router = express.Router();


router.get('/dbGraph', (req, res) => {
    mongo.retrieveCommentsByDate((tweets) => {
        res.json(tweets);
    });
});

module.exports = router;