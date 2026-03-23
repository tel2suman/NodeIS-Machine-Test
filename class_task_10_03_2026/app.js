require("dotenv").config();

const express = require("express");

const path = require("path");

const app = express();

const cors = require("cors");

const morgan = require("morgan");

const helmet = require("helmet");

const session = require("express-session");

const cookieParser = require("cookie-parser");

const flash = require("connect-flash");

const rateLimit = require("./app/utils/limiter");

// ejs template engine
const ejs = require("ejs");

app.set("view engine", "ejs");
app.set("views", "views");

app.use(cors());

app.use(morgan("dev"));

app.use(morgan("combined"));

app.use(helmet());

// Apply the rate limiting middleware to all requests.
app.use(rateLimit);

//database connection

const DatabaseConnection = require('./app/config/dbconn');
DatabaseConnection();

//static files
app.use(express.static(path.join(__dirname, "public")));

//define json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

//api routes
app.use(require("./app/routes/index"));

const port = 5000;

app.listen(port, () => {
  console.log("server is running on port", port);
});