require("dotenv").config();

const express = require("express");

const path = require("path");

const app = express();

const cors = require("cors");

const morgan = require("morgan");

const helmet = require("helmet");

const rateLimit = require("./app/utils/limiter");

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

const classRoute = require("./app/routes/userRoute");
app.use("/api/class-task", classRoute);


const port = 5000;

app.listen(port, () => {
  console.log("server is running on port", port);
});