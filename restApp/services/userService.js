'use strict'

/* 
    User service include user login and registraion related functions 
*/

/* requiring models */
var UsersModel = require('./../models/usersModel')

/* requring utilites */
var CommonUtilities = require('./../utilities/commonUtilities')

var UserService = module.exports

/* registering */
UserService.register = function (apiRequest, apiResponse) {
  /* debugging purpose */
  console.log('user details ', apiRequest.body)

  /* getting user details */
  let email = apiRequest.body.email ? apiRequest.body.email : null
  let name = apiRequest.body.name ? apiRequest.body.name : null
  let password = apiRequest.body.password ? apiRequest.body.password : null
  let confirmPassword = apiRequest.body.confirmPassword ? apiRequest.body.confirmPassword : null

  /* checking required fields */
  if (!email || !name || !password || !confirmPassword) {
    return apiResponse.status(422).send({
      statusCode: 'MISSED-REQUIRED-FIELDS',
      message: 'email, name, password and confirm password are required fields. Please fill without empty',
      data: {}
    })
  }

  /* checking password and confirm password are equal or not */
  if (password !== confirmPassword) {
    return apiResponse.status(202).send({
      statusCode: 'CONFRIM-PASSWORD-MISMATCH',
      message: 'both password and confirm password should be same.',
      data: {}
    })
  }

  /* query to check user existed or not */
  let userExistsCheckQuery = {
    email: email
  }

  /* checking users existed or not in database */
  UserService.getUserDetailsByQuery(userExistsCheckQuery, {}).then((data) => {

    /* checking if data is present or not */
    if (data) {
      return apiResponse.status(202).send({
        statusCode: 'USER-ALREADY-REGISTERED',
        message: 'User already registered.',
        data: {}
      })
    }

    /* adjusting user details */
    let userDetails = {
      email: email,
      name: name
    }

    /* creating new user model */
    let newUserData = new UsersModel(userDetails)

    /* generating hash password and inserting into new user data */
    newUserData.password = newUserData.generateHash(password)

    /* storing into database */
    newUserData.save(userDetails, function (error, data) {
      if (error) {
        console.log('error ', error)
        return apiResponse.status(500).send({
          statusCode: 'INTERNAL-SERVER-ERROR',
          message: 'Internal server error occured. Please try again after some time.',
          data: {}
        })
      }

      /* successfully registered */
      return apiResponse.status(200).send({
        statusCode: 'SUCCESS',
        message: 'Successfully registserd user',
        data: {}
      })
    })
  }).catch((error) => {
    console.log('error ', error)
    return apiResponse.status(500).send({
      statusCode: 'INTERNAL-SERVER-ERROR',
      message: 'Internal server error occured. Please try again after some time.',
      data: {}
    })
  })
}

/* login checking */
UserService.login = function (apiRequest, apiResponse) {
  console.log('in login function')
  /* getting user credentials */
  let email = apiRequest.query.email ? apiRequest.query.email : null
  let password = apiRequest.query.password ? apiRequest.query.password : null

  /* checking require fields */
  if (!email || !password) {
    return apiResponse.status(422).send({
      statusCode: 'MISSED-REQUIRED-FIELDS',
      message: 'email and password are required',
      data: {}
    })
  }

  /* preparing query */
  let query = {
    email: email
  }

  /* checking into database */
  UserService.getUserDetailsByQuery(query, {}).then((data) => {
    /* checking data present or not */
    if (!data) {
      return apiResponse.status(202).send({
        statusCode: 'USER-NOT-FOUND',
        message: 'Email address not found. You can check and retry again or register with new email',
        data: {}
      })
    }

    /* checking password is valid or not */
    if (!data.validPassword(password)) {
      return apiResponse.status(400).send({
        statusCode: 'AUTH-DETAILS-ERROR',
        message: 'Failed login. Please try again.',
        data: {}
      })
    }

    // console.log("user data ", data)

    /* payload for token */
    let payloadForToken = {
      _id: data._id,
      expiry_date: new Date().getTime() + (7 * 24 * 60 * 60 * 1000) // 7 days expiry data
    }

    /* preparing result data */
    let resultData = {}
    resultData.token = CommonUtilities.generateJwtToken(payloadForToken)

    let cookieOptions = {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true
    }
    /* setting cookie */
    apiResponse.cookie('authToken', resultData.token)

    return apiResponse.status(200).send({
      statusCode: 'SUCCESS',
      message: 'successfully logged in',
      data: resultData
    })
  }).catch((error) => {
    return apiResponse.status(500).send({
      statusCode: 'INTERNAL-SERVER-ERROR',
      message: 'Internal error occured. You can try after some time',
      data: {}
    })
  })
}

/* getting user details */
UserService.getUserDetails = function (apiRequest, apiResponse) {

  /* debuggin purpose */
  // console.log('logged user data ', apiRequest.user)

  /* getting user id from token */
  let _id = apiRequest.user._id ? apiRequest.user._id : null

  if (!_id) {
    return apiResponse.status(400).send({
      statusCode: 'INVALID-USER',
      message: 'invalid user. Please login again',
      data: {}
    })
  }

  /* preparing query */
  let query = {
    _id: _id
  }

  /* adjusting project fields */
  let projectFields = {
    _id: 0,
    name: 1,
    email: 1,
    createdDate: 1
  }

  /* getting data from database */
  UserService.getUserDetailsByQuery(query, projectFields).then((data) => {
    return apiResponse.status(200).send({
      statusCode: 'SUCCESS',
      message: 'Successfully get data',
      data: data
    })
  }).catch((error) => {
    return apiResponse.status(500).send({
      statusCode: 'INTERNAL-SERVER-ERROR',
      message: 'Internal server occured. Please try again later',
      data: {}
    })
  })
}

/* get user details by query and project fields */
/* 
  query object required
  projectFeilds object optional
*/
UserService.getUserDetailsByQuery = function (query, projectFields) {
  /* adjusting parameters */
  projectFields = projectFields ? projectFields : {}

  /* getting data from database */
  return new Promise(function (resolve, reject) {
    UsersModel.findOne(query, projectFields)
      .then((data) => {
        resolve(data)
      })
      .catch((error) => {
        reject(error)
      })
  })
}