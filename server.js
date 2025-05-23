const express = require('express');
const app = express();
const formidable = require('formidable');

const fs = require('fs');
const lsdsng = require('./lsdsng');
let port = process.env.PORT;
if (!port) {
  port = 8282;
}
app.use(express.static('public'));
app.get('/', function (req, res){
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/', function (req, res) {
  let d;
  let name;
  let output;
  let form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    output = fields.output;
  });
  form.on('fileBegin', function (name, file){
  });

  form.on('file', function (name, file) {
    fs.readFile(file.path, function(err, data) {
      try {
        d = lsdsng.unpack(data);
      }
      catch (err) {
        res.send(err);
        return;
      }
      if (output == 'html') {
        d = lsdsng.makeHTML(d);
        res.send(d);
      }
      else if (output == 'midi') {
        let name = '';
        for (let i = 0; i < d.name.length; i++) {
          if (String.fromCharCode(d.name[i]) == 'A' || String.fromCharCode(d.name[i]) == 'B' || String.fromCharCode(d.name[i]) == 'C' || String.fromCharCode(d.name[i]) == 'D' || String.fromCharCode(d.name[i]) == 'E' || String.fromCharCode(d.name[i]) == 'F' || String.fromCharCode(d.name[i]) == 'G' || String.fromCharCode(d.name[i]) == 'H' || String.fromCharCode(d.name[i]) == 'I' || String.fromCharCode(d.name[i]) == 'J' || String.fromCharCode(d.name[i]) == 'K' || String.fromCharCode(d.name[i]) == 'L' || String.fromCharCode(d.name[i]) == 'M' || String.fromCharCode(d.name[i]) == 'N' || String.fromCharCode(d.name[i]) == 'O' || String.fromCharCode(d.name[i]) == 'P' || String.fromCharCode(d.name[i]) == 'Q' || String.fromCharCode(d.name[i]) == 'R' || String.fromCharCode(d.name[i]) == 'S' || String.fromCharCode(d.name[i]) == 'T' || String.fromCharCode(d.name[i]) == 'U' || String.fromCharCode(d.name[i]) == 'V' || String.fromCharCode(d.name[i]) == 'W' || String.fromCharCode(d.name[i]) == 'X' || String.fromCharCode(d.name[i]) == 'Y' || String.fromCharCode(d.name[i]) == 'Z' || String.fromCharCode(d.name[i]) == '0' || String.fromCharCode(d.name[i]) == '1' || String.fromCharCode(d.name[i]) == '2' || String.fromCharCode(d.name[i]) == '3' || String.fromCharCode(d.name[i]) == '4' || String.fromCharCode(d.name[i]) == '5' || String.fromCharCode(d.name[i]) == '6' || String.fromCharCode(d.name[i]) == '7' || String.fromCharCode(d.name[i]) == '8' || String.fromCharCode(d.name[i]) == '9') {
            name = name + String.fromCharCode(d.name[i])
          } else {
            name = name + 'x'
          }
        }
        d = lsdsng.makeMIDI(d);          
        console.log(name);
        res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-disposition': 'attachment;filename='+name+'.mid',
        'Content-Length': d.length
        });
        res.end(new Buffer(d, 'binary'));
      }
      else {
        res.send(d); 
      }
    });
  });
});


const listener = app.listen(port, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
