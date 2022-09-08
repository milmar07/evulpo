// this is a basic connection schema to the corresponding data for the table provided.
// this API KEY will expire after January 2022
// Written by GSoosalu & ndr3svt
const API_KEY = 'AIzaSyCfuQLHd0Aha7KuNvHK0p6V6R_0kKmsRX4';  // my-api : AIzaSyChGEBWS8kiXG2x9ZpxIC5es7Vha5QZoeg
const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";
let exerciseIndex;
let exerciseData = [];
let options = [];
let states = [];
let correct_answer_index;
let chosen_answer_index;
let currentScore = 0;
let currentQuestion = 0;
let startIndex = 0;
  
function handleClientLoad() {
	gapi.load('client', initClient);
}

function initClient() {
	//console.log('start');
	gapi.client.init({
		apiKey: API_KEY,
		discoveryDocs: DISCOVERY_DOCS
	}).then(function () {
		//console.log('starting getExcerciseData')
		getExerciseData();
	}, function(error) {
		//console.log('error with gapi.client.init');
		console.log(JSON.stringify(error, null, 2));
	});
}
/**
 * Task: circulate in a random order through a collection of exercises, solve them, evaluate them and get back the score
 * Since the most basic task is given, we are going to follow it, but there is a lot more that we can do
 * 1) Choose either math, geography or english questions and then give question from that topic
 * 2) We can choose a random question from each topic, but also in the begginign we can choose if we want harder or easier questions, and regarding that we can choose questions either with higher or lower score
 * 3) Also since the data is sordet out, it is easier to work with them, but if they are not, we should firstly sort out all the data, and then follow the suggestions up top.
 * These are only few things i would look trough first, because regarding that we can optimize the data that we are pulling from the database ( sheets )
 * Regarding our decisions we can then optimize the memory and server usage.
 */
function getExerciseData() {
	gapi.client.sheets.spreadsheets.values.get({
		spreadsheetId: '1hzA42BEzt2lPvOAePP6RLLRZKggbg0RWuxSaEwd5xLc',
		range: 'Learning!A1:F10', // This pulls all the data from the sheets
	}).then(async function(response) { // response = data
		//console.log('gathering data finished') 
		//document.getElementById('content').innerText = response.result.values;
		exerciseIndex = randomNumbers(3,9);
		//console.log(exerciseIndex);
		exerciseData.push(response.result.values[exerciseIndex[0]]);
		exerciseData.push(response.result.values[exerciseIndex[1]]);
		exerciseData.push(response.result.values[exerciseIndex[2]]);
		startExercise(currentQuestion);
		//console.log(response); 
		//console.log(response.result.values);
	}, function(response) { //Error
		//console.log('Error with getExcerciseData'); 
		console.log('Error: ' + response.result.error.message);
	});
}


function startExercise(startIndex){
	options = String(exerciseData[startIndex][3]).split(";");
	//console.log(options);
	correct_answer_index = exerciseData[startIndex][4];
	//console.log(correct_answer_index);
	

	let optionsContainer = document.querySelector('#options-wrapper');

	document.getElementById("question").innerHTML = exerciseData[startIndex][2];
	
	for(let i = 0; i < options.length; i++){
		states[i] = false;
		optionsContainer.innerHTML += "<div class ='unchosen option' id='unchosen"+i+"' onclick='toggleChoice("+i+")'><p class='text'>" + options[i]+"</p></div>";
		//document.getElementById("unchosen"+i).onclick = function() {toggleChoice(i)};
	}
	//console.log(options);
}

function myEvaluation(){
	//console.log('an evaluation function place holder');let evMessage = document.querySelector('#evaluation-message')
	let evMessage = document.querySelector('#evaluation-message');
	for(let i = 0; i<options.length; i++){
		if(states[i] && i == correct_answer_index){ 
			//If it is true, then we can add up the score and continue to the next question
			currentScore += 1;
			evMessage.innerHTML = '<p>Awesome!</p>';
			document.getElementById("evaluate").style.display = "none";
			document.getElementById("next").style.display = "inline";
			for(let i = 0; i < options.length; i++){
				document.getElementById("unchosen"+i).onclick = "";
				}
			//console.log(currentScore);
			//console.log('awesome');
			return;
		}
	}
	//If the answer is not true, we are going to just skip to the next question without sumarizing the score
	evMessage.innerHTML = '<p>Not correct, continue to next question</p>';
	document.getElementById("evaluate").style.display = "none";
	document.getElementById("next").style.display = "inline";
	for(let i = 0; i < options.length; i++){
		document.getElementById("unchosen"+i).onclick = "";
		}
	//console.log('tryAgain');

}

function randomNumbers(maxNumber, dataLenght) {
	var arr = [];
	while (arr.length < maxNumber){
		var r = Math.floor(Math.random() * dataLenght) + 1;
		if(arr.indexOf(r) == -1) arr.push(r);
	}
	//console.log(arr);
	return arr;
}

function toggleChoice(index){
	for(let i=0; i<options.length; i++){
			states[i] = false;
		}
	console.log('choise index: ' + index + ' correct answer index ' + correct_answer_index);
	states[index] = true;
	console.log(states);
}

function nextQuestion(){
	currentQuestion += 1;
	if (maxCounter() == true){
		return;
	} else {
		document.getElementById("evaluate").style.display = "inline";
		document.getElementById("next").style.display = "none";
		let evMessage = document.querySelector('#evaluation-message');
		evMessage.innerHTML = '<p></p>';
		for(let i = 0; i < options.length; i++){
		states[i] = false;
		document.getElementById("unchosen"+i).remove();
		}
		startExercise(currentQuestion);
	}
}


function maxCounter(){
	if(currentQuestion > 2){
		document.getElementById("evaluate").style.display = "none";
		document.getElementById("next").style.display = "none";
		let evMessage = document.querySelector('#evaluation-message');
		evMessage.innerHTML = '<p></p>';
		for(let i = 0; i < options.length; i++){
			document.getElementById("unchosen"+i).remove();
		}
		var totalScore = currentScore/3; 
		document.getElementById("question").innerHTML = "Congratulations, you have finished your 3 questions, your total score is " + totalScore*100 + "%";	
		document.getElementById("restartQuestions").style.display = "inline";
		return true;
	} else return false;
}

