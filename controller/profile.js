const validation = require('../src/mongodb')
const bcrypt = require('bcrypt')
const multer  = require('multer')
const upload = multer({ dest: '' })

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/")
    },
    filename: function (req, file, cb) {
       return cb(null,file.originalname)
    },
  })

  module.exports = storage;