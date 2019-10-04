var gulp = require('gulp')
var nodemon = require('nodemon')

/* default event */
gulp.task('default', function(done){
    nodemon({
        script : 'server.js',
        ext : 'js json',
        env : {
            NODE_ENV : 'development'
        },
        watch : [
            './restApp/*', 'server.js', './dist/'
        ],
        ignore : [
            './node_modules/*'
        ],
        stdout: true,
        readable: true
    })
    .on('start', function(){
        console.log('nodemon started')
        done()
    })
})