
require('dotenv').config()

const express = require("express");

const path = require("path");

const app = express();

const cookieParser = require("cookie-parser");

const cors = require("cors");

const morgan = require("morgan");

const helmet = require("helmet");

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

// Apply the rate limiting middleware to all requests.
app.use(rateLimit);

//static files
app.use(express.static(path.join(__dirname,'public')));
app.use("uploads", express.static(path.join(__dirname, "/uploads")));
app.use("/uploads", express.static("uploads"));

// Parse form data
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

//define json
app.use(express.json())

// ejs template engine
const ejs = require('ejs');
app.set('view engine', 'ejs');
app.set('views', 'views');

//defining routes
const authRoute = require("./app/routes/authRoute");
app.use(authRoute);

const blogRoute = require('./app/routes/blogRoute');
app.use(blogRoute);

const port = 8000

app.listen(port, () => {

  console.log("server is running on port", port);

});