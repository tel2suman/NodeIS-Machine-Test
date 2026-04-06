
require('dotenv').config()

const express = require("express");

const path = require("path");

const app = express();

const cookieParser = require("cookie-parser");

const cors = require("cors");

const morgan = require("morgan");

const helmet = require("helmet");

const session = require("express-session");

const flash = require("connect-flash");

const rateLimit = require("./app/utils/limiter");


//database connection
const DatabaseConnection = require('./app/config/dbconn');

DatabaseConnection();

app.use(cors());

app.use(morgan("dev"));

app.use(
  helmet({
    contentSecurityPolicy: false,
    xDownloadOptions: false,
  }),
);

//define json
app.use(express.json())

// Parse form data
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Apply the rate limiting middleware to all requests.
app.use(rateLimit);

//static files
app.use(express.static(path.join(__dirname,'public')));
app.use("uploads", express.static(path.join(__dirname, "/uploads")));
app.use("/uploads", express.static("uploads"));


// ejs template engine
const ejs = require('ejs');
app.set('view engine', 'ejs');
app.set('views', 'views');


// session & cookie storage
app.use(cookieParser());

app.use(
  session({
    secret: "keyboardcat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  }),
);

app.use(flash());

//defining routes
app.use(require("./app/routes/index"))

const port = 3500

app.listen(port, () => {

  console.log("server is running on port", port);

});