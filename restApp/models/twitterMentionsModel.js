var mongoose = require('mongoose')

var Schema = mongoose.Schema

var bcrypt = require('bcrypt-nodejs')

var twitterAccountDetails = new Schema({
    twitterId: {
        type: String
    },
    userId: {
        type: Schema.Types.ObjectId
    },
    maintwittweStatusIdStr: {
        type: String
    },
    created_at: {
        type: Number
    },
    id: {
        type: Number
    },
    id_str: {
        type: String
    },
    full_text: {
        type: String
    },
    entities: {
        type: Object
    },
    in_reply_to_status_id: {
        type: Number
    },
    in_reply_to_status_id_str: {
        type: String
    },
    in_reply_to_user_id: {
        type: Number
    },
    in_reply_to_user_id_str: {
        type: String
    },
    in_reply_to_screen_name: {
        type: String
    },
    user: {
        type: Object
    },
    is_quote_status: {
        type: Boolean
    },
    retweet_count: {
        type: Number
    },
    favorite_count: {
        type: Number
    },
    favorited: {
        type: Boolean
    },
    retweeted: {
        type: Boolean
    },
    createdDate: {
        type: Number,
        default: Date.now
    },
    mainMention: {
        type: Boolean,
        default: true
    },
    insertedDate:{
        type: Number
    }
}, {
        versionKey: false
    })

/* indexes */
twitterAccountDetails.index({
    userId: 1,
    created_at: -1,
    in_reply_to_status_id: 1
}, {
        name: 'userAndCreatedAtAndInReplyIndex'
    })

twitterAccountDetails.index({
    maintwittweStatusIdStr: 1
}, {
        name: 'mainTwitterStatusIdIndex'
    })

twitterAccountDetails.index({
    mainMention: 1
}, {
        name: 'mainMentionIndex'
    })

module.exports = mongoose.model('twitter-mentions', twitterAccountDetails)
