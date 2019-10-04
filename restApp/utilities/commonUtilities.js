'use strict'

/* 
    includes common utilities
*/

/* requiring third party modules */
var jwt = require('jsonwebtoken')
var config = require('config')

var CommonUtilities = module.exports

/* authentication middleware */
/* checking authentication using jwt */
CommonUtilities.checkJwtToken = function (apiRequest, apiResponse, next) {
  /* getting token */
  // let accessToken = apiRequest.headers['x-access-token'] ? apiRequest.headers['x-access-token'] : null
  let accessToken = apiRequest.cookies['authToken'] ? apiRequest.cookies['authToken'] : null
  let newAccessToken = apiRequest.headers['x-access-token'] ? apiRequest.headers['x-access-token'] : null
  console.log('cookies ', apiRequest.cookies, accessToken, apiRequest.headers, apiRequest.headers['x-access-token'], newAccessToken)

  if (!accessToken) {
    accessToken = newAccessToken
  }

  /* checking access token */
  if (!accessToken) {
    return apiResponse.status(400).send({
      statusCode: 'NOT-LOGGED',
      message: 'no access token found or not logged.',
      data: {}
    })
  }

  /* validating access token */
  jwt.verify(accessToken, config.jwtSecret, function (err, decodedData) {
    if (err) {
      return apiResponse.status(500).send({
        statusCode: 'INVALID-TOKEN',
        message: 'invalid token or no token provided or not logged',
        data: {}
      })
    }

    /* checking expiry date of token */
    let currentDateInMilliseconds = new Date().getTime()

    if (currentDateInMilliseconds > decodedData.expiry_date) {
      return apiResponse.status(400).send({
        statusCode: 'TOKEN-EXPIRED',
        message: 'token expired. Please login again',
        data: {}
      })
    }

    /* debugging purpose */
    // console.log('decoded token data successfully', decodedData)
    console.log('decoded token data successfully')

    /* setting data into apiRequest for later use */
    apiRequest.user = decodedData
    next()
  })
}

/* decode jwt token */
CommonUtilities.decodeJwtToken = function (token, callback) {
  console.log('token --> ', token)
  /* validating access token */
  jwt.verify(token, config.jwtSecret, function (err, decodedData) {
    if (err) {
      return callback(err, 'Error while decoding', {})
    }
    return callback(null, 'Successfully decoded', decodedData)
  })
}

/* generate jwt token */
CommonUtilities.generateJwtToken = function (data) {
  /* generating token */
  let token = jwt.sign(data, config.jwtSecret)
  return token
}

/* getting cookies */
CommonUtilities.getCookies = function (request) {
  if(request.headers && request.headers.cookie){
    console.log('cookies in twitter auth ', request.headers.cookie)
  }
  
  var cookies = {};
  request.headers && request.headers.cookie.split(';').forEach(function (cookie) {
    var parts = cookie.match(/(.*?)=(.*)$/)
    cookies[parts[1].trim()] = (parts[2] || '').trim();
  });
  return cookies;
};