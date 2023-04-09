const validation = require('../src/mongodb')
const bcrypt = require('bcrypt')
const multer  = require('multer')
const upload = multer({ dest: '' })

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/images/profile/")
    },
    filename: function (req, file, cb) {
       return cb(null,`${Date.now()}-${file.originalname}`)
    },
  })

  module.exports = storage;