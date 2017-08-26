module.exports = (text, cb) => {

  var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');

  var nlu = new NaturalLanguageUnderstandingV1({
    "username": "8f383956-42d4-443c-9645-b2ac4f2fd966",
    "password": "R1fcyG7OTSc5",
    version_date: NaturalLanguageUnderstandingV1.VERSION_DATE_2017_02_27
  });

  var parameters = {
    'text': text,
    'features': {
      'emotion': {
      },
      'sentiment': {
      }
    }
  }

  nlu.analyze(parameters, function(err, response) {
  if (err)
    cb(err);
  else
    cb(JSON.stringify(response, null, 2));
  });
}

