// pong game 
/// <reference path="state.ts"/>
/// <reference path="discrete_state.ts"/>
// ============= GLOBALS ====================================================================
var canvas = document.getElementById('game_canvas');
var ball = {
    'x': 500,
    'y': 500,
    'radius': 8,
    'fill': 'red',
    'lineWidth': 2,
    'strokeStyle': 'black'
};
var Q = []; // [Qvalue, N(s, a)]    i, j where i is paddle location [0-11] and j is [0-2] up, down, stay
var training_sessions = 5;
var testing_sessions = 5;
var reward = 0;
var alpha = 1; // learning rate
var C = 100; // learning rate decay (constant that we choose)
var gamma = 0.9; // discount factor (another constant that we choose)
var explore = 15; // maximum attempts to explore 
var totalStates = 10369;
// ============= FUNCTIONS ====================================================================
/*
function render(){

    // clear canvas
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    // draw scene
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var radius = 8;
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI, false);
    context.fillStyle = ball.fill;
    context.fill();
    context.lineWidth = ball.lineWidth;
    context.strokeStyle = ball.strokeStyle;
    context.stroke();
    context.fillStyle = 'black';
    context.fillRect(0, 0, 10, 1000);
    context.fillRect(990, 400, 10, 200);

    // redraw
    reqAnimationFrame(render);
}



function animate(prop, val, duration) {
// The calculations required for the step function
var start = new Date().getTime();
var end = start + duration;
ball['x'] = ball['x'] + (state.velocity_x * duration);
ball['y'] = ball['y'] + (state.velocity_y * duration);
//var current = ball[prop];
//var distance = val - current;

var step = function() {
    // Get our current progres
    var timestamp = new Date().getTime();
    var progress = Math.min((duration - (end - timestamp)) / duration, 1);
    // Update the square's property
    ball['x'] = ball['x'] + (state.velocity_x * val);
    ball['y'] = ball['y'] + (state.velocity_y * val);

    // If the animation hasn't finished, repeat the step.
    if (progress < 1) requestAnimationFrame(step);
};

// Start the animation
return step();

};


function nextFrame(rate: number) {

            ball['x'] = state.ball_x*1000;
            ball['y'] = state.ball_y*1000;
            console.log("circle x  y: "+ball['x']+", "+ball['y']);
};
*/
function initGame() {
    var T = []; // [Qvalue, N(s, a)]    i, j where i is paddle location [0-11] and j is [0-2] up, down, stay
    var test1 = new State(0.5001, 0.5001, 0.03, 0.01, (0.5 - .2 / 2));
    var test2 = new State(0.5, 0.5, 0.03, 0.01, (0.5 - .2 / 2));
    var test3 = new Discrete_State(test1);
    var test4 = new Discrete_State(test2);
    if (test3.equals(test4)) {
        console.log("THEY ARE EQUAL");
    }
    //this.state = new State(0.5, 0.5, 0.03, 0.00, (0.5 - .2 / 2));
    //var d_state = new Discrete_State(state); 
    initMatrix();
    var train_bounces = 0;
    var test_bounces = 0;
    var train_avg = 0;
    var test_avg = 0;
    for (var i = 0; i < training_sessions; i++) {
        train_bounces += startGame();
    }
    console.log(Q);
    train_avg = train_bounces / training_sessions;
    console.log("training average: " + train_avg);
    // TODO: add logic to keep track of average bounces per game or something
    for (var i = 0; i < testing_sessions; i++) {
        test_bounces += startGame();
    }
    console.log(Q);
    test_avg = test_bounces / testing_sessions;
    console.log("testing average: " + test_avg);
}
;
function initMatrix() {
    for (var i = 0; i < 12; i++) {
        Q[i] = [];
        for (var j = 0; j < 3; j++) {
            Q[i][j] = [0, 0];
        }
    }
    // print for debugging
    /*
    for(var i: number = 0; i<12; i++) {
        for(var j: number = 0; j<3; j++) {
            console.log(Q[i][j]);
            console.log(i + " " + j);
        }
    }
    console.log(Q); */
}
;
function startGame() {
    var state = new State(0.5, 0.5, 0.03, 0.01, (0.5 - .2 / 2));
    var currState = new Discrete_State(state);
    var futureState = new Discrete_State(state);
    alpha = 1;
    // var x: number = 0; for animation?
    // var outcome: number = 0; was used as reward
    var i = currState.paddle_y;
    var newI = futureState.paddle_y;
    var j;
    var bounces = 0;
    reward = 0;
    while (reward != -1) {
        // NOT SURE IF THESE ARE DONE IN THE CORRECT ORDER!!!!!!!!!!!!!!!!!!!!!!!!
        currState.discretize(state);
        currState.printState();
        i = currState.paddle_y;
        j = getAction(i);
        // console.log("i, j: " +i +", "+j );
        state.movePaddle(j);
        Q[i][j][1] += 1;
        reward = state.moveBall(state.velocity_x, state.velocity_y);
        if (reward == 1) {
            bounces += 1;
        }
        futureState.discretize(state);
        newI = futureState.paddle_y;
        updateAlpha(i, j);
        updateQ(i, j, reward, newI);
    }
    return bounces;
}
;
function updateAlpha(i, j) {
    alpha = C / (C + Q[i][j][1]);
    // console.log("Alpha: "+alpha);
}
function getMaxQ(i, j) {
    if (i == 11) {
        return Math.max(Q[i][j][0], Q[i - 1][j][0]);
    }
    else if (i == 0) {
        return Math.max(Q[i][j][0], Q[i + 1][j][0]);
    }
    else {
        return Math.max(Q[i - 1][j][0], Q[i][j][0], Q[i + 1][j][0]);
    }
}
function getEstimate(i, j) {
    var newI = 0;
    var max = -99999;
    if (j == 0) {
        newI = i - 1;
        if (newI == -1) {
            newI = 0;
        }
    }
    else if (j == 1) {
        newI = i + 1;
        if (newI == 12)
            newI = 11;
    }
    for (var k = 0; k < 3; k++) {
        if (Q[newI][k][0] >= max)
            max = Q[newI][k][0];
    }
    return max;
}
function bestAction(i, j) {
    // j=0 is up, j=1 is down, j=2 is stay
    if (j == 0) {
        if (i - 1 > 0)
            return Math.max(Q[i - 1][0][0], Q[i - 1][1][0], Q[i - 1][2][0]);
        else
            return Math.max(Q[i - 1][1][0], Q[i - 1][2][0]);
    }
    else if (j == 1) {
        if (i + 1 < 11)
            return Math.max(Q[i + 1][0][0], Q[i + 1][1][0], Q[i + 1][2][0]);
        else
            return Math.max(Q[i + 1][0][0], Q[i + 1][2][0]);
    }
    else {
        if (i < 11 && i > 0)
            return Math.max(Q[i][0][0], Q[i][1][0], Q[i][2][0]);
        else if (i + 1 == 11)
            return Math.max(Q[i][0][0], Q[i][2][0]);
        else if (i - 1 == 0)
            return Math.max(Q[i][1][0], Q[i][2][0]);
    }
}
function getAction(i) {
    var max = -99999;
    var max_action = 0;
    for (var j = 0; j < 3; j++) {
        if (Q[i][j][1] <= explore) {
            //console.log("exploring: "+i+", "+j);
            //console.log(j);
            return j;
        }
        else if (Q[i][j][0] >= max) {
            max = Q[i][j][0];
            max_action = j;
        }
    }
    return max_action;
}
function updateQ(i, j, reward, newI) {
    //Q(state, action) = old Q + a (learning rate) * (reward(t+1) + gamma(discount factor) * maxQ(s(t+1), a) (this is max next state so which is better, up or down?) - Q(s, a))
    // 3 possible actions, up down or stay
    var maxQ = getEstimate(newI, j);
    /*    console.log("CALC Q: "+Q[i][j][0]);
        console.log("CALC Alpha: "+alpha);
        console.log("CALC reward: "+d_state.reward);
        console.log("CALC gamme: "+gamma);
        console.log("CALC maxQ: "+maxQ); */
    var newQ = (Q[i][j][0] + alpha * (reward + gamma * maxQ - Q[i][j][0]));
    Q[i][j][0] = newQ;
    /* console.log("newQ: "+Q[i][j]);
     console.log("newQ: "+newQ);
     console.log(Q); */
}
;
/*
if (canvas.getContext){
    
        var reqAnimationFrame =
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        function(callback) {
            return setTimeout(callback, 1);
        };
        
    //render();
}
*/
initGame();
