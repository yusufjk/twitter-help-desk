var mongoose = require('mongoose')

var Schema = mongoose.Schema

var bcrypt = require('bcrypt-nodejs')

var users = new Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  status: {
    type: Boolean,
    default: true
  },
  createdDate: {
    type: Number,
    default: Date.now
  }
}, {
  versionKey: false
})

/* methods */
users.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
}

users.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password)
}

/* indexes */
users.index({
    email : 1
},{
    name : 'emailIndex'
})

module.exports = mongoose.model('users', users)
