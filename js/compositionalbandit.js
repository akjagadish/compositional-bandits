////////////////////////////////////////////////////////////////////////
//                  JS-CODE FOR Compositonal Bandits                     //
//                       AUTHOR: AKSHAY JAGADISH                       //
//                    MPI TUEBINGEN,  April 2021                    //
////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
//INTIALIZE 
////////////////////////////////////////////////////////////////////////

//data storage ref
var myDataRef = [], //new Firebase('https://exampleoffirebase.firebaseio.com/'),
  nReps = 1, // number of training repeats (of tasks)
  ntrials = 5,//number of trials
  //nTasks = 3,// number of Tasks
  narms = 6, // number of arms
  trial = 0,//trial counter
  subtask = 0,//subtask counter
  task = 0, // task counter
  out = 0,//outcome
  totalscore = 0,//total score
  percentrew = 0,//percent reward
  index = 0,//index
  age = 0,//age of participant
  gender = 0,//gender of particpant
  recontact = false,//do they want to be recontacted
  instcounter = 0,//instruction counter
  overallscore = 0,//overall score
  overallpercentreward = 0, // overall percent reward
  xcollect = [],//collecting the selected position
  ycollect = [],//collecting the returned output
  regretcollect = [],//collecting the regret
  timecollect = [],//collection the timestamps
  envscollect = [],//collecting the chosen functions
  fdata,//for loading gp samples
  x = [],//underlying position
  y = [],//underlying outcome
  timeInMs = 0,//reaction time
  cond = permute(['compositional'])[0],// 'compositional','noncompositional'])[0];
  linstruc = ['pos', 'neg'],
  perstruc = ['even', 'odd'],
  compositionalstruc = ['poseven', 'posodd', 'negeven', 'negodd'],
  nfuns = linstruc.length + perstruc.length,
  fullurl = document.location.href

const base_pay = 2.0

var condition = [];
if (cond == 'compositional') {
  var nSubtasksPerTask = 3
  const nTrain = nReps * nfuns
  const nEval = 1 * nfuns
  var nTasks = nTrain + nEval
  // generate condition
  for (i = 0; i < (nReps+1); i++) {
    for (j = 0; j < linstruc.length; j++) {
      var lin = linstruc[j];
      for (k = 0; k < perstruc.length; k++) {
        var per = perstruc[k];
        functions = []
        functions = makeCompositionBlocks(functions, lin, per)
        condition.push(functions)
      }
    }
  } 
  // concat eval tasks
  var eval_condition = permute(condition.slice(nTrain, nTasks))
  condition = permute(condition.slice(0, nTrain))
  condition = condition.concat(eval_condition)
}

if (cond == 'noncompositional') {
  var nSubtasksPerTask = 1
  const nTrain = nReps * nfuns 
  const nEval = 1 * nfuns
  var nTasks = nTrain + nEval
  for (i=0; i<(nReps+1); i++) {
    for (j=0; j<nfuns; j++){
      functions = []
      functions.push(compositionalstruc[j]);
      condition.push(functions);
    }
  }
  // concat eval tasks
  var eval_condition = permute(condition.slice(nTrain, nTasks))
  condition = permute(condition.slice(0, nTrain))
  condition = condition.concat(eval_condition)
}

if (cond == 'loocompositional') {
  var nSubtasksPerTask = 3
  const nTrain = nReps * (nfuns-1) 
  const nEval = 1 * 1
  var nTasks = nTrain + nEval
  for (j = 0; j < linstruc.length; j++) {
    var lin = linstruc[j];
    for (k = 0; k < perstruc.length; k++) {
      var per = perstruc[k];
        for (i = 0; i < nReps; i++) {
        functions = []
        functions = makeCompositionBlocks(functions, lin, per)
        condition.push(functions)
      }
    }
  }
  // concat eval tasks
  var eval_condition = condition.slice(nTrain, nTasks)
  condition = permute(condition.slice(0, nTrain))
  condition = condition.concat(eval_condition)
}

// total number of tasks
const nSubtasks = nTasks * nSubtasksPerTask
change('casino_id', nSubtasksPerTask)

//////// Generate blocks
function makeCompositionBlocks(functions, lin, per) {
  var linper = lin + per
  functions = functions.concat(lin);
  functions = functions.concat(per);
  functions = functions.concat(linper);
  return functions
}

var features;
var featureorder = Math.floor(Math.random() * 2);

if (cond == 'compositional' || cond == 'loocompositional') {
  if (featureorder == 0) {
    task_features = ['contextG/', 'contextR/', 'contextRG/'] 
  }
  if (featureorder == 1) {
    task_features = ['contextR/', 'contextG/', 'contextRG/'] 
  }
}

if (cond == 'noncompositional') {
  task_features = ['contextRG/', 'contextRG/', 'contextRG/'];
}

features = Array(nTasks).fill(task_features)

// choosing functions for each subtask from stored functions
var gpn = [];
for (var i = 0; i <= 100; i++) {
  gpn.push(i);
}
gpn = permute(gpn).slice(0, nSubtasks);

function load_rewards(fdata){
  //x positions
  x = fdata.x;
  //y outcomes
  y = fdata.y;
}

var letters = '<input type="image" src="letters/',//the letter
  pspecs = '.png"  width="115" height="115"',//size of box
  //gpn=randomNum(1,100);//random function selection
  jsonstring = "envs/" + condition[0][2] + "/" + condition[0][subtask%nSubtasksPerTask] + gpn[task] + ".json";//get the string of uploaded json

var jqxhr = $.getJSON(jsonstring, function (data) {
  load_rewards(data)});
//borders for selections
var borders = ['border="1">', 'border="1">', 'border="1">', 'border="1">', 'border="1">', 'border="1">'];//, 'border="1">', 'border="1">'];
letter = letters + features[task][subtask % nSubtasksPerTask]
//leter boxes and their borders
//var b1 = letter + 'A' + pspecs + borders[0],
var b2 = letter + 'S' + pspecs + borders[0],
  b3 = letter + 'D' + pspecs + borders[1],
  b4 = letter + 'F' + pspecs + borders[2],
  b5 = letter + 'J' + pspecs + borders[3],
  b6 = letter + 'K' + pspecs + borders[4],
  b7 = letter + 'L' + pspecs + borders[5];
  //b8 = letter + ';' + pspecs + borders[7];

//generating lists to collect the outcomes
for (var i = 0; i < nSubtasks; i++) {
  //outcomes of arm positions
  xcollect[i] = Array.apply(null, Array(0)).map(Number.prototype.valueOf, -99);
  //outcome of y position
  ycollect[i] = Array.apply(null, Array(0)).map(Number.prototype.valueOf, -99);
  //timestamp collection
  timecollect[i] = Array.apply(null, Array(0)).map(Number.prototype.valueOf, -99);
  //regrets from each trial
  regretcollect[i] = Array.apply(null, Array(0)).map(Number.prototype.valueOf, -99);
}


////////////////////////////////////////////////////////////////////////
//CREATE HELPER FUNCTIONS
////////////////////////////////////////////////////////////////////////

//function to hide one html div and show another
function clickStart(hide, show) {
  document.getElementById(hide).style.display = 'none';
  document.getElementById(show).style.display = 'block';
  window.scrollTo(0, 0);
}

// 
function ConditionSwitch(hide) {
  document.getElementById(hide).style.display = 'none';
  if (cond == 'compositional' || cond == 'loocompositional'){
    document.getElementById('page7a').style.display = 'block';
  } 
  if (cond == 'noncompositional'){
    document.getElementById('page7b').style.display = 'block';
  }
  window.scrollTo(0, 0);
  
}

//changes inner HTML of div with ID=x to y
function change(x, y) {
  document.getElementById(x).innerHTML = y;
}

//Hides div with id=x
function hide(x) {
  document.getElementById(x).style.display = 'none';
}

//shows div with id=x
function show(x) {
  document.getElementById(x).style.display = 'block';
  window.scrollTo(0, 0);
}

//creates a random number between min and max
function randomNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

//permute a list
function permute(o) {
  for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
};

//Display a float to a fixed percision
function toFixed(value, precision) {
  var precision = precision || 0,
    power = Math.pow(10, precision),
    absValue = Math.abs(Math.round(value * power)),
    result = (value < 0 ? '-' : '') + String(Math.floor(absValue / power));

  if (precision > 0) {
    var fraction = String(absValue % power),
      padding = new Array(Math.max(precision - fraction.length, 0) + 1).join('0');
    result += '.' + padding + fraction;
  }
  return result;
}

//standard normal using Box-Mueller algorithm
function myNorm() {
  var x1, x2, rad, c;
  do {
    x1 = 2 * Math.random() - 1;
    x2 = 2 * Math.random() - 1;
    rad = x1 * x1 + x2 * x2;
  } while (rad >= 1 || rad == 0);
  c = Math.sqrt(-2 * Math.log(rad) / rad);
  return (x1 * c);
};

////////////////////////////////////////////////////////////////////////
//Instruction Check
////////////////////////////////////////////////////////////////////////
// var turkid = 0;
// function gettingstarted() {
//   turkid = document.getElementById("mturk").value;
//   if (turkid == "WorkerID") {
//     alert("Please provide your Mechanical Turk Worker ID. We will need your ID for paying the bonus.");
//   } else {
//     clickStart("page3", "page4");
//   }
// }


// extract URL parameters (FROM: https://s3.amazonaws.com/mturk-public/externalHIT_v1.js)
function turkGetParam(name) {
  var regexS = "[\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  if (typeof fullurl == "undefined"){ 
    console.log("fullurl, who?")
    return Math.floor(Math.random() * 10000);     
  } else {
     var tmpURL = fullurl;
     var results = regex.exec(tmpURL);
     if (results == null) {
         return Math.floor(Math.random() * 10000);
     } else {
         return results[1];
  }
 }
}
var turkid = turkGetParam('workerId');  

function instructioncheck() {
  //check if correct answers are provided
  if (document.getElementById('icheck1').checked) { var ch1 = 1 }
  if (document.getElementById('icheck2').checked) { var ch2 = 1 }
  if (document.getElementById('icheck3').checked) { var ch3 = 1 }
  if (document.getElementById('icheck4').checked) { var ch4 = 1 }
  //are all of the correct
  var checksum = ch1 + ch2 + ch3 + ch4;
  if (checksum === 4) {
    //if correct, continue
    begintrial();
    clickStart('page8', 'page9');
    //alert
    alert('Great, you have answered all of the questions correctly. The study will now start.');
  } else {
    instcounter++;
    //if one or more answers are wrong, raise alert box
    alert('You have answered some of the questions wrong. Please try again.');
    //go back to instructions
    clickStart('page8', 'page2');
  }
}

////////////////////////////////////////////////////////////////////////
//Experiment
////////////////////////////////////////////////////////////////////////

//this function initializes a trial
function begintrial() {
  //only allowing for one press
  var returnpressed = 0;
  //initialize time count
  timeInMs = Date.now()
  //get the pressed key
  $(document).keypress(function (e) {
    //if the key equals A
    // if (e.which == 97 & returnpressed == 0) {
    //   //indicate that something has been pressed          
    //   returnpressed = 1;
    //   //get the time that has passed
    //   timeInMs = Date.now() - timeInMs;
    //   //call the function for that position
    //   myfunc(0);
    // }
    //same spiel if key equals S      
    if ((e.which == 115 || e.which == 83) & returnpressed == 0) {
      returnpressed = 1;
      timeInMs = Date.now() - timeInMs;
      myfunc(0);
    }
    //same spiel if key equals D      
    if ((e.which == 100 || e.which == 68) & returnpressed == 0) {
      returnpressed = 1;
      timeInMs = Date.now() - timeInMs;
      myfunc(1);
    }
    //same spiel if key equals F       
    if ((e.which == 102 || e.which == 70) & returnpressed == 0) {
      returnpressed = 1;
      timeInMs = Date.now() - timeInMs;
      myfunc(2);
    }
    //same spiel if key equals J
    if ((e.which == 106 || e.which == 74) & returnpressed == 0) {
      returnpressed = 1;
      timeInMs = Date.now() - timeInMs;
      myfunc(3);
    }
    //same spiel if key equals K      
    if ((e.which == 107 || e.which == 75) & returnpressed == 0) {
      returnpressed = 1;
      timeInMs = Date.now() - timeInMs;
      myfunc(4);
    }
    //same spiel if key equals L      
    if ((e.which == 108 || e.which == 76) & returnpressed == 0) {
      returnpressed = 1;
      timeInMs = Date.now() - timeInMs;
      myfunc(5);
    }
    // //same spiel if key equals ;
    // if (e.which == 59 & returnpressed == 0) {
    //   returnpressed = 1;
    //   timeInMs = Date.now() - timeInMs;
    //   myfunc(7);
    // }
  } 
  ); 
}

//function to draw the letter boxes into the HTML
function drawletters() {
  // change('arm1', b1);
  change('arm2', b2);
  change('arm3', b3);
  change('arm4', b4);
  change('arm5', b5);
  change('arm6', b6);
  change('arm7', b7);
  //change('arm8', b8);
}

//do this once at start
drawletters();


// function drawfeature() {
//   // const task = Math.floor((subtask)/nSubtasksPerTask)
//   if (features[task][subtask % nSubtasksPerTask] == 'both') { var spec = '.png"  width="230" height="115"' };
//   if (features[task][subtask % nSubtasksPerTask] != 'both') { var spec = '.png"  width="115" height="115"' };
//   var f = letter + features[task][subtask % nSubtasksPerTask] + spec + borders[0];
//   change('feature', f);
//   letter = letters + features[task][subtask % nSubtasksPerTask]
// }

//do this once at start
//drawfeature();


//funmction that exectutes the bandit
function myfunc(inp) {
  //loop through all possible locations
  for (i = 0; i < narms; i++) {
    //if the chosen location matches possible location
    if (inp == i) {
      //return output for that location plus normally distributed noise
      out = y[i] + myNorm() * 0.1;
      //collect corresponding location, it's only important for R to JS differences
      xcollect[subtask][trial] = x[i];
      //collect regrets
      regretcollect[subtask][trial] = Math.max(...y) - y[i];
      //percent rewards
      percentrew = percentrew + y[i]/Math.max(...y);
    }
  }
  //collect returned value
  ycollect[subtask][trial] = out;
  //collect reaction time
  timecollect[subtask][trial] = timeInMs;
  //mark the selected option
  borders[inp] = 'border="4">';
  //update letter boxes
  //b1 = letter + 'A' + pspecs + borders[0];
  b2 = letter + 'S' + pspecs + borders[0];
  b3 = letter + 'D' + pspecs + borders[1];
  b4 = letter + 'F' + pspecs + borders[2];
  b5 = letter + 'J' + pspecs + borders[3];
  b6 = letter + 'K' + pspecs + borders[4];
  b7 = letter + 'L' + pspecs + borders[5];
  //b8 = letter + ';' + pspecs + borders[7];
  //draw the option with their letters, now the chosen one has a thicker frame
  drawletters();
  //show rounded value
  var outshow = toFixed(out, 1);
  //display on screen
  change('outcome', "You just got " + outshow + " coins");
  //set a time out, after 2 seconds start the next trial
  setTimeout(function () { nexttrial(); }, 2000);
}


function nexttrial() {
  //check if trials are smaller than the maximum trial number
  if (trial + 1 < ntrials) {
    //set the borders back to normal
    borders = ['border="1">', 'border="1">', 'border="1">', 'border="1">', 'border="1">', 'border="1">', 'border="1">', 'border="1">'];
    //change the letters again
    //b1 = letter + 'A' + pspecs + borders[0];
    b2 = letter + 'S' + pspecs + borders[0];
    b3 = letter + 'D' + pspecs + borders[1];
    b4 = letter + 'F' + pspecs + borders[2];
    b5 = letter + 'J' + pspecs + borders[3];
    b6 = letter + 'K' + pspecs + borders[4];
    b7 = letter + 'L' + pspecs + borders[5];
    //b8 = letter + ';' + pspecs + borders[7];
    //draw options and their letters
    drawletters();
    //begin new trial
    begintrial();
    //track total score
    totalscore = totalscore + out;
    //to be inserted total score
    var inserts = 'Total Coins Earned: ' + toFixed(totalscore, 1);
    //show total score on screen
    change('score', inserts);
    //increment trial number
    trial++;
    //to be inserted number of trials left
    var insertt = 'Number of trials left: ' + (ntrials - trial);
    //show on screen
    change('remain', insertt);
    //change ooutcome back to please choose an option
    change('outcome', "Please choose an option!");
  }
  //if trial numbers exceed the total number, check if more blocks are available
  else if (trial + 1 == ntrials & subtask + 1 < nSubtasks) {
    totalscore = totalscore + out;
    //compute percent regret
    overallpercentreward = (percentrew/(ntrials*nSubtasksPerTask))*100
    //tell them that this subtask is over
    if ((subtask + 1) % nSubtasksPerTask == 0) {
      // ALERT METHOD
      //"You scored " + toFixed(totalscore, 1) + " in this task.
      //alert("Task " + (task+1) + " out of " + nTasks + " is over. You achieved " + toFixed(overallpercentreward, 0) + 
      //" % of best total score. Please press return to continue with the next task.")
      // SUBPAGE METHOD
      const taskcomplete  = "Casino " + (task+1) + " out of " + nTasks + " now visited!" 
      const rewardtext =  "You earned " + toFixed(overallpercentreward, 0) + "% of the maximum possible coins in the last casino.";
      var moneynow = money_earned(base_pay, overallscore+totalscore);
      const currentmoney = "Total money earned so far $" + toFixed(moneynow, 1);
      clickStart('page10', 'showperformance');
      
      //show total score and num of tasks completed on screen
      change('percentreward', rewardtext);
      change('numtasks', taskcomplete);
      change('realmoney', currentmoney);
    }
    //start next subtask
    nextblock();
  } else {
    //Otherwise --if blocks exceed total subtask number, then the experiment is over
    alert("The experiment is over. You will now be directed to the next page.")
    clickStart('page10', 'page11');
  }
}

//function to initialize next subtask
function nextblock() {
  //collect the used function number
  envscollect = envscollect.concat(jsonstring);
  //borders back to normal
  borders = ['border="1">', 'border="1">', 'border="1">', 'border="1">', 'border="1">', 'border="1">', 'border="1">', 'border="1">'];
  //increment subtask number
  subtask++;
  letter = letters + features[task][subtask % nSubtasksPerTask]
  //new letters and boxes
  // b1 = letter + 'A' + pspecs + borders[0];
  b2 = letter + 'S' + pspecs + borders[0];
  b3 = letter + 'D' + pspecs + borders[1];
  b4 = letter + 'F' + pspecs + borders[2];
  b5 = letter + 'J' + pspecs + borders[3];
  b6 = letter + 'K' + pspecs + borders[4];
  b7 = letter + 'L' + pspecs + borders[5];
  // b8 = letter + ';' + pspecs + borders[7];
  //draw options
  drawletters();
  //begin a new trial
  begintrial();
  
  //drawfeature();
  //set trial number back to 0
  trial = 0;
  if ((subtask) % nSubtasksPerTask == 0) {
    //update overall score
    overallscore = overallscore + totalscore;
    // percent reward set back to 0 
    percentrew = 0;
    //total score back to 0
    totalscore = 0;
    task++;
    } else {
      totalscore = totalscore + out; 
  }
  //get json of that environment
  jsonstring = "envs/" + condition[task][2] + "/" + condition[task][subtask%nSubtasksPerTask] + gpn[task] + ".json";
  jqxhr = $.getJSON(jsonstring, function (data) {load_rewards(data)});
  // total score back to 0
  // totalscore = 0;
  //insert total score
  var inserts = 'Total Coins Earned: ' + toFixed(totalscore, 1);
  //put on screen
  change('score', inserts);
  //number of trials left
  var insertt = 'Number of trials left: ' + (ntrials - trial);
  //on screen
  change('remain', insertt);
  //ask them to choose an outcome
  change('outcome', "Please choose an option!");
}

////////////////////////////////////////////////////////////////////////
//Demographics & Finish
////////////////////////////////////////////////////////////////////////
//sets the selected gender
function setgender(x) {
  gender = x;
  return (gender)
}

//sets the selected age
function setage(x) {
  age = x;
  return (age)
}

function setrecontact(x) {
  recontact = x;
  return (recontact)
}

function saveData(filedata){
  var filename = "./data/" + turkid + ".json";  
  $.post("save_data.php", {postresult: filedata + "\n", postfile: filename })
}

function money_earned(base, coins_earned)
{ money = base + coins_earned*0.001;
  money = toFixed(money, 2)
  return (money)
}
function mysubmit() {
  //add final envscollected
  envscollect = envscollect.concat(jsonstring);
  //claculate number of mined emeralds overall
  var presenttotal = 'You won a total of ' + toFixed(overallscore, 1) + ' BC coins.';
  //calculate money earned
  var moneyp = money_earned(base_pay, overallscore)
  var presentmoney = 'This equals a total payment of $' + moneyp + '. The $2 for your participation will be paid immediately. The rest will be paid within the next few days.';
  //show score and money
  change('result', presenttotal);
  change('money', presentmoney);
  var experiment = "compbandits1";
  //create dictionary with keys values
  myDataRef = {
    "actions": xcollect, "rewards": ycollect, "times": timecollect, "condition": condition, 
    "envs": envscollect, "money": money, "age": age, "gender": gender,
    "experiment": experiment, "instcounter": instcounter, "turkid": turkid };
  // save data as JSON
  saveData(JSON.stringify(myDataRef))
  //change page
  clickStart('page11', 'page12');
}
////////////////////////////////////////////////////////////////////////
//The END
////////////////////////////////////////////////////////////////////////
