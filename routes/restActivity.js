'use strict';
var https = require( 'https' );
var configjson = require( '../public/rest-activity/config.json' );

/**
 * POST Handler for / route of Activity (this is the edit route).
 */
exports.edit = function( req, res ) {
	console.log('>>> EDIT <<<');
	console.log(req.body);
	// Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    activityUtils.logData( req );
    res.status(200).send('Edit');
};

/**
 * POST Handler for /save/ route of Activity.
 */
exports.save = function( req, res ) {
	console.log('>>> SAVE <<<');
	console.log(req.body);
	// Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    activityUtils.logData( req );
    res.status(200).send('Save');
};

/**
 * POST Handler for /publish/ route of Activity.
 */
exports.publish = function( req, res ) {
	console.log('>>> PUBLISH <<<');
	console.log(req.body);
	// Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    activityUtils.logData( req );
    res.status(200).send('Publish');
};

/**
 * POST Handler for /validate/ route of Activity.
 */
exports.validate = function( req, res ) {
	console.log('>>> VALIDATE <<<');
	console.log(req.body);
	// Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    activityUtils.logData( req );
    res.status(200).send('Validate');
};

/**
 * POST Handler for /execute/ route of Activity.
 */
exports.execute = function( req, res ) {
	console.log('>>> EXECUTE <<<');
	console.log(req.body);
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    activityUtils.logData( req );
	res.status(200).send({"result":"0"});
};

/**
 *  GET config.json. Instead of using a static field, we build the initial config.json file using the variables from Heroku.
 */
exports.configJSON = function( req, res ) {
	console.log('>>> get _config.json <<<');
	res.status(200).send(configjson);
};




