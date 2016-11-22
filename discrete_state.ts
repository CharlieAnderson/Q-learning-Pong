/// <reference path="state.ts"/>

class Discrete_State {
    location: [number, number]; // 12x12 grid of ball states
    ball_x: number; // 1 or -1
    ball_y: number; // 0, 1 or -1
    paddle_y: number; // floor(12 * paddle_y / (1 - paddle_height); 12 possible values
    
    constructor(state:State) {
        this.discretize(state);
    }

    discretize(state:State) {
        this.location = [Math.floor(12*state.ball_x), Math.floor(12*state.ball_y)];
        if(state.ball_x < 0) 
            this.ball_x = -1;
        else
            this.ball_x = 1;

        if(state.ball_y < -0.015)
            this.ball_y = -1;
        else if (state.ball_y > 0.015)
            this.ball_y = 1;
        else
            this.ball_y = 0;

        this.paddle_y = Math.floor(12*state.paddle_y/(0.8));
    }
}
