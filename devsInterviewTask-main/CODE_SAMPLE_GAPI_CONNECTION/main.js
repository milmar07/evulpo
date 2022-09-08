// this is a basic connection schema to the corresponding data for the table provided.
// this API KEY will expire after January 2022
// Written by GSoosalu & ndr3svt
const API_KEY = 'AIzaSyCfuQLHd0Aha7KuNvHK0p6V6R_0kKmsRX4';  // my-api : AIzaSyChGEBWS8kiXG2x9ZpxIC5es7Vha5QZoeg
const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";
let exerciseIndex;
let exerciseData;
let options;
let states = [];
let correct_answer_index;
let chosen_answer_index;
  
function handleClientLoad() {
	gapi.load('client', initClient);
}

function initClient() {
	console.log('start');
	gapi.client.init({
		apiKey: API_KEY,
		discoveryDocs: DISCOVERY_DOCS
	}).then(function () {
		console.log('starting getExcerciseData')
		getExerciseData();
	}, function(error) {
		console.log('error with gapi.client.init');
		//console.log(JSON.stringify(error, null, 2) + "error with gapi.client.init");
	});
}

function getExerciseData() {
	gapi.client.sheets.spreadsheets.values.get({
		spreadsheetId: '1hzA42BEzt2lPvOAePP6RLLRZKggbg0RWuxSaEwd5xLc',
		range: 'Learning!A1:F10', // All data from A1 to F10
	}).then(function(response) { // Data
		console.log('gathering data finished')
		document.getElementById('content').innerText = response.values;
		console.log(response);
		console.log(response.result.values);
	}, function(response) { //Error
		console.log('Error with getExcerciseData'); 
		//console.log('Error: ' + response.result.error.message + "error with getExcerciseData");
	});
}

function toggleChoice(index){
	console.log('toggling choices function place holder')
}


function myEvaluation(){
	console.log('an evaluation function place holder')
}

async function getData(){
	let response;
	try {
		response = await gapi.client.sheets.spreadsheets.values.get({
			spreadsheetId: '1hzA42BEzt2lPvOAePP6RLLRZKggbg0RWuxSaEwd5xLc',
			range: 'Learning!A1:A10',
		});
	} catch (err) {
		document.getElementById('content').innerText = err.message;
		console.log(err.message);
		return;
	}
	const range = response.result;
	if (!range || !range.values || range.values.length == 0) {
		document.getElementById('content').innerText = 'No values found.';
		return;
	}

	const output = range.values;
	document.getElementById('content').innerText = output;
}

