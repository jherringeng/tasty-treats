// Modules the app uses. Express for routing, fetch for recaptcha, stringify for stringifying a query
var express = require('express');
var router = express.Router();
const fetch = require('node-fetch');
const { stringify } = require('querystring');

// File readers / writers. fsp allows promises for async / await
const fs = require('fs');
const fsp = require('fs').promises;

/* GET home page. Actually it's the messages page as home page and route were added later
Other routes for pages including a thank you page when sending message */
router.get('/', function(req, res, next) {
  var error = "";
  res.render('index', { title: 'Send Message', error: error });
});

router.get('/home', function(req, res, next) {
  res.render('home', { title: 'Tasty Treats' });
});

router.get('/thank-you', function(req, res, next) {
  res.render('thank-you', { title: 'Thank you' });
});

// Handles the form after submit button pressed. async as uses await (promises)
router.post('/submit', async function (req, res, next) {

  // If no recaptcha it returns with error displayed
  if (!req.body['g-recaptcha-response']) {
    var error = "Error: Please complete recaptcha to message us.";
    res.render('index', { title: 'Send Message', error: error });
  } else {

    // recaptcha secret key
    const secretKey = '6Lcp7HQaAAAAADZ5IGJsK0xpmuvkngErhQIMvQQF';

    // Verify URL
    const query = stringify({
      secret: secretKey,
      response: req.body['g-recaptcha-response'],
      remoteip: req.connection.remoteAddress
    });
    const verifyURL = `https://google.com/recaptcha/api/siteverify?${query}`;

    // Make a request to verifyURL. Async so uses await
    const body = await fetch(verifyURL)
    .then(response => response.json());

    console.log(body);

    // Checks to see if recaptcha valid (those naughty bots!). Returns to message page with error if not
    if (body.success !== undefined && !body.success) {
      var error = "Error: Recaptcha failed.";
      res.render('index', { title: 'Send Message', error: error });
    }
    else {

      // Date for adding to message data and file name
      // Add date and time with processing if < 10 i.e. 9 becomes 09
      var now = new Date();
      var month = addLeadingZero(now.getMonth()); var date = addLeadingZero(now.getDate());
      var hour = addLeadingZero(now.getHours()); var minute = addLeadingZero(now.getMinutes());
      var nowString = now.getFullYear() + "-" + month + "-" + date + "-" + hour + "-" + minute;
      req.body['dateTime'] = nowString;

      // Processing of subscribed key
      if ("subscribed" in req.body) {
        req.body['subscribed'] = "Subscribed";
      } else {
        req.body['subscribed'] = "Not Subscribed";
      }

      // Remove recaptcha response before stringify
      delete req.body['g-recaptcha-response'];
      // Stringify data for saving to text file
      var messageData = JSON.stringify(req.body);

      // Add data to filename for unique name and easier sorting
      // Note: likely error if 2 files are uploaded in same minute
      var messageFileName = 'message-' + nowString + '.txt';

      // Writes the file. Not using await as not necessary
      fs.writeFile('./messages/'+ messageFileName, messageData, function(err) {
      if(err) {
          return console.log(err);
      }
      console.log("The file was saved!");
      });

      // Redirect to thank you page
      res.redirect('/thank-you');
    }

  }

});

// Adds leading zero to months, dates, hours < 10 
function addLeadingZero(num) {
  if (num < 10) {
    return "0" + num;
  } else {
    return num;
  }
}

router.get('/messages', async function(req, res, next) {
  var testDataArray = [];
  var messageDataJSONArray = [];
  var messageFileNames = await getDirContents();
  for (const file of messageFileNames) {
    const contents = await getFileContents(file, 'utf8');
    testDataArray.push(contents)
    var messageDataJSON = JSON.parse(contents);
    messageDataJSONArray.push(messageDataJSON)
  }
  messageDataJSONArray.sort( compareDates );

  res.render('messages', { title: 'Your messages', messageDataJSONArray: messageDataJSONArray,  testDataArray: testDataArray });
})

async function getDirContents() {
  try {
    return fsp.readdir('./messages');
  } catch (err) {
    console.error('Error occured while reading directory!', err);
  }
}

async function getFileContents(file) {
    const data = await fsp.readFile("./messages/" + file, "binary");
    return new Buffer(data);
}

function compareDates( a, b ) {
  if ( a.dateTime > b.dateTime ){
    return -1;
  }
  if ( a.dateTime < b.dateTime ){
    return 1;
  }
  return 0;
}

module.exports = router;
