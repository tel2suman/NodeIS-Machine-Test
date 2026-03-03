
require('dotenv').config()

const express = require("express");

const path = require("path");

const app = express();

const cors = require("cors");

const morgan = require("morgan");

const helmet = require("helmet");

const rateLimit = require("./app/utils/limiter");

const mongoSanitize = require("express-mongo-sanitize");

//database connection
const DatabaseConnection = require('./app/config/dbconn');

DatabaseConnection();

app.use(cors());

app.use(morgan("dev"));

app.use(helmet());

// Apply the rate limiting middleware to all requests.
app.use(rateLimit);

// To remove data using these defaults:
app.use(mongoSanitize());

//static files
app.use(express.static(path.join(__dirname,'public')));
app.use("uploads", express.static(path.join(__dirname, "/uploads")));
app.use("/uploads", express.static("uploads"));

//define json
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

//defining routes
const authRoute = require("./app/routes/authRoute");
app.use("/api/auth-user", authRoute);

const blogRoute = require('./app/routes/blogRoute');
app.use("/api/blog", blogRoute);

const port = 8000

app.listen(port, () => {

  console.log("server is running on port", port);

});