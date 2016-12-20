'use strict';
// Module Dependencies
// -------------------
var express         = require('express');
var logger          = require('morgan');
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');
var favicon         = require('serve-favicon');
var errorhandler    = require('errorhandler')
var http            = require('http');
var JWT             = require('./lib/jwtDecoder.js');
var path            = require('path');
var request         = require('request');
var routes          = require('./routes');
var restActivity    = require('./routes/restActivity.js');
var activityUtils   = require('./routes/activityUtils.js');
var pkgjson         = require( './package.json' );

var app = express();

var APIKeys = {
    appId           : process.env.JB_APP_ID,
    clientId        : process.env.JB_CLIENT_ID,
    clientSecret    : process.env.JB_CLIENT_SECRET,
    appSignature    : process.env.JB_APP_SIGNATURE,
    authUrl         : process.env.JB_AUTH_URL
};

/**
 * Express midlleware to encode requests using JWT.
 * @param req
 * @param res
 * @param next
 */
function tokenFromJWT( req, res, next ) {
    // Setup the signature for decoding the JWT
    var jwt = new JWT({appSignature: APIKeys.appSignature});

    // Object representing the data in the JWT
    var jwtData = jwt.decode( req );
    req.session.token = jwtData.token;
    next();
}


// Configure Express
app.set('port', process.env.PORT | 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(methodOverride('X-HTTP-Method-Override'));
app.use(favicon(__dirname + '/public/rest-activity/images/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));

// Express in Development Mode
if ('development' == app.get('env')) {
    app.use(errorhandler());
}

/**
 * GET /
 * HubExchange route. Main page of the Marketing Cloud application
 */
app.get('/', routes.index );

/**
 * POST /login
 * HubExchange route. Logs in to Marketing Cloud, using JWT for encryption
 */
app.post('/login', tokenFromJWT, routes.login );

/**
 * POST /logut
 * HubExchange rout. Logs out from Marketing Cloud.
 */
app.post('/logout', routes.logout );


/**
 *  DELETE /activity-data
 *  Clears the array 'logExecuteData', which holds the latest execution details of the activity
 */
app.delete('/activity-data', function( req, res ) {
    // The client makes this request to get the data
    activityUtils.logExecuteData = [];
    res.send( 200 );
});

/**
 * GET /activity-data
 * Returns the content of the array 'logExecuteData', which holds the latest execution details of the activity
 */
app.get('/activity-data', function( req, res ) {
    // The client makes this request to get the data
    if( !activityUtils.logExecuteData.length ) {
        res.send( 200, {data: null} );
    } else {
        res.send( 200, {data: activityUtils.logExecuteData} );
    }
});

/**
 * GET /version
 * Returns the version of the app, set in the package.json file
 */
app.get( '/version', function( req, res ) {
    res.setHeader( 'content-type', 'application/json' );
    res.send(200, JSON.stringify( {
        version: pkgjson.version
    } ) );
} );

/**
 * POST /rest-activity/save
 * Custom Activity SAVE
 */
app.post('/rest-activity/save', restActivity.save );

/**
 * POST /rest-activity/validate
 * Custom Activity VALIDATE
 */
app.post('/rest-activity/validate', restActivity.validate );

/**
 * POST /rest-activity/publish
 * Custom Activity PUBLISH
 */
app.post('/rest-activity/publish', restActivity.publish );

/**
 * POST /rest-activity/execute
 * Custom Activity EXECUTE
 */
app.post('/rest-activity/execute', restActivity.execute );

/**
 * GET /rest-activity/config.json
 * Custom Activity config.json file generation. It takes values from the node env variables (Heroku vars) to dynamically
 * generate the correspondent config file.
 */
app.get('/rest-activity/config.json', restActivity.configJSON );




http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
