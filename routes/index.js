var express = require('express');
var router = express.Router();

const fs = require('fs');
const fsp = require('fs').promises;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Send Message' });
});

router.get('/thank-you', function(req, res, next) {
  res.render('thank-you', { title: 'Thank you' });
});

router.post('/', function (req, res) {

    var now = new Date();
    var nowString = now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate() + "-" + now.getHours() + "-" + now.getMinutes();
    req.body['dateTime'] = nowString;
    var messageData = JSON.stringify(req.body);

    var messageFileName = 'message-' + nowString + '.txt';
    console.log(messageFileName);

    // fs.open(messageFileName, 'w', function (err, file) {
    //   if (err) throw err;
    //   console.log('Saved!');
    // });

    fs.writeFile('./messages/'+ messageFileName, messageData, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
    });

    // Or
    // fs.writeFileSync('/tmp/test-sync', 'Hey there!');

    res.redirect('/thank-you');
});

router.get('/messages', function(req, res, next) {

  var messagesData = ['Why', 'not', 'working?'];

  fs.readdir('./messages', (err, files) => {
    files.forEach(file => {
      console.log(file);
      fs.readFile('./messages/' + file, 'utf8' , (err, data) => {
        if (err) {
          console.error(err)
          return
        }
        messagesData.push(data)
        console.log(messagesData)
      })
    });
  })

  messagesData.push('test')
  console.log(messagesData);
  res.render('messages', { title: 'Your messages', messagesData: messagesData });
});

var messageFiles=['message.txt'], messageData = ['somedata'];

router.get('/messages1', async function(req, res, next) {
  await getMessageFiles()
  await getMessageDataFromFile()

  res.render('messages1', { title: 'Your messages', messageData: messageData, messageFiles: messageFiles });
})

async function getMessageFiles() {
	try {
	   await fs.readdir('./messages', (err, files) => {
        files.forEach(file => {
          console.log('filename ' + file);
          messageFiles.push(file);
        })
    });
    console.log(messageFiles);
	} catch (err) {
		console.log(err);
	}
}

async function getMessageData() {
  console.log("get message data");
	try {
    await messageFiles.forEach(async function(file) {
      console.log(file);
      await getMessageDataFromFile(file)
      // messageData.push("data")
    })
	} catch (err) {
		console.log(err);
	}
}

async function getMessageDataFromFile() {
	try {
    messageFiles.forEach(async function(file) {
      console.log('./messages/' + file);
      await fs.readFile('./messages/' + file, 'utf8' , function (err, data) {
         if (err) {
           console.error('Error: ' + err)
         }
         console.log('data output ' + data);
         messageData.push(data)
         console.log('message data ' + messageData);
       })
     })
    // messageData.push("data")
	} catch (err) {
		console.log(err);
	}
}

router.get('/test', async function(req, res, next) {
  var testDataArray = [];
  var messageDataJSONArray = [];
  var testFileNames = await testDirRead();
  for (const file of testFileNames) {
    const contents = await testFileRead(file, 'utf8');
    console.log(contents);
    testDataArray.push(contents)
    var messageDataJSON = JSON.parse(contents);
    messageDataJSONArray.push(messageDataJSON)
  }
  // var testData = await testFileRead("message.txt");

  res.render('test', { title: 'Your messages', messageDataJSONArray: messageDataJSONArray, testFileNames: testFileNames, testDataArray: testDataArray });
})

async function testDirRead() {
  try {
    return fsp.readdir('./messages');
  } catch (err) {
    console.error('Error occured while reading directory!', err);
  }
}

async function testFileRead(file) {
    const data = await fsp.readFile("./messages/" + file, "binary");
    return new Buffer(data);
}

module.exports = router;
