/// <reference path="state.ts"/>
var Discrete_State = (function () {
    function Discrete_State(state) {
        this.discretize(state);
    }
    Discrete_State.prototype.discretize = function (state) {
        this.location = [Math.floor(12 * state.ball_x), Math.floor(12 * state.ball_y)];
        if (state.ball_x < 0)
            this.ball_x = -1;
        else
            this.ball_x = 1;
        if (state.ball_y < -0.015)
            this.ball_y = -1;
        else if (state.ball_y > 0.015)
            this.ball_y = 1;
        else
            this.ball_y = 0;
        this.paddle_y = Math.floor(12 * state.paddle_y / (0.8));
    };
    return Discrete_State;
}());
