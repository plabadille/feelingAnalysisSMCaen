const mongo = require('./mongo.js');

const express = require('express');
const router = express.Router();


router.get('/dbGraph', (req, res) => {
    mongo.countAllFeelingByMatch((tweets) => {
        res.json(tweets);
    });
});

module.exports = router;