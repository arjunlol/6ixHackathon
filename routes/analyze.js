"use strict";
const express = require('express');
const router  = express.Router();
const watson  = require("./watson.js");

module.exports = (knex) => {

  router.post("/", (req, res) => {
    let text = req.params.text
    watson(text, (err, response) => {
       if (err)
         console.log('error:', err);
       else
         console.log(JSON.stringify(response, null, 2));
    });
  });

  return router;
}
