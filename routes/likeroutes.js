const express = require('express')
const router = express.Router();
const like = require("../controller/like");



router.get('/likes-bus',like.likebuses);

module.exports =router;
