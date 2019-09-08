const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');


const app = express();

// session management variables
const redis = require('redis');

const client = redis.createClient(process.env.REDIS_URL);
const crypto = require('crypto');
const session = require('express-session');

const helmet = require('helmet');
const config = require('./config');
const index = require('./routes/index');

// Headers security!!
app.use(helmet());

// Implement CSP with Helmet

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", 'https://ajax.googleapis.com/'],
    styleSrc: ["'self'"],
    imgSrc: ["'self'", 'https://dl.dropboxusercontent.com'],
    mediaSrc: ["'none'"],
    frameSrc: ["'none'"],
  },

  // Set to true if you want to blindly set all headers: Content-Security-Policy,
  // X-WebKit-CSP, and X-Content-Security-Policy.
  setAllHeaders: true,

}));

// initialize session
const sess = {
  secret: config.SESSION_ID_SECRET,
  cookie: {}, // add empty cookie to the session by default
  resave: false,
  saveUninitialized: true,
  genid: (req) => crypto.randomBytes(16).toString('hex'),
  store: new (require('express-sessions'))({
  	storage: 'redis',
    instance: client, // optional
    collection: 'sessions', // optional
  }),
};


if (app.get('env') === 'production') {
  app.set('trust proxy', 1); // trust first proxy
  sess.cookie.secure = true; // serve secure cookies
}

app.use(session(sess));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
