const mongo = require('./mongo.js');

const express = require('express');
const router = express.Router();


router.get('/dbSearch', (req, res) => {
    
    mongo.countTweetsFeeling((posts) => {
        console.dir(posts);
        res.json(posts);
    });

});

module.exports = router;