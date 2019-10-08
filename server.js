var express = require('express');
var app = express();

/* require thrid party modules */
const config = require('config');
var bodyParser = require('body-parser');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const methodOverride = require('method-override');
var http = require('http').createServer(app);
// const server = app.listen(1337);
var io = require('socket.io')(http);
var CommonUtilities = require('./restApp/utilities/commonUtilities');

var TwitterService = require('./restApp/services/twitterService');

var newSocket;
var socketData = {};

/* websocket */
io.on('connection', function (socket) {
  newSocket = socket;
  console.log('a user connected ', socket.id);
  socket.on('message', function (msg) {
    console.log(socket.id);
    console.log('message: ' + msg);
    io.to(socket.id).emit('message', 'for your eyes only');
  });

  let timeOut;

  socket.on('register', function (authToken) {
    console.log('registered socket with token ', authToken);
    CommonUtilities.decodeJwtToken(authToken, function (error, message, data) {
      if (error) {
        console.log('auth token expired')
      } else {
        socketData[socket.id] = data._id
      }
      /* getting mentions for first time call */
      TwitterService.getMentionsFromTwitterForSocket(socketData[socket.id], function (data) {
        console.log('data from socket twitter service for first time call ');
        if (data.statusCode === 'SUCCESS') {
          console.log('new mentions data ', data.data.length, data.data.id, data.data.full_text, data.data.maintwittweStatusIdStr);
          if (data.data && data.data.length) {
            console.log('mentions data greater than one', data.data.length);

            /* emi to the user */
            socket.emit('newTweet', data)
          } else {
            console.log('new mentions data null')
          }
        } else {
          console.log('error while getting new mentions data', data.statusCode, data.message)
        }
      });

      timeOut = setInterval(() => {
        /* get new mentions */
        TwitterService.getMentionsFromTwitterForSocket(socketData[socket.id], function (data) {
          // console.log('data from socket twitter service ', data.statusCode)
          if (data.statusCode === 'SUCCESS') {
            console.log('new mentions data ', data.data.length, data.data.id, data.data.full_text, data.data.maintwittweStatusIdStr);
            if (data.data && data.data.length) {
              console.log('mentions data greater than one', data.data.length);

              /* emi to the user */
              socket.emit('newTweet', data)
            } else {
              console.log('new mentions data null')
            }
          } else {
            console.log('error while getting new mentions data', data.statusCode, data.message)
          }
        })
      }, 10.1 * 1000);
    })
  });

  socket.on('disconnect', function () {
    console.log('socket disconnected ', socket.id);
    delete socketData[socket.id];
    if (timeOut) {
      console.log('time out delete');
      console.log(typeof (timeOut));

      /* based on timeout object we clearing and removing */
      if (typeof (timeOut) === 'object') {
        clearInterval(timeOut)
      } else {
        delete timeOut
      }
    } else {
      console.log('time out function not found')
    }
  })
});


const options = {
  autoReconnect: true,
  reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  reconnectInterval: 500, // Reconnect every 500ms
  poolSize: 25, // Maintain up to 25 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0,
  keepAlive: 120,
  promiseLibrary: require('bluebird'),
  useNewUrlParser: true
};

mongoose.set('debug', false);

mongoose.connect(config.mongodb.uri, options)
  .then(() => console.log('mongoose connection on ' + config.mongodb.uri + ' successful'))
  .catch((err) => console.error(err));

const db = mongoose.connection;

db.once('error', function (err) {
  console.error('mongoose connection error' + err);
  mongoose.disconnect()
});
db.on('open', function () {
  console.log('successfully connected to mongoose')
});
db.on('reconnected', function () {
  console.log('MongoDB reconnected!')
});
db.on('disconnected', function () {
  console.log('MongoDB disconnected!')
});

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(methodOverride('X-HTTP-Method-Override'));

app.use(cors(), function (req, res, next) {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type,Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  next()
});

app.use(express.static(__dirname + '/dist'));
app.use(express.static(__dirname + '/uploads/'));
app.use(express.static(__dirname + '/socketIo/'));

/* requring external routes */
require('./restApp/routes/userRoutes')(app);
require('./restApp/routes/twitterRoutes')(app);

app.get('/*', function (req, res) {
  res.sendFile(__dirname + '/dist' + '/index.html');
});

const cron = require('node-cron');

process.on('uncaughtException', function (uncaught_exception) {
  console.error((new Date()).toUTCString() + ' uncaughtException:', uncaught_exception.message);
  console.error(uncaught_exception)
});

process.on('unhandledRejection', function (unhandled_error) {
  console.error((new Date()).toUTCString() + ' unhandledRejection:', unhandled_error.message);
  console.error(unhandled_error)
});

process.on('uncaughtException', function (e) {
  console.error('Uncaught Exception...');
  console.error(e.stack)
});

/* setting port */
let port = config.serverPort ? config.serverPort : 8080;
http.listen(process.env.PORT || port, function () {
  console.log('\nserver started on port ', port)
});
