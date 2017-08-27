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
const session     = require('express-session');
const bcrypt      = require('bcryptjs');

// Seperated Routes for each Resource
const usersRoutes = require("./routes/users");
// const analyzeRoutes = require("./routes/analyze");
const watson  = require("./watson.js");

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

app.use(session({
  secret: 'sshshshsjsdkbh',
  resave: true,
  saveUninitialized: true
}));

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
  if(req.session.userID){
    knex('users')
        .select('*')
        .where({
          users_id: req.session.userID
        })
    .then((response)=> {
      console.log('response from database', response[0].first_name)
      var sendToFront = {
        name: response[0].first_name,
        user: req.session.userID,
        message: 'SESSION EXISTS'
      };
      res.render("index", sendToFront);
    })
  } else {
    var sendToFront = {
      user: null,
      name: null,
      message: 'NO SESSION. THIS MESSAGE DISPLAYS'
    };
    res.render("index", sendToFront);
  }
});

app.get("/chart", (req, res) => {
  res.render("chart");
});

app.get("/text", (req, res) => {
  if(req.session.userID){
    knex('users')
        .select('first_name', 'last_name')
        .where({
          users_id: req.session.userID
        })
    .then((response)=> {
      console.log('response', response)
      var sendToFront = {
        first_name: response[0].first_name,
        last_name: response[0].last_name,
        user: req.session.userID
      }
      res.render("text", sendToFront);
    })
  } else {
    res.send('NOPE.')
  }
});

app.post("/api/analyze", (req, res) => {
  let text = req.body.text
  watson(text, (responseTone, responsePerson) => {
    // console.log(responseTone, responsePerson)
    knex('results')
      .insert({
        writer_id: req.session.userID,
        text: text,
        tone_response: responseTone,
        insight_response: responsePerson,
        created_at: new Date
      }).then((test) => {
        console.log('data went in?', test)
      })

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





app.get('/signup', (req, res)=> {
  res.render('signup');
})

app.post('/signingUp', (req, res)=> {
  console.log('req.body', req.body)
  console.log('time right now', Date.now())
  var hashedPassword = bcrypt.hashSync(req.body.password, 10);
  console.log('HELLLLLLO AFTER BCRYPT')
  console.log('password', req.body.password);
  console.log('hash', hashedPassword);
  if(req.body.major && req.body.uni_id){
    knex('users')
      .insert([{
        first_name: req.body.fName,
        last_name: req.body.lName,
        email: req.body.email,
        password_hash: hashedPassword,
        counselor_or_patient: req.body.counselorOrNot,
        major: req.body.major,
        created_at: new Date,
        university_id: req.body.uni_id
      }])
    .then((response)=> {
      console.log('inside insert response', response)
      knex
          .select('users_id', 'counselor_or_patient')
          .from('users')
          .where({
            email: req.body.email
          })
      .then((response)=> {
        console.log('inside second then', response)
        req.session.userID = response[0].users_id;
        console.log('session exists', req.session.userID)
        //if(response[0].counselor_or_patient === 'No' || response[0].counselor_or_patient === 'no'){
          res.redirect('/')
        // } else {
        //   res.redirect('/counselorDash')
        // }
      })
    })
  } else if (req.body.major == '' && req.body.uni_id == ''){
      knex('users')
        .insert([{
          first_name: req.body.fName,
          last_name: req.body.lName,
          email: req.body.email,
          password_hash: hashedPassword,
          counselor_or_patient: req.body.counselorOrNot,
          major: null,
          created_at: new Date,
          university_id: null
        }])
      .then((response)=> {
        console.log('inside insert response', response)
        knex
            .select('users_id', 'counselor_or_patient', 'first_name', 'last_name')
            .from('users')
            .where({
              email: req.body.email
            })
        .then((response)=> {
          console.log('inside second then', response)
          req.session.userID = response[0].users_id;
          console.log('session exists', req.session.userID)
          //if(response[0].counselor_or_patient === 'No' || response[0].counselor_or_patient === 'no'){
            //res.redirect('/')
          //} else {
            // var sendToFront = {

            // }
            res.redirect('/counselorDash')
          //}
        })
      })
    }
})

app.get('/login', (req, res)=> {
  res.render('login')
})

app.post('/loggingIn', (req, res)=> {
  console.log('req.body', req.body)
  console.log('password', req.body.password)
  knex('users')
      .select('*')
      .where ({
        email: req.body.email
      })
  .then((response)=> {
    console.log('response. This is the user', response)
    console.log('password_hash',response[0].password_hash)
    var passMatch = bcrypt.compareSync(req.body.password, response[0].password_hash)
    if (passMatch === true){
      req.session.userID = response[0].users_id;
      console.log('req.session has been set to', req.session.userID)
      if(response[0].counselor_or_patient === 'No' || response[0].counselor_or_patient === 'no'){
        res.redirect('/text')
      } else {
        res.redirect('/counselorDash')
      }
    } else {
      res.send('I dont know you.')
    }
  })
})

app.get('/counselorDash', (req, res)=> {
  if (req.session.userID){
    knex('users')
        .select('*')
        .where({
          users_id: req.session.userID
        })
    .then((response)=> {
      console.log('response', response)
      if (response[0].counselor_or_patient === 'Yes' || response[0].counselor_or_patient === 'yes'){
        knex('results')
            .join('users', 'results.writer_id', 'users.users_id')
            .select('*')
            .where({
              counselor_or_patient: 'no'
            })
        .then((response)=> {
          console.log('Here, all info from EVERY user will/should be logged', response)
          var sendToFront = {
            first_name: response[0].first_name,
            last_name: response[0].last_name,
            user: req.session.userID
          }
          res.render('counselorDash', sendToFront)
        })
      } else {
        res.send('You are not a counselor.')
      }
    })
  } else {
    res.redirect('/')
  }
})

app.get('/logout', (req, res)=> {
  req.session.destroy(function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log('req.session',req.session)
      res.redirect('/');
    }
  })
})

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
