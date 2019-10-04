var mongoose = require('mongoose')

var Schema = mongoose.Schema

var bcrypt = require('bcrypt-nodejs')

var twitterAccountDetails = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  status: {
    type: Boolean,
    default: true
  },
  token: {
    type: String
  },
  tokenSecret: {
    type: String
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  updateDate: {
    type: Number
  },
  lastSinceId: {
    type: Number
  },
  id: {
    type: Number
  },
  id_str: {
    type: String
  },
  name: {
    type: String
  },
  screen_name: {
    type: String
  },

  description: {
    type: String
  },
  url: {
    type: String
  },
  // entities: { url: { urls: [Array] }, description: { urls: [] } },
  protected: {
    type: Boolean
  },
  followers_count: {
    type: Number
  },
  friends_count: {
    type: Number
  },
  listed_count: {
    type: Number
  },
  created_at: {
    type: Number
  },
  favourites_count: {
    type: Number
  },
  utc_offset: {
    type: String
  },
  time_zone: {
    type: String
  },
  statuses_count: {
    type: Number
  },
  lang: {
    type: String
  },
  profile_background_color: {
    type: String
  },
  profile_background_image_url: {
    type: String
  },
  profile_background_image_url_https: {
    type: String
  },
  profile_background_tile: {
    type: String
  },
  profile_image_url: {
    type: String
  },
  profile_image_url_https: {
    type: String
  },
  profile_link_color: {
    type: String
  },
  profile_sidebar_border_color: {
    type: String
  },
  profile_sidebar_fill_color: {
    type: String
  },
  profile_text_color: {
    type: String
  },
  profile_use_background_image: {
    type: Boolean
  },
  has_extended_profile: {
    type: Boolean
  },
  default_profile: {
    type: String
  },
  default_profile_image: {
    type: String
  },
  following: {
    type: Boolean
  },
  follow_request_sent: {
    type: Boolean
  },
  notifications: {
    type: Boolean
  },
  translator_type: {
    type: String
  },
  suspended: {
    type: Boolean
  },
  needs_phone_verification: {
    type: Boolean
  }
}, {
  versionKey: false
})

/* indexes */
twitterAccountDetails.index({
  userId: 1
}, {
  name: 'userIndex'
})

twitterAccountDetails.index({
  status : 1
},{
  name: 'statusIndex'
})

module.exports = mongoose.model('twitter-account-details', twitterAccountDetails)
