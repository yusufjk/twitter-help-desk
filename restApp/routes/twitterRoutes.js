'use strict'

/* importing utilities */
const CommonUtilities = require('./../utilities/commonUtilities')

/* import models */
const TwitterTokenDetailsModel = require('./../models/twitterTokenDetailsModel')

/* importing services */
var TwitterService = require('./../services/twitterService')

var passport = require('passport')
var TwitterStrategy = require('passport-twitter').Strategy;
var expressSession = require('express-session');
var config = require('config')

/* twitter passport authentication */
passport.use(new TwitterStrategy({
  consumerKey: config.twitter.consumerKey,
  consumerSecret: config.twitter.consumerSecret,
  callbackURL: config.twitterCallbackUrl,
  passReqToCallback: true
},
  function (req, token, tokenSecret, profile, done) {
    // console.log('----> request from twitter ', req.headers, req.cookies)

    /* splitting the cookies from twitter for auth token of our user */
    let cookiesIndividualData = CommonUtilities.getCookies(req)

    /* decoding token */
    CommonUtilities.decodeJwtToken(cookiesIndividualData['authToken'], function (tokenDecodeError, tokenDecodeMessage, tokenDecodeData) {
      console.log('decode error ', tokenDecodeError)
      if (tokenDecodeError) {
        /* not logged */
        done('Failed to login.', {})
      }

      else {
        /* setting user id */
        let userId = tokenDecodeData['_id']

        /* update data */
        let updateData = {
          $set: {
            token: token,
            tokenSecret: tokenSecret,
            updatedDate: Date.now()
          },
          $setOnInsert: {
            createdDate: Date.now(),
            status: true
          }
        }

        /* update query */
        let updateQuery = {
          userId: userId
        }

        /* store twitter account details in database */
        TwitterTokenDetailsModel.findOneAndUpdate(updateQuery, updateData, {
          upsert: true,
          new: true
        }, function (updateError, newupdatdData) {
          /* getting profile data */
          TwitterService.validatingTwitterTokens(token, tokenSecret, function (tokenValidityError, tokenValidityErrorCode,  tokenValidityMessage, tokenValidityData) {
            console.log('token validity error ', tokenValidityError, tokenValidityErrorCode)
            if (tokenValidityError) {
              // return
            }

            /* get new mentions from */
            TwitterService.getMentionsFromTwitterByUserId(userId, function () {

            })

            /* adjusting twitter data */
            tokenValidityData.created_at = new Date(tokenValidityData.created_at).getTime()

            delete tokenValidityData.status

            /* setting original status */
            tokenValidityData.status = true

            /* saving twitter data into db */
            TwitterTokenDetailsModel.findOneAndUpdate(updateQuery, tokenValidityData, function (newDataInsertError, newInsertedData) {
              console.log('new inserted data error', newDataInsertError)
              if (updateQuery) {
                // return
              }
            })
          })

          console.log('Error while saving data ', updateError)
          if (updateError) {
            done('Error while saving data', {})
          } else {
            done(null, newupdatdData)
          }
        })

      }
    })
  }
));

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

module.exports = function (app) {

  /* using third party modules */
  app.use(expressSession({
    secret: 'watchingferries',
    resave: true,
    saveUninitialized: true
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  /* routes */
  app.get('/auth/twitter2', function (apiRequest, apiResponse, next) {
    apiRequest['headers']['state'] = {
      "state": "mouse"
    }
    // console.log('api request headers ', apiRequest['headers'])
    next()
  }, passport.authenticate('twitter'))

  /* main callback */
  app.get('/auth/twitter/callback2',
    passport.authenticate('twitter', {
      successRedirect: '/twitter/login/success',
      failureRedirect: '/twitter/login/failure'
    })
  )

  /* temp routes */
  /* need to change it into frontend routes */
  app.get('/twitter/login/success', function (apiRequest, apiResponse) {
    apiResponse.redirect('/twitter-desk');
  })
  app.get('/twitter/login/failure', function (apiRequest, apiResponse) {
    apiResponse.redirect('/twitter-check?login_failed=true');
  })

  app.get('/api/twitter/mentions', CommonUtilities.checkJwtToken, TwitterService.getMentionsFromTwitter)
  app.post('/api/twitter/post-tweet', CommonUtilities.checkJwtToken, TwitterService.postTweet)
  app.get('/api/twitter/display-mentions', CommonUtilities.checkJwtToken, TwitterService.displayTwitterMentions)
  app.get('/api/twitter/check-connected-accounts', CommonUtilities.checkJwtToken, TwitterService.checkATwitterAccountConnectedOrNot)
  app.get('/api/twitter/update-status', CommonUtilities.checkJwtToken, TwitterService.updateTwitterAccountStatus)

  /* oauth related routes */
  app.get('/auth/twitter', TwitterService.twitterLogin)
  app.get('/auth/twitter/callback', TwitterService.twitterLoginCallback)

  /* webhook related routes */
  app.get('/webhooks/twitter', TwitterService.twitterWebhookSecureChanllange)
  app.post('/webhooks/twitter', TwitterService.twitterWebhookListen)
  app.get('/webhooks/register-twitter-webhook', TwitterService.registerTwitterWebhook2)
  app.get('/webhooks/get-webhook-config', TwitterService.getWebhookConfig)
  app.get('/webhooks/get-webhook-subscriptions', TwitterService.getWebhookSubscriptions)
  app.get('/webhooks/validate-webhook-config', TwitterService.validateTwitterWebhookConfig)
}
