const express = require('express');
const ejs = require('ejs');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const status = require("./status")
const index = require('./routes/index');
//const twofactor = require("./routes/twofactor.js")
const MongoStore = require('connect-mongo')(session);
const MongoDBURI = process.env.MONGO_URI || 'mongodb://localhost/ManualAuth';


const nunjucks = require('nunjucks')
const Nexmo = require('nexmo')



const nexmo = new Nexmo({
  apiKey: process.env.NEXMO_KEY || '20e77de5',
  apiSecret: process.env.NEXMO_SECRET || '94tysqONpYvZxudc',
})



mongoose.connect(MongoDBURI, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
});

app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/views'));



app.use('/', index);
app.use('/status', status);
//app.use('/twofactor', "/routes/twofactor");




// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send(err.message);
});

// listen on port 4000
app.listen(process.env.PORT || 4000, () => {
  console.log('Express app listening on port 4000');
});