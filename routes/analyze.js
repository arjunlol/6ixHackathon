"use strict";
const express = require('express');
const router  = express.Router();
const watson  = require("./watson.js");

module.exports = (knex) => {

  router.post("/", (req, res) => {
    let text = 'IBM is an American multinational technology company headquartered in Armonk, New York, United States, with operations in over 170 countries.'
    watson(text, (response) => {
      console.log(response)
    });
  });

  return router;
}
