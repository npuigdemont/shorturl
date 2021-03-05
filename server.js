require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true,
useFindAndModify: false});
console.log(mongoose.connection.readyState);

var Schema = mongoose.Schema;
var urlShortnerSchema = new Schema({
  url: String
});
var urlShortner = mongoose.model("urlShortner", urlShortnerSchema);

let urlExtractor = function(url) {
  var urlSplit = url.split("https://");
  if (urlSplit[1] == undefined) {
    return urlSplit[0].split("/")[0];
  } else {
    return urlSplit[1].split("/")[0];
  }
};


//post url
app.post("/api/shorturl/new", function(req, res) {
  var url = req.body.url;
  var extractedUrl = urlExtractor(req.body.url);
  dns.resolveAny(extractedUrl, (err, address) => {
    if (err) {
      console.log(err, address);
      res.json({ error: "invalid URL" });
    } else {
      var urlRecord = new urlShortner({ url: url });
      urlRecord.save((err, data) => {
        if (err) res.json({ error: "invalid URL" });
        else {
          res.json({ original_url: url, short_url: data._id.toString() });
        }
      });
    }
  });
});