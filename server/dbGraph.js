const mongo = require('./mongo.js');

const express = require('express');
const router = express.Router();


router.get('/dbGraph', (req, res) => {
    res.end('dbGraph');
});


module.exports = router;