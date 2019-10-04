'use strict'

/* 
    includes common services
*/

/* requiring third party modules */
var jwt = require('jsonwebtoken')
var config = require('config')

var CommonService = module.exports

/* authentication middleware */
/* checking authentication using jwt */
CommonService.checkAuthentication = function (apiRequest, apiResponse, next) {
    /* getting token */
    let accessToken = apiRequest.headers['x-access-token'] ? apiRequest.headers['x-access-token'] : null

    /* checking access token */
    if (!accessToken) {
        apiResponse.status(422).send({
            statusCode: 'NOT-LOGGED',
            message: 'no access token found or not logged.',
            data: {}
        })
    }

    /* validating access token */
    jwt.verify(accessToken, config.jwtSecret, function (err, decodedData) {
        if (err) {
            apiResponse.send(400).send({
                statusCode: 'INVALID-TOKEN',
                message: 'invalid token or no token provided or not logged',
                data: {}
            })
        }

        /* setting data into apiRequest for later use */
        apiRequest.user = decodedData
        next()
    })
}

/* generate jwt token */
CommonService.generateJwtToken = function (data) {
    /* generating token */
    let token = jwt.sign(data, config.jwtSecret)
    return token
}

/* get image */
CommonService.getImage = function (apiRequest, apiResponse) {
    /* get image address */
    let imageAddress = apiRequest.imageAddress ? apiRequest.imageAddress : null
    if (!imageAddress) {
        return apiResponse.sendFile(__dirname + '/../../uploads/not-found.png')
    } else {
        return apiResponse.sendFile(__dirname + '/../../uploads/' + imageAddress)
    }
}