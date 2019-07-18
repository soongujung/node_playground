const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next){
    res.render('./demo/index', {greeting: '안녕? 세상!!!'});
});

module.exports = router;