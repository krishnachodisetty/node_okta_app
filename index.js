/**
 * @author swamy Kurakula
 */
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json({'type': 'application/*+json'}));

/*app.use(function(req, res, next){
   if(req.get('Accept') == 'application/scim+json; charset=utf-8'){
     var data = "";
     req.on('data', function(chunk){ data += chunk})
     req.on('end', function(){
         req.body = data;
         next();
     })
   } else {
     next();
   }
}); */

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

app.engine('html', require('hogan-express'));
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.get('/', function(req, res) {
    res.status(200).json({
        'ack': 'success',
        'message': 'This is home page..!'
    });
});
app.use('/scim/v2', require('./controllers'));

function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;
    }

    if (port >= 0) {
        return port;
    }

    return false;
};

const port = normalizePort(process.env.PORT || '8080');

const server = app.listen(port, function() {
    console.log(`App running on url at http://localhost:${port}`);
});
