// pong game 
/// <reference path="state.ts"/>
/// <reference path="discrete_state.ts"/>


// ============= GLOBALS ====================================================================
var canvas = <HTMLCanvasElement>document.getElementById('game_canvas');
var ball = {
    'x': 500,
    'y': 500,
    'radius': 8,
    'fill': 'red',
    'lineWidth': 2,
    'strokeStyle': 'black'
};
var Q: Array<Array<[number, number]>> = []; // [Qvalue, N(s, a)]    i, j where i is paddle location [0-11] and j is [0-2] up, down, stay
var training_sessions: number = 100000;
var testing_sessions: number = 1000;
var reward: number = 0;
var alpha: number = 1; // learning rate
var C: number = 50; // learning rate decay (constant that we choose)
var gamma: number = 0.9; // discount factor (another constant that we choose)
var explore: number = 15; // maximum attempts to explore 
var totalStates: number = 10368;

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
        initMatrix();
        var train_bounces: number = 0;
        var test_bounces: number = 0;
        var train_avg: number = 0;
        var test_avg: number = 0;
        var bounces: number = 0;
        for(var i: number = 0; i<training_sessions; i++) {
            bounces = startGame();
            train_bounces += bounces;
        }
        console.log(Q);
        for(var i: number = 0; i<testing_sessions; i++) {
            bounces = startGame();
            console.log("test game: "+i+" bounces: "+bounces);
            test_bounces += bounces;
        }
        train_avg = train_bounces/training_sessions;
        test_avg = test_bounces/testing_sessions;
        console.log("training average: "+train_avg);
        console.log("testing average: "+test_avg);
    };

    function initMatrix() {
        for(var i: number = 0; i<totalStates; i++) { // total discrete states
            Q[i] = [];
            for(var j: number = 0; j<3; j++) { // 3 actions, up, down and stay
                Q[i][j] = [0, 0];
            }
        }
    };

    function getIndex(d_state: Discrete_State) {
        var coordinateFactor = (d_state.ball_y*12+d_state.ball_x)*6*12; // y is row, x is column
        var xVelocityFactor = d_state.velocity_x;
        if(xVelocityFactor == -1)
            xVelocityFactor = 0;
        var yVelocityFactor = d_state.velocity_y + 1;
        var velocityFactor = (xVelocityFactor*3 + yVelocityFactor)*12;
        return velocityFactor + d_state.paddle_y + coordinateFactor;
    }

    function startGame() {
        var state: State = new State(0.5, 0.5, 0.03, 0.01, (0.5 - .2 / 2));
        var currState: Discrete_State = new Discrete_State(state);
        var futureState: Discrete_State = new Discrete_State(state);
        alpha = 1;
       // var x: number = 0; for animation?
       // var outcome: number = 0; was used as reward
        var i: number = getIndex(currState);
        var newI: number = getIndex(futureState);
        var j: number;
        var bounces: number = 0;
        reward = 0;

        while(reward != -1) {   
            currState.discretize(state);
            i = getIndex(currState);
            j = getAction(i);

           // console.log("i, j: " +i +", "+j );
            state.movePaddle(j);
            reward = state.moveBall(state.velocity_x, state.velocity_y); 
            if(reward==1) {
                bounces +=1;
            }
            futureState.discretize(state);
            newI = getIndex(futureState)

            updateAlpha(i, j);
            updateQ(i, j, reward, newI);
            /*             
            setTimeout(
                function() {
                    nextFrame(1);
                    console.log("outcome: "+outcome, "x: "+x);
                    x++; 
                }, 100*x
            );      
            */     
        }
        return bounces;
    };

    function updateAlpha(i: number, j: number) {
        alpha = C/(C+Q[i][j][1]);
        Q[i][j][1]+=1;
       // console.log("Alpha: "+alpha);
    }

    function getMaxQ(i: number, j:number) {    
        if(i==11) {
            return Math.max(Q[i][j][0], Q[i-1][j][0]);
        }
        else if(i==0) {
            return Math.max(Q[i][j][0], Q[i+1][j][0]);
        }
        else {
            return Math.max(Q[i-1][j][0], Q[i][j][0], Q[i+1][j][0]);
        }
    }

    function getEstimate(i: number) {     // i is the state we cae from, j is the action we chose, i' will be the state j takes us to, j' is the action with best utility
        var max = -99999;
        //console.log(i);
        for(var j=0; j<3; j++) {
            if(Q[i][j][0] >= max) {
                max = Q[i][j][0];
            }
        } 
        return max;
    }

    function getAction(i: number) {
        var max: number = -99999;
        var max_action: number = 0;
        for(var j: number = 0; j < 3; j++) {
            if(Q[i][j][1] <= explore) {
                return j;
            }
            else if(Q[i][j][0] >= max) {
                max = Q[i][j][0];
                max_action = j;                
            }
        }
        return max_action;
    }
    function updateQ(i: number, j:number, reward:number, newI:number) {
        //Q(state, action) = old Q + a (learning rate) * (reward(t+1) + gamma(discount factor) * maxQ(s(t+1), a) (this is max next state so which is better, up or down?) - Q(s, a))
        // 3 possible actions, up down or stay
        var maxQ: number = getEstimate(newI);
    /*    console.log("CALC Q: "+Q[i][j][0]);
        console.log("CALC Alpha: "+alpha);
        console.log("CALC reward: "+d_state.reward);
        console.log("CALC gamme: "+gamma);
        console.log("CALC maxQ: "+maxQ); */

        var newQ: number = (Q[i][j][0] + alpha *(reward + gamma * maxQ - Q[i][j][0]));
        Q[i][j][0] = newQ;
       /* console.log("newQ: "+Q[i][j]);
        console.log("newQ: "+newQ);
        console.log(Q); */
        
    };

    
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
