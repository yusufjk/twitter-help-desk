var socketData = {}
var CommonUtilities = require('./../utilities/commonUtilities')

module.exports = function (io) {
    io.on('connection', function (socket) {
        console.log('a user connected ', socket.id);
        socket.on('message', function (msg) {
            console.log(socket.id)
            console.log('message: ' + msg);
            io.to(socket.id).emit('message', 'for your eyes only');
        });

        socket.on('register', function (authToken) {
            console.log('$$$$$$$$$$ registered ', authToken)
            CommonUtilities.decodeJwtToken(authToken, function (error, message, data) {
                if (error) {
                    console.log('auth token expired')
                } else {
                    socketData[socket.id] = data._id
                }
                console.log('socket data ', socketData)
            })
        })
    });
}