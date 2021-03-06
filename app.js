const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const config = require('./config/database')

mongoose.connect(config.database)
let db = mongoose.connection

//Check connection
db.once('open', () => {
    console.log('Connected to MongoDB')
})

//Check for DB errors
db.on('error', (err) => {
    console.log(err)
})

//Init app
const app = express()

// Bring in models
let Article = require('./models/article')

//Load View Engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// Body parser Middleware
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// Set Public folder
app.use(express.static(path.join(__dirname, 'public')))

// Express Session Middleware
app.use(session({
    secret: 'Keyboard cat',
    resave: true,
    saveUninitalized: true
}))

//Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value){
        var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;

        while(namespace.length){
            formParam += '[' + namespace.shift() + ']'
        }
        return{
            param : formParam,
            msg: msg,
            value : value
        };
    }
}))

// Passport config
require('./config/passport')(passport)
// Passport Middleware
app.use(passport.initialize())
app.use(passport.session())

app.get('*', (req, res, next) => {
    res.locals.user = req.user || null
    next()
})

//Home Route
app.get('/',(req, res) => {
    Article.find({}, (err, articles) => {
        if(err){
            console.log(err)
        }
        else{
            res.render('index', {
                title: 'Articles',
                articles: articles
            })
        }        
    })    
})

// Route Files
let articles = require('./routes/articles')
let users = require('./routes/users')
app.use('/articles', articles)
app.use('/users', users)

//Start Server
app.listen('3000', () => {
    console.log('Server started on port 3000...')
})