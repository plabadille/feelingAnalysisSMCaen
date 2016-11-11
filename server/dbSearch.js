const mongo = require('./mongo.js');

const express = require('express');
const router = express.Router();


router.get('/dbSearch', (req, res) => {
    res.end('dbSearch');
});


module.exports = router;