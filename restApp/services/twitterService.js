'use strict'

/* 
    Twitter service include twitter related functions 
*/

/* requiring models */
const TwitterTokenDetailsModel = require('../models/twitterTokenDetailsModel')
const TwitterMentionsModel = require('../models/twitterMentionsModel')

/* requring utilites */
const CommonUtilities = require('../utilities/commonUtilities')

/* importing third party modules */
const mongoose = require('mongoose')
const twitter = require('twitter')
const config = require('config')
const crypto = require('crypto')
const request = require('request')
const oauth_nonce = require('oauth_nonce');
const async = require('async')

var TwitterService = module.exports
var OAuth = require('oauth').OAuth;
var twitterBearerToken

var streamData = {}

var oa = new OAuth(
  "https://api.twitter.com/oauth/request_token",
  "https://api.twitter.com/oauth/access_token",
  config.twitter.consumerKey,
  config.twitter.consumerSecret,
  "1.0",
  "https://rich-panel-task.herokuapp.com/auth/twitter/callback2",
  "HMAC-SHA1"
);

/* update main mention 2 */
TwitterService.updateMainMention2 = function () {
  TwitterMentionsModel.find().then((fullData) => {
    async.forEachSeries(fullData, function (ele, cb) {
      let mainMention = false
      console.log(ele.id_str, ele.maintwittweStatusIdStr)
      if (ele.in_reply_to_status_id_str == "") {
        if (ele.id_str === ele.maintwittweStatusIdStr) {
          mainMention = true
        } else {
          mainMention = false
        }
      } else {
        mainMention = false
      }

      TwitterMentionsModel.findOneAndUpdate({
        _id: ele._id
      }, {
          $set: {
            mainMention: mainMention
          }
        }, function (error, data) {
          if (error) {
            console.log('erro ', error)
          } else {
            console.log('success', ele._id, ele.in_reply_to_status_id_str, data.mainMention)
          }
          cb()
        })
    })
  })

}

/* update Twitter main mention field */
/* for old data */
TwitterService.updateMainMention = function () {
  /* update all mentions with mainMention false */
  TwitterMentionsModel.update({}, {
    $set: {
      mainMention: false
    }
  }, {
      multi: true
    }, function (allUpdateError, allUpdateData) {
      if (allUpdateError) {
        console.log('%%%all update error')
      } else {
        console.log('wait for previous update')
        setTimeout(function () {
          console.log('update success *********** ')
          /* update all data */
          let findQuery = {
            $where: "this.id_str === this.maintwittweStatusIdStr"
          }

          /* update query */
          let updateQuery = {
            $set: {
              mainMention: true
            }
          }

          /* update all documents */
          TwitterMentionsModel.update(findQuery, updateQuery, {
            multi: true
          }, function (error, data) {
            if (error) {
              console.log('%%%%%%% documents update faied')
            } else {
              console.log('%%%%%%% documents update success', data && data[0])
            }
          })
        }, 10000)
      }
    })
}


/* twitter stream */
TwitterService.streaming = function (userId, screenName, token, tokenSecret) {
  console.log('checking stream')
  if (streamData.userId) {
    console.log('returned from stream')
    return
  }
  console.log('in stream')
  stream[userId] = true

  let client = TwitterService.buildTwitterConfig(token, tokenSecret)
  var stream = client.stream('statuses/filter', {
    track: screenName
  })

  stream.on('data', function (event) {
    console.log('$event ', event);
    TwitterService.insertMentionsIntoDatabase(userId, event, null, function () {

    })
  });

  stream.on('disconnection', function (event) {
    streamData[userId] = false
  })
}

/* display twitter mentions */
TwitterService.displayTwitterMentions = function (apiRequest, apiResponse) {
  console.log('in display twitter mentions')
  /* getting user id */
  let userId = apiRequest.user._id ? apiRequest.user._id : null
  let page = apiRequest.query.page ? apiRequest.query.page : 1
  let limit = config.displayTwitterMentionsLimit ? config.displayTwitterMentionsLimit : 10

  /* get getByUserId */
  let getByStatusString
  if (apiRequest.query.getByStatusString) {
    getByStatusString = apiRequest.query.getByStatusString
  }

  console.log('user data ', userId, page, limit)

  /* checking required fields */
  if (!userId) {
    return apiResponse.status(422).send({
      statusCode: 'INVALID-TOKEN',
      message: 'invalid user. Please login again',
      data: {}
    })
  }

  /* preparing query */
  let query = {
    userId: mongoose.Types.ObjectId(userId)
  }

  // console.log('query ', query)

  /* getting twitter token details into database */
  TwitterTokenDetailsModel.findOne(query, function (error, data) {
    if (error) {
      return apiResponse.status(500).send({
        statusCode: 'INTERNAL-SERVER-ERROR',
        message: 'Internal server error occured. Please try again after some time.',
        data: {}
      })
    }

    if (!data) {
      return apiResponse.status(201).send({
        statusCode: 'SUCCESS',
        message: 'No twitter accounts found.',
        data: {}
      })
    }

    if (data.status === false) {
      return apiResponse.status(202).send({
        statusCode: 'TWITTER-TOKEN-ERROR',
        message: 'Twitter tokesn was expired. Please login',
        data: {}
      })
    }

    /* checking stream */
    /* exceeding for user */
    if (data.screen_name) {
      // TwitterService.streaming(userId, data.screen_name, data.token, data.tokenSecret)
    }

    /* adjusting query */
    if (getByStatusString) {
      query = {
        maintwittweStatusIdStr: getByStatusString
      }
    } else {
      query.in_reply_to_status_id = 0
      // query.mainMention = true

    }

    /* getting mentions */
    TwitterService.getTwitterMentsionsFromDatabase(query, {}, page, limit, function (mentionsGettingError, mentionsGettingMessage, mentionsGettingData) {
      console.log('mentions Getting message ', mentionsGettingMessage)
      if (mentionsGettingError) {
        return apiResponse.status(500).send({
          statusCode: 'INTERNAL-SERVER-ERROR',
          message: 'Internal server error occured. Please try again after some time.',
          data: {}
        })
      }

      /* getting twitter mentions count */
      TwitterService.getTwitterMentsionsCountFromDatabase(query, function (mentionsCountGettingError, mentionsCountGettingMessage, mentionsCountGettingData) {
        console.log('mentions count Getting message ', mentionsCountGettingMessage)
        if (mentionsCountGettingError) {
          return apiResponse.status(500).send({
            statusCode: 'INTERNAL-SERVER-ERROR',
            message: 'Internal server error occured. Please try again after some time.',
            data: {}
          })
        }

        if (getByStatusString) {

          /* prepare return data */
          let returnData = {
            mentions: mentionsGettingData,
            count: mentionsCountGettingData,
            user: {
              profile_image_url_https: data.profile_image_url_https,
              screen_name: data.screen_name
            }
          }

          return apiResponse.status(200).send({
            statusCode: 'SUCCESS',
            message: 'Successfully getted mentions.',
            data: returnData
          })
        }

        let newData = []
        if (mentionsGettingData && mentionsGettingData.length) {
          let nData = JSON.parse(JSON.stringify(mentionsGettingData))

          nData.forEach((ele) => {
            if (ele.maintwittweStatusIdStr === ele.id_str) {
              newData.push(ele)
            }
          })
        }

        /* prepare return data */
        let returnData = {
          mentions: newData,
          count: mentionsCountGettingData,
          user: {
            profile_image_url_https: data.profile_image_url_https,
            screen_name: data.screen_name
          }
        }

        return apiResponse.status(200).send({
          statusCode: 'SUCCESS',
          message: 'Successfully getted mentions.',
          data: returnData
        })

      })
    })

  })
}

/* getting twitter mentions by query and page*/
TwitterService.getTwitterMentsionsFromDatabase = function (query, projectFields, page, limit, callback) {
  /* adjusting parameters */
  projectFields = projectFields ? projectFields : {}

  /* calculating skip */
  let skip = (page - 1) * limit

  /* preparing sort filter */
  let sortFilter = {
    created_at: -1
  }

  if (query.maintwittweStatusIdStr) {
    sortFilter = {
      created_at: 1
    }
  }

  TwitterMentionsModel.find(query, projectFields).sort(sortFilter).exec(function (error, data) {
    if (error) {
      return callback(error, {})
    } else {
      return callback(null, 'Sucesssfully get data', data)
    }
  })
}

/* getting count of twitter mentions */
TwitterService.getTwitterMentsionsCountFromDatabase = function (query, callback) {
  TwitterMentionsModel.count(query, function (error, data) {
    if (error) {
      console.log('count error ', error)
      return callback(error, 'Error while getting twitter mentions count', {})
    } else {
      return callback(null, 'Sucecssfully get twitter mentions count', {
        count: data
      })
    }
  })
}

TwitterService.getMentionsFromTwitterForSocket = function (userId, callback) {
  /* preparing query */
  let query = {
    userId: mongoose.Types.ObjectId(userId)
  }

  /* getting twitter token details into database */
  TwitterTokenDetailsModel.findOne(query, function (error, data) {
    if (error) {
      return callback({
        statusCode: 'INTERNAL-SERVER-ERROR',
        message: 'Internal server error occured. Please try again after some time.',
        data: {}
      })
    }

    if (!data) {
      return callback({
        statusCode: 'SUCCESS',
        message: 'No twitter accounts found',
        data: {}
      })
    }

    let token = data.token
    let tokenSecret = data.tokenSecret

    /* checking token validation */
    TwitterService.validatingTwitterTokens(token, tokenSecret, function (validatingError, validatingErrorCode, validatedmessage, validatedTokenData) {
      if (validatingError) {
        if (validatingErrorCode.code === 89) {
          /* setting status to false */
          data.status = false
          console.log('error 1')
          /* insert into database as invalid tokens.. need to re login*/
          // data.save({ userId: userId }, { $set: { status: false } }, function (twitterTokenInsertError, twitterInsertData) {
          return data.save(function (twitterTokenInsertError, twitterInsertData) {
            console.log('error 2', twitterTokenInsertError)

            return callback({
              statusCode: 'TWITTER-TOKEN-ERROR',
              message: 'Twitter tokesn was expired. Please login',
              data: twitterInsertData
            })
          })
        } else {
          return callback({
            statusCode: 'TWITTER-ERROR',
            message: 'Error while checking data in twitter. Please try again.',
            data: {}
          })
        }
      }

      /* adjusting parameters for getting mentions*/
      let parameters = {
        tweet_mode: 'extended',
        count: 200
      }

      /* adding since_id */
      if (data.lastSinceId) {
        parameters.since_id = data.lastSinceId
      }

      console.log('parameters ', parameters)

      /* building twitter config */
      let client = TwitterService.buildTwitterConfig(token, tokenSecret)

      /* getting mentions */
      client.get('statuses/mentions_timeline', parameters, function (error, mentionsData) {
        if (error) {
          return callback({
            statusCode: 'TWITTER-ERROR',
            message: 'Error while checking data in twitter. Please try again.',
            data: {}
          })
        }

        if(!mentionsData || mentionsData.length === 0){
          console.log('no mentions found ', mentionsData)
          return callback({
            statusCode: 'SUCCESS',
            message: 'Sucessfully get mentions',
            data: []
          })
        }

        console.log('twitter before text length ', mentionsData.length)
        mentionsData.forEach((ele) => {
          console.log(ele.full_text)
        })

        /* inserting into database */
        TwitterService.insertMentionsIntoDatabase(data.userId, mentionsData, null, function (mentionsInsertError, mentionsInsertMessage, mentionsInsertiData) {
          console.log('--> mentiones data length', mentionsData.length, mentionsInsertiData.length)

          console.log('twitter after text text ')
          mentionsData.forEach((ele) => {
            console.log(ele.full_text)
          })

          if (mentionsData.length > 0) {
            /* insert last sinceId */

            data.lastSinceId = mentionsData[mentionsData.length - 1].id
            console.log('last since id ', data.lastSinceId)
            console.log('last since id2 ', mentionsData[0].id)

            data.save(function (dataSaveError, dataSaveData) {

              console.log("all done", dataSaveError)
              return callback({
                statusCode: 'SUCCESS',
                message: 'Sucessfully get mentions',
                data: mentionsInsertiData
              })
            })
          }
        })
      })
      /* end of getting mentions */
    })
    /* end of twitter token checking */
  })
}

/* fetch mentions from twitter api service */
TwitterService.getMentionsFromTwitter = function (apiRequest, apiResponse) {
  /* getting user id */
  let userId = apiRequest.user._id ? apiRequest.user._id : null

  /* checking required fields */
  if (!userId) {
    return apiResponse.status(422).send({
      statusCode: 'INVALID-TOKEN',
      message: 'invalid user. Please login again',
      data: {}
    })
  }

  /* preparing query */
  let query = {
    userId: mongoose.Types.ObjectId(userId)
  }

  /* getting twitter token details into database */
  TwitterTokenDetailsModel.findOne(query, function (error, data) {
    if (error) {
      return apiResponse.status(500).send({
        statusCode: 'INTERNAL-SERVER-ERROR',
        message: 'Internal server error occured. Please try again after some time.',
        data: {}
      })
    }

    if (!data) {
      return apiResponse.status(200).send({
        statusCode: 'SUCCESS',
        message: 'No twitter accounts found',
        data: {}
      })
    }

    let token = data.token
    let tokenSecret = data.tokenSecret

    /* checking token validation */
    TwitterService.validatingTwitterTokens(token, tokenSecret, function (validatingError, validatingErrorCode, validatedmessage, validatedTokenData) {
      if (validatingError) {
        if (validatingErrorCode.code === 89) {
          /* setting status to false */
          data.status = false
          console.log('error 1')
          /* insert into database as invalid tokens.. need to re login*/
          // data.save({ userId: userId }, { $set: { status: false } }, function (twitterTokenInsertError, twitterInsertData) {
          return data.save(function (twitterTokenInsertError, twitterInsertData) {
            console.log('error 2', twitterTokenInsertError)
            return apiResponse.status(400).send({
              statusCode: 'TWITTER-TOKEN-ERROR',
              message: 'Twitter tokesn was expired. Please login',
              data: {}
            })
          })
        } else {
          return apiResponse.status(400).send({
            statusCode: 'TWITTER-ERROR',
            message: 'Error while checking data in twitter. Please try again.',
            data: {}
          })
        }
      }

      /* adjusting parameters for getting mentions*/
      let parameters = {
        tweet_mode: 'extended',
        count: 200
      }

      /* adding since_id */
      if (data.lastSinceId) {
        parameters.since_id = data.lastSinceId
      }

      /* building twitter config */
      let client = TwitterService.buildTwitterConfig(token, tokenSecret)

      /* getting mentions */
      client.get('statuses/mentions_timeline', parameters, function (error, mentionsData) {
        if (error) {
          return apiResponse.status(400).send({
            statusCode: 'TWITTER-ERROR',
            message: 'Error while checking data in twitter. Please try again.',
            data: {}
          })
        }

        /* inserting into database */
        TwitterService.insertMentionsIntoDatabase(data.userId, mentionsData, null, function (mentionsInsertError, mentionsInsertMessage, mentionsInsertiData) {
          if (mentionsData.length > 0) {
            /* insert last sinceId */
            data.lastSinceId = mentionsData[0].id

            data.save(function (dataSaveError, dataSaveData) {
              console.log("all done", dataSaveError)
            })
          }
        })

        return apiResponse.status(200).send({
          statusCode: 'SUCCESS',
          message: 'Sucessfully get mentions',
          data: mentionsData
        })
      })
      /* end of getting mentions */
    })
    /* end of twitter token checking */
  })
}

/* getting mentions by user id */
/* fetch mentions from twitter api service */
TwitterService.getMentionsFromTwitterByUserId = function (userId, callback) {

  /* preparing query */
  let query = {
    userId: mongoose.Types.ObjectId(userId)
  }

  /* getting twitter token details into database */
  TwitterTokenDetailsModel.findOne(query, function (error, data) {
    if (error) {
      return callback('INTERNAL-SERVER-ERROR', 'Internal server error occured. Please try again after some time.', {})
    }

    if (!data) {
      return callback('SUCCESS', 'No twitter accounts found', {})
    }

    let token = data.token
    let tokenSecret = data.tokenSecret

    /* checking token validation */
    TwitterService.validatingTwitterTokens(token, tokenSecret, function (validatingError, validatingErrorCode, validatedmessage, validatedTokenData) {
      if (validatingError) {
        if (validatingErrorCode.code === 89) {
          /* setting status to false */
          data.status = false
          /* insert into database as invalid tokens.. need to re login*/
          return data.save({
            userId: userId
          }, {
              $set: {
                status: false
              }
            }, function (twitterTokenInsertError, twitterInsertData) {
              return callback('TWITTER-TOKEN-ERROR', 'Twitter tokesn was expired. Please login', {})
            })
        } else {
          return callback('TWITTER-ERROR', 'Error while checking data in twitter. Please try again.', {})
        }
      }

      /* adjusting parameters for getting mentions*/
      let parameters = {
        tweet_mode: 'extended',
        count: 200
      }

      /* adding since_id */
      if (data.lastSinceId) {
        parameters.since_id = data.lastSinceId
      }

      /* building twitter config */
      let client = TwitterService.buildTwitterConfig(token, tokenSecret)

      /* getting mentions */
      client.get('statuses/mentions_timeline', parameters, function (error, mentionsData) {
        if (error) {
          return callback('TWITTER-ERROR', 'Error while checking data in twitter. Please try again.', {})
        }

        /* inserting into database */
        TwitterService.insertMentionsIntoDatabase(data.userId, mentionsData, null, function (mentionsInsertError, mentionsInsertMessage, mentionsInsertiData) {
          if (mentionsData.length > 0) {
            /* insert last sinceId */
            data.lastSinceId = mentionsData[0].id

            data.save(function (dataSaveError, dataSaveData) {
              // console.log("all done", dataSaveError)
              return callback('SUCCESS', 'Sucessfully get mentions', mentionsData)
            })
          }
        })
      })
      /* end of getting mentions */
    })
    /* end of twitter token checking */
  })
}

/* inserting data into twitter mentions database */
TwitterService.insertMentionsIntoDatabase = function (userId, data, inReplyToStatusId, callback) {
  console.log('started insertion of mentions in database')
  if (data.length === 0) {
    return (null, 'Inserted successfully.', {})
  }
  let totalCount = data.length
  let insertionCompleted = 0;
  let startTime = Date.now()
  let newMentions = []

  // console.log("count ", totalCount)

  /* reversing the data */
  data = data.reverse()
  let i = 0
  async.eachSeries(data, function (element, inCallback) {
    console.log('\n --->twitter text ', element.full_text, i)
    /* adding extra parameters */
    /* need to add twitterId */
    element.userId = userId

    let skipCall = false

    /* adjusting twitter mention data */
    element.created_at = new Date(element.created_at).getTime()
    element.in_reply_to_status_id = element.in_reply_to_status_id ? element.in_reply_to_status_id : 0
    element.in_reply_to_status_id_str = element.in_reply_to_status_id_str ? element.in_reply_to_status_id_str : ""
    element.in_reply_to_user_id = element.in_reply_to_user_id ? element.in_reply_to_user_id : 0
    element.in_reply_to_user_id_str = element.in_reply_to_user_id_str ? element.in_reply_to_user_id_str : ""

    /* if in reply status status id present */
    if (inReplyToStatusId) {
      element.maintwittweStatusIdStr = inReplyToStatusId
      skipCall = true
    }
    /* getting twitter mention main status id */
    TwitterService.getTwitterMentionFromDatabase(skipCall, {
      id_str: element.in_reply_to_status_id_str
    }, function (getDataError, getDataMessage, getData) {
      if (!inReplyToStatusId) {
        if (getData && getData.maintwittweStatusIdStr) {
          element.maintwittweStatusIdStr = getData.maintwittweStatusIdStr
        } else if (getData && getData.id_str) {
          element.maintwittweStatusIdStr = getData.id_str
        } else {
          element.maintwittweStatusIdStr = element.id_str
        }
      }

      /* setting main mention */
      if (element.maintwittweStatusIdStr === element.id_str) {
        element.mainMention = true
      } else {
        element.mainMention = false
      }

      /* inserting */
      // let newTwitterMention = new TwitterMentionsModel(element)
      TwitterMentionsModel.findOneAndUpdate({
        id: element.id
      }, {
          $set: element,
          $setOnInsert: {
            insertedDate: Date.now()
          }
        }, {
          upsert: true,
          new: true
        }, function (error, ndata) {
          if (error) {
            console.log('error ', error)
          } else {
            // console.log('completed ', insertionCompleted)
            // console.log('twitter mentions inserted data ', error)
            insertionCompleted++
            if (ndata.insertedDate && ndata.insertedDate && ndata.insertedDate > startTime) {
              newMentions.push(ndata)
            }
          }

          i++
          inCallback(null)
        })

    })
  }, function () {
    callback(null, 'Successfully inserted', newMentions)
  });
}

/* update twitter status */
TwitterService.updateTwitterAccountStatus = function (apiRequest, apiResponse) {
  /* user data  */
  let userData = apiRequest.user
  if (!userData._id) {
    return apiResponse.status(200).send({
      message: 'no user found'
    })
  }

  /* updating data */
  TwitterTokenDetailsModel.update({
    userId: mongoose.Types.ObjectId(userData._id)
  }, {
      $set: {
        status: false
      }
    }, function (error, data) {
      console.log('error ', error)
      if (error) {
        return apiResponse.status(200).send({
          message: 'error found'
        })
      }

      return apiResponse.status(200).send({
        message: 'message done'
      })
    })
}

/* getting twitter mention */
TwitterService.getTwitterMentionFromDatabase = function (skipCall, query, callback) {
  // console.log('calling getTwitterMentionFromDatabase')
  if (skipCall) {
    return callback(null, null, null)
  }
  /* getting data */
  TwitterMentionsModel.findOne(query, function (error, data) {
    if (error) {
      return callback(error, 'Error while getting data', {})
    }

    return callback(null, 'Successfully get data', data)
  })
}

/* verifying user twitter tokens */
TwitterService.validatingTwitterTokens = function (token, tokenSecret, callback) {
  /* building client */
  let client = TwitterService.buildTwitterConfig(token, tokenSecret)

  /* checking token from twitter */
  client.get('account/verify_credentials', function (error, user) {
    if (error) {
      console.log('twitter error ', error, error[0], error[0].code)
      return callback(true, error[0], 'Error while validating twitter token', null)
    }
    // console.log("twitter data ", user)
    return callback(null, null, null, user)
  });
}

/* post sample tweet or send reply to status*/
/* paramerters twitterText(must include user mention) and inReplyToStatusId (id_str of tweet) */
TwitterService.postTweet = function (apiRequest, apiResponse) {
  /* getting user id */
  let userId = apiRequest.user._id ? apiRequest.user._id : null

  /* checking required fields */
  if (!userId) {
    return apiResponse.status(422).send({
      statusCode: 'INVALID-TOKEN',
      message: 'invalid user. Please login again',
      data: {}
    })
  }

  /* getting post related data */
  let twitterText = apiRequest.body.twitterText ? apiRequest.body.twitterText : null
  let inReplyToStatusId = apiRequest.body.inReplyToStatusId ? '' + apiRequest.body.inReplyToStatusId : null

  console.log(twitterText, inReplyToStatusId)

  if (!twitterText || !inReplyToStatusId) {
    return apiResponse.status(422).send({
      statusCode: 'MISSING-REQUIRED-FIELDS',
      message: 'twitterText and inReplyToStatusId is mandatory feilds',
      data: {}
    })
  }

  /* preparing query */
  let query = {
    userId: mongoose.Types.ObjectId(userId)
  }

  /* getting twitter token details into database */
  TwitterTokenDetailsModel.findOne(query, function (error, data) {
    if (error) {
      return apiResponse.status(500).send({
        statusCode: 'INTERNAL-SERVER-ERROR',
        message: 'Internal server error occured. Please try again after some time.',
        data: {}
      })
    }

    if (!data) {
      return apiResponse.status(200).send({
        statusCode: 'SUCCESS',
        message: 'No twitter accounts found',
        data: {}
      })
    }

    let token = data.token
    let tokenSecret = data.tokenSecret

    /* checking token validation */
    TwitterService.validatingTwitterTokens(token, tokenSecret, function (validatingError, validatingErrorCode, validatedmessage, validatedTokenData) {
      if (validatingError) {
        console.log('ss ', validatingErrorCode, typeof (validatingErrorCode.code), validatingErrorCode.code)
        if (validatingErrorCode.code === 89) {
          /* insert into database as invalid tokens.. need to re login*/
          data.status = false
          return data.save(function (twitterTokenInsertError, twitterInsertData) {
            return apiResponse.status(400).send({
              statusCode: 'TWITTER-TOKEN-ERROR',
              message: 'Twitter tokesn was expired. Please login',
              data: {}
            })
          })
        } else {
          return apiResponse.status(400).send({
            statusCode: 'TWITTER-ERROR',
            message: 'Error while checking data in twitter. Please try again.',
            data: {}
          })
        }
      }

      /* getting client config */
      let client = TwitterService.buildTwitterConfig(token, tokenSecret)

      /* adjusting parameters */
      let parameters = {
        status: twitterText,
        in_reply_to_status_id: inReplyToStatusId
      }

      client.post('statuses/update', parameters, function (tweetPostError, tweetPostData) {
        if (tweetPostError) {
          return apiResponse.status(400).send({
            statusCode: 'TWITTER-ERROR',
            message: 'Error while checking data in twitter. Please try again.',
            data: {}
          })
        }

        console.log('tweet post data ', tweetPostError)
        let newTweetPostData = []
        /* adjusting data */
        tweetPostData.full_text = tweetPostData.full_text ? tweetPostData.full_text : twitterText
        newTweetPostData.push(tweetPostData)

        /* inserting tweet into database */
        TwitterService.insertMentionsIntoDatabase(userId, newTweetPostData, inReplyToStatusId, function (tweetPostError, tweetPostMessage, tweetPostData) {
          if (tweetPostError) {
            return apiResponse.status(500).send({
              statusCode: 'INTERNAL-SERVER-ERROR',
              message: 'Internal server error occured. Please try again after some time.',
              data: {}
            })
          }

          return apiResponse.status(200).send({
            statusCode: 'SUCCESS',
            message: 'successfully posted status',
            data: tweetPostData
          })
        })
      })

    })
  })
}

/* checking twitter account connected or not */
TwitterService.checkATwitterAccountConnectedOrNot = function (apiRequest, apiResponse) {
  /* getting user id */
  let userId = apiRequest.user._id ? apiRequest.user._id : null

  /* checking required fields */
  if (!userId) {
    return apiResponse.status(422).send({
      statusCode: 'INVALID-TOKEN',
      message: 'invalid user. Please login again',
      data: {}
    })
  }

  /* preparing query */
  let query = {
    userId: userId
  }

  /* getting data from database */
  /* getting twitter token details into database */
  TwitterTokenDetailsModel.findOne(query, function (error, data) {
    if (error) {
      return apiResponse.status(500).send({
        statusCode: 'INTERNAL-SERVER-ERROR',
        message: 'Internal server error occured. Please try again after some time.',
        data: {}
      })
    }

    if (!data) {
      return apiResponse.status(202).send({
        statusCode: 'SUCCESS',
        message: 'No twitter accounts found',
        data: {}
      })
    }

    /* checking twitter account connectivity status (token valid or not) */
    if (!data.status) {
      return apiResponse.status(201).send({
        statusCode: 'SUCCESS',
        message: 'Inactive twitter account found',
        data: {}
      })
    }

    return apiResponse.status(200).send({
      statusCode: 'SUCCESS',
      message: 'Active twitter account found',
      data: {}
    })
  })
}

/* 
  webhook related
 */

/* register twitter web hook */
TwitterService.registerTwitterWebhook = function (apiRequest, apiResponse) {
  /* required fields */
  let oauthConsumerKey = config.twitter.consumerKey
  let oauthNonce = oauth_nonce()
  let oauthSignature = config.twitter.consumerSecret + '%26' + config.twitter.oauth.tokenSecret
  let oauthToken = config.twitter.oauth.token

  var headers = {
    'authorization': 'OAuth oauth_consumer_key="' + oauthConsumerKey + '", oauth_nonce="' + oauthNonce + ' ", oauth_signature="' + oauthSignature + '", oauth_signature_method="HMAC-SHA1", oauth_timestamp="' + new Date().getTime() + '", oauth_token="' + oauthToken + ' , oauth_version=1.0'
  }

  // console.log('headers ', headers)

  let options = {
    method: 'post',
    url: 'https://api.twitter.com/1.1/account_activity/all/production/webhooks.json?url=https%3A%2F%2Frich-panel-task.herokuapp.com%2Fwebhook%2Ftwitter',
    headers: headers
  };

  request(options, function (error, res, body) {
    // console.log(body)
    // console.log('----')
  })
}

/* register twitter web hook */
TwitterService.registerTwitterWebhook2 = function (apiRequest, apiResponse) {
  // twitter authentication
  let twitterOauth = {
    consumer_key: config.twitter.consumerKey,
    consumer_secret: config.twitter.consumerSecret,
    token: config.twitter.tempToken,
    token_secret: config.twitter.tempTokenSecret
  }

  // console.log('twitter oatu ', twitterOauth)

  let WEBHOOK_URL = 'https://rich-panel-task.herokuapp.com/webhooks/twitter'

  console.log('in 2 nd call')
  // request options
  let requestOptions = {
    url: 'https://api.twitter.com/1.1/account_activity/all/production/webhooks.json',
    oauth: twitterOauth,
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    },
    form: {
      url: WEBHOOK_URL
    }
  }

  // POST request to create webhook config
  request.post(requestOptions, function (error, response, body) {
    console.log('-->', body)
    return apiResponse.send({
      statusCode: 'SUCCESS',
      message: 'success',
      data: {
        twitterData: body
      }
    })
  })
}

/* getting webhook config */
TwitterService.getWebhookConfig = function (apiRequest, apiResponse) {
  // twitter authentication
  let twitterOauth = {
    consumer_key: config.twitter.consumerKey,
    consumer_secret: config.twitter.consumerSecret,
    token: config.twitter.tempToken,
    token_secret: config.twitter.tempTokenSecret
  }

  // request options
  var request_options = {
    url: 'https://api.twitter.com/1.1/account_activity/all/production/webhooks.json',
    oauth: twitterOauth
  }

  // GET request to retreive webhook config
  request.get(request_options, function (error, response, body) {
    console.log(response.statusCode)
    console.log(body)
    return apiResponse.send({
      message: 'succesfully get config',
      data: body
    })
  })
}

/* getting twitter webhook subscriptions */
TwitterService.getWebhookSubscriptions = function (apiRequest, apiResponse) {
  // twitter authentication
  let twitterOauth = {
    consumer_key: config.twitter.consumerKey,
    consumer_secret: config.twitter.consumerSecret,
    token: config.twitter.tempToken,
    token_secret: config.twitter.tempTokenSecret
  }

  /* getting twitter bearer token */
  TwitterService.getTwitterBearerToken(function (error, message, data) {

    console.log('bearer token data ', message, data)

    // request options
    var request_options = {
      url: 'https://api.twitter.com/1.1/account_activity/all/production/subscriptions/list.json',
      auth: {
        'bearer': data
      }
    }

    // GET request to retreive webhook config
    request.get(request_options, function (error, response, body) {
      console.log(response.statusCode)
      console.log(body)
      return apiResponse.send({
        statusCode: 'SUCCESS',
        message: 'succesfully get subscriptions',
        data: body
      })
    })
  })
}

/* validate config */
TwitterService.validateTwitterWebhookConfig = function (apiRequest, apiResponse) {
  /* getting twitter bearer token */
  TwitterService.getTwitterBearerToken(function (error, message, data) {

    console.log('bearer token data ', message, data)

    // request options
    var request_options = {
      url: 'https://api.twitter.com/1.1/account_activity/all/production/webhooks/1086653388962582528.json',
      auth: {
        'bearer': data
      }
    }

    // PUT request to retreive webhook config
    request.put(request_options, function (error, response) {

      console.log('dfdfd ', response)

      return apiResponse.send({
        data: response
      })
    })

  })
}

/* get bearer token for twitter webhook */
TwitterService.getTwitterBearerToken = function (callback) {

  if (twitterBearerToken) {
    return callback(null, 'Successfully get bearer token', twitterBearerToken)
  }

  // construct request for bearer token
  let request_options = {
    url: 'https://api.twitter.com/oauth2/token',
    method: 'POST',
    auth: {
      user: config.twitter.consumerKey,
      pass: config.twitter.consumerSecret
    },
    form: {
      'grant_type': 'client_credentials'
    }
  }


  request(request_options, function (error, response) {
    if (error) {
      return callback(error, 'Error while getting bearer token', null)
    } else {
      let json_body = JSON.parse(response.body)
      console.log("Bearer Token:", json_body.access_token)
      twitterBearerToken = json_body.access_token
      return callback(null, 'successfully get data', twitterBearerToken)
    }
  })
}

/* Listen to webhook of a twitter */
TwitterService.twitterWebhookListen = function (apiRequest, apiResponse) {
  console.log('\n$$$$\n getting data from twitter webhooks \n')

  return apiResponse.status(200).send({
    message: 'done'
  })
}

/* Listen to webhook of a twitter */
TwitterService.twitterWebhookSecureChanllange = function (apiRequest, apiResponse) {
  console.log('\n$$$$\n getting data from twitter webhooks \n')
  let crcToken = apiRequest.query.crc_token
  if (!crcToken) {
    return apiResponse.status(422).send({
      statusCode: 'MISSED-REQUIRED-FIELDS',
      message: 'crc_token required',
      data: {}
    })
  }

  console.log('entered crc token ', crcToken)

  return apiResponse.status(200).send({
    response_token: TwitterService.getChallengeResponse(config.twitter.consumerSecret, crcToken)
  })
}

/* build twitter config */
TwitterService.buildTwitterConfig = function (token, tokenSecret) {
  /* twitter config */
  let twitterConfig = {
    consumer_key: config.twitter.consumerKey,
    consumer_secret: config.twitter.consumerSecret,
    access_token_key: token,
    access_token_secret: tokenSecret
  }

  let client = new twitter(twitterConfig);

  return client
}

/* hmac key generation for twitter challenge */
TwitterService.getChallengeResponse = function (consumerSecret, crcToken) {
  /* generating hmac */
  let hmac = 'sha256=' + crypto.createHmac('sha256', consumerSecret).update(crcToken).digest('base64')
  return hmac
}

/* twitter login with oauth */
TwitterService.twitterLogin = function (apiRequest, apiResponse) {
  oa.getOAuthRequestToken(function (error, oauth_token, oauth_token_secret, results) {
    if (error) {
      console.log(error);
      return apiResponse.send({
        message: "yeah no. didn't work."
      })
    } else {
      apiRequest.session.oauth = {};
      apiRequest.session.oauth.token = oauth_token;
      apiRequest.session.oauth.token_secret = oauth_token_secret;

      console.log('----> oauth data in session ', apiRequest.session.oauth)
      return apiResponse.redirect('https://twitter.com/oauth/authenticate?oauth_token=' + oauth_token)
    }
  });
}

/* twitter login callback with oauth */
TwitterService.twitterLoginCallback = function (apiRequest, apiResponse) {
  if (apiRequest.session.oauth) {
    apiRequest.session.oauth.verifier = apiRequest.query.oauth_verifier;
    let oauth = apiRequest.session.oauth;
    oa.getOAuthAccessToken(oauth.token, oauth.token_secret, oauth.verifier,
      function (error, oauth_access_token, oauth_access_token_secret, results) {
        if (error) {
          console.log(error);
          apiResponse.send("yeah something broke.");
        } else {
          apiRequest.session.oauth.access_token = oauth_access_token;
          apiRequest.session.oauth.access_token_secret = oauth_access_token_secret;
          console.log(results);
          apiResponse.send("worked. nice one.");
        }
      }
    );
  } else {
    apiResponse.send("error while authenticating twitter.");
  }
}

/* cron job */
/* Getting tweets from twitter cron */
TwitterService.getTwitterMentionsUserWiseCron = function (callback) {
  console.log('in twitter cron')
  /* getting twitter account details */
  TwitterTokenDetailsModel.find({
    status: true
  }, function (error, data) {
    if (error) {

    } else {

      /* getting mentions */
      data.forEach((element) => {
        let client = TwitterService.buildTwitterConfig(element.token, element.tokenSecret)

        /* adjusting parameters for getting mentions*/
        let parameters = {
          tweet_mode: 'extended',
          count: 200
        }

        /* adding since_id */
        if (element.lastSinceId) {
          parameters.since_id = element.lastSinceId
        }

        console.log('params ', parameters)

        /* getting mentions */
        client.get('statuses/mentions_timeline', parameters, function (error, mentionsData) {
          console.log('new params ', parameters)
          // console.log('get data', mentionsData.length)
          if (error) {
            return callback(error, {})
          } else {
            if (mentionsData && mentionsData.length) {
              /* insert into database */
              TwitterService.insertMentionsIntoDatabase(element.userId, mentionsData, null, function () {

                /* saving last since id */
                let q = {
                  userId: mongoose.Types.ObjectId(element.userId)
                }
                let updateQuery = {
                  lastSinceId: mentionsData[0].id
                }
                TwitterTokenDetailsModel.findOneAndUpdate(q, updateQuery, function (newError, newMsg, newData) {
                  if (newError) {
                    return callback(newError, {})
                  } else {
                    if (newData && newData.length && newData[0]['in_reply_to_status_id']) {
                      return callback(true, {})
                    } else {
                      if (!newData || !newData.length) {
                        return callback(true, {})
                      }
                      let newMentions = []
                      newData.forEach((element) => {
                        if (!element['in_reply_to_status_id']) {
                          newMentions.push(element)
                        }
                      })
                      return callback(false, newMentions)
                    }
                  }
                })
              })
            }
          }
        })
      })
    }
  })
}
