"use strict";

require('dotenv').config();

const PORT        = process.env.PORT || 8080;
const ENV         = process.env.ENV || "development";
const express     = require("express");
const bodyParser  = require("body-parser");
const sass        = require("node-sass-middleware");
const app         = express();

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');

// Seperated Routes for each Resource
const usersRoutes = require("./routes/users");
// const analyzeRoutes = require("./routes/analyze");
const watson  = require("./watson.js");

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

// Mount all resource routes
app.use("/api/users", usersRoutes(knex));


// Home page
app.get("/", (req, res) => {
  res.render("index");
});
app.get("/chart", (req, res) => {
  res.render("chart");
});

app.get("/text", (req, res) => {
  res.render("text");
});

app.post("/api/analyze", (req, res) => {
  let text = req.body.text
  watson(text, (responseTone, responsePerson) => {
    // console.log(responseTone, responsePerson)
    let labels = []
    let data = []
    console.log(JSON.stringify(responseTone.document_tone.tone_categories))
    responseTone.document_tone.tone_categories[0]['tones'].forEach((tone) => {
      labels.push(tone['tone_name'])
      data.push(tone['score']*100)
    })
    let templateVars = {
      labels: JSON.stringify(labels),
      data: JSON.stringify(data)
    }
    res.render('chart', templateVars)
  });
});





app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
