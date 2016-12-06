/// <reference path="state.ts"/>
var Discrete_State = (function () {
    function Discrete_State(state) {
        this.discretize(state);
    }
    Discrete_State.prototype.discretize = function (state) {
        this.state = state;
        this.ball_x = Math.floor(12.0 * state.ball_x);
        if (this.ball_x == 12) {
            this.ball_x = 11;
        }
        this.ball_y = Math.floor(12.0 * state.ball_y);
        if (this.ball_y == 12) {
            this.ball_y = 11;
        }
        this.location = [this.ball_x, this.ball_y];
        if (state.velocity_x < 0)
            this.velocity_x = -1;
        else
            this.velocity_x = 1;
        if (state.velocity_y <= -0.015)
            this.velocity_y = -1;
        else if (state.velocity_y >= 0.015)
            this.velocity_y = 1;
        else
            this.velocity_y = 0;
        if (this.location[0] == 12) {
            this.location[0] = 11;
        }
        if (this.location[1] == 12) {
            this.location[1] = 11;
        }
        this.paddle_y = Math.floor(12 * state.paddle_y / (0.8));
        if (this.paddle_y == 12) {
            this.paddle_y = 11;
        }
        this.state_t = [this.ball_x, this.ball_y, this.velocity_x, this.velocity_y, this.paddle_y];
        this.reward = state.reward;
    };
    ;
    Discrete_State.prototype.printState = function () {
        /*    console.log("DISCRETE: velocity_x: "+this.velocity_x + ", " + "velocity_y: "+this.velocity_y);
            console.log("DISCRETE: LOCATION: "+this.location);
            console.log("DISCRETE: PADDLE: "+this.paddle_y); */
    };
    ;
    Discrete_State.prototype.equals = function (d_state) {
        for (var x = 0; x < 5; x++) {
            if (this.state_t[x] != d_state.state_t[x])
                return false;
        }
        return true;
    };
    ;
    return Discrete_State;
}());
