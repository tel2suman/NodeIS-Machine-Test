
const express = require("express");

const path = require("path");

const app = express();

const cors = require("cors");

const morgan = require("morgan");

const helmet = require("helmet");

const RateLimit = require("./app/utils/limiter.js");

const DatabaseConnection = require("./app/config/dbconn.js");

require("dotenv").config();

app.use(cors());

app.use(morgan("dev"));

app.use(morgan("combined"));

app.use(helmet());

app.use(RateLimit);

DatabaseConnection();

//static files
app.use(express.static(path.join(__dirname, "public")));

//define json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// define routes
app.use(require("./app/routes/index"));


const port = 7000;

app.listen(port, () => {
  
  console.log("server is running on port", port);
});

