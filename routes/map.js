const express = require('express')
const router = express.Router();
const map = require('../controller/map');

router.get('/map',map.map);

module.exports =router; 