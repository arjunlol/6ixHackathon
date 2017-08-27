module.exports = (text, cb) => {

  var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
  var tone_analyzer = new ToneAnalyzerV3({
    "username": "2dc13dc6-a3d2-47ed-85b6-010e4d00b04a",
    "password": "gShZu1cFjg0P",
    "version_date": '2016-05-19'
  });

  var PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3');
  var personality_insights = new PersonalityInsightsV3({
    "username": "72b36425-826d-4a9a-82da-f72662a5336d",
    "password": "WbCtJRPFti7I",
    version_date: '2016-10-20'

  });

  var paramsPerson = {
    // Get the content items from the JSON file.
    text: text,
    consumption_preferences: false

  };

  var paramsTone = {
    // Get the text from the JSON file.
    text: text,
    sentences: false
  };

  tone_analyzer.tone(paramsTone, function(err, responseTone) {
    if (err){
      console.log('Error:', error);
    }
    else{
      personality_insights.profile(paramsPerson, function(error, responsePerson) {
        if (error)
          console.log('Error:', error);
        else
          cb(responseTone, responsePerson);
        }
      );
    }
  })
}

