// pong game 
/// <reference path="state.ts"/>

var canvas = <HTMLCanvasElement>document.getElementById('game_canvas');
var ball = {
    'x': 500,
    'y': 500,
    'radius': 8,
    'fill': 'red',
    'lineWidth': 2,
    'strokeStyle': 'black'
};
var state = new State(0.5, 0.5, 0.03, 0.01, (0.5 - .2 / 2));

if (canvas.getContext){
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
        context.fillRect(980, 100, 10, 200);

        // redraw
        reqAnimationFrame(render);
    }

    var reqAnimationFrame =  
        window.webkitRequestAnimationFrame ||
        window.requestAnimationFrame ||
        function(callback) {
            return setTimeout(callback, 1);
        };

    function animate(prop, val, duration) {
    // The calculations required for the step function
    var start = new Date().getTime();
    var end = start + duration;
    //var current = ball[prop];
    //var distance = val - current;
    var step = function() {
        // Get our current progres
        var timestamp = new Date().getTime();
        var progress = Math.min((duration - (end - timestamp)) / duration, 1);
        // Update the square's property
        ball['x'] = ball['x'] + (state.velocity_x * progress);
        ball['y'] = ball['y'] + (state.velocity_y * progress);

        // If the animation hasn't finished, repeat the step.
        if (progress < 1) requestAnimationFrame(step);
    };
    // Start the animation
    return step();
    };


    render();
    animate('x', 0, 2000);
}