'use strict'

/* importing services */
const UserService = require('./../services/userService')
const CommonService = require('./../services/commonService')

/* importing utilities */
var CommonUtilities = require('./../utilities/commonUtilities')

module.exports = function (app) {
    app.get('/api/test', function(apiRequest, apiResponse){
        apiResponse.cookie('sdd', 'ram')
        apiResponse.status(200).send({
            message : 'test route',
            data : {}
        })
    })
    app.post('/api/user/register', UserService.register)
    app.get('/api/user/login', UserService.login)
    app.get('/api/user/get-user-details', CommonUtilities.checkJwtToken, UserService.getUserDetails)

    app.get('/api/image', CommonService.getImage)
}
