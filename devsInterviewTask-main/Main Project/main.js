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
let correct_answer_score;
let currentScore = 0;
let correctAnswer = 0;
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
		range: 'Learning!A1:F10', // This pulls all the data from the sheets, this can be optimized because now we are pulling all the data from the database, but if we know up front what random questions we are going to ask, for example we are going to pick 3 question with index (1,4,7), then we can just create a query that will only take data for row 1,4,7, reducing the server stress as well as having less junk data to deal with
	}).then(function(response) {
		exerciseIndex = randomNumbers(3,9); // Using the logic from the GitHub reference, where you pick 3 qustions and then evaluate the user using those 3 questions
		exerciseData.push(response.result.values[exerciseIndex[0]]); //This is just bascially putting data into Array().
		exerciseData.push(response.result.values[exerciseIndex[1]]); //Regarding all the options i've mention above, this should be used as a function, because it will be easier if we want to have 4,5 or 6 questions.
		exerciseData.push(response.result.values[exerciseIndex[2]]); //But for now it is fixed like this to 3 questions 

		startExercise(currentQuestion); // This function start the Exercise using currentQustion as a parameter which just counts on what question we currently are.
	}, function(response) { //Error console.log
		console.log('Error: ' + response.result.error.message);
	});
}


function startExercise(startIndex){
	options = String(exerciseData[startIndex][3]).split(";"); //This is just a basic delimiter ; where we split our answer answer into multiple single options
	correct_answer_index = exerciseData[startIndex][4]; // Assigning the correct answer index from the data question we are currently in
	correct_answer_score = exerciseData[startIndex][5];
	let optionsContainer = document.querySelector('#options-wrapper'); 
	
	document.getElementById("question").innerHTML = exerciseData[startIndex][2]; // Changing the starting value of Which is the correct options?  into the actual question
	
	for(let i = 0; i < options.length; i++){
		states[i] = false; // Putting all states into false, until the user click on some choise where then we will call function toggleChoise which will change the value of states for that clicked option into true
		optionsContainer.innerHTML += "<div class ='unchosen option' id='unchosen"+i+"' onclick='toggleChoice("+i+")'><p class='text'>" + options[i]+"</p></div>"; //Depending on how many options there are we are going to cerate as much new elements with options of when clicking on them to call function toggleChoise with the index of that choice
	}
	document.getElementById("evaluate").style.display = "none"; // Not showing the evaluate button so the user cannot press it until selecting one of the answers.
}

function myEvaluation(){ //This functionis used to evaluate either if the answer is corret or not.
	let evMessage = document.querySelector('#evaluation-message');
	for(let i = 0; i<options.length; i++){ // Going trough each question and seeing if the answer user picked is right or wrong
		if(states[i] && i == correct_answer_index){ 
			//If it is true, then we can add up the score and continue to the next question 
			correctAnswer += 1;
			currentScore += parseInt(correct_answer_score,10);
			evMessage.innerHTML = '<p>Awesome! The answer is correct!</p>'; //Noting the user that the answer is correct
			afterEvaluation();
			return;
		}
	}
	//If the answer is not true, we are going to just skip to the next question without sumarizing the score
	evMessage.innerHTML = '<p>Not correct, continue to next question</p>';
	afterEvaluation();
}

function randomNumbers(maxNumber, dataLenght) { //Just choosing the unique random numbers within a range from 0 to dataLenght. We are going to choose maxNumber amount of number
	var arr = [];
	while (arr.length < maxNumber){
		var r = Math.floor(Math.random() * dataLenght) + 1;
		if(arr.indexOf(r) == -1) arr.push(r);
	}
	return arr;
}

function toggleChoice(index){ //Function for when clicking on the choise, to put the state into true and revealing the evaluate button.
	for(let i=0; i<options.length; i++){
			states[i] = false;
		}
	states[index] = true;
	document.getElementById("evaluate").style.display = "inline";
}

function nextQuestion(){ //Function that changes the questions
	currentQuestion += 1; //Counting on what queston we are currently in
	if (maxCounter() == true){ //Looking if we reached the last qustion
		return;
	} else { // Clearing everything up and starting the next question
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


function maxCounter(){ //Looking if the end of the question is reached and providing last page with score and restart button
	if(currentQuestion > 2){ //Clearing everything up
		document.getElementById("evaluate").style.display = "none";
		document.getElementById("next").style.display = "none";
		let evMessage = document.querySelector('#evaluation-message');
		evMessage.innerHTML = '<p></p>';
		for(let i = 0; i < options.length; i++){
			document.getElementById("unchosen"+i).remove();
		}
		var correctPercentage = (correctAnswer/3)*100; //Calculating the percentage of the question user has answer correctly to.
		document.getElementById("question").innerHTML = "Congratulations, you have finished your 3 questions, your total score is " + correctPercentage.toFixed(2) + "%, gaining " +currentScore+" points";	
		document.getElementById("restartQuestions").style.display = "inline";
		return true;
	} else return false;
}

function afterEvaluation(){
	document.getElementById("evaluate").style.display = "none"; //Disabling any further press of evaluate
	document.getElementById("next").style.display = "inline"; // Showing the NEXT button in order to proceed to the next quesstion
	for(let i = 0; i < options.length; i++){ //Disabling additional clicking on the answers
		document.getElementById("unchosen"+i).onclick = "";
	}
}

