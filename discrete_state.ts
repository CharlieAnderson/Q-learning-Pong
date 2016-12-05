/// <reference path="state.ts"/>


class Discrete_State {
    location: [number, number]; // 12x12 grid of ball states
    velocity_x: number; // 1 or -1
    velocity_y: number; // 0, 1 or -1
    ball_x: number;
    ball_y: number;
    paddle_y: number; // floor(12 * paddle_y / (1 - paddle_height); 12 possible values
    grid_square_w: number = (1.0/12.0);
    grid_square_h: number = (1.0/12.0);
    reward: number;
    state_t: [number, number, number, number, number]; 
    constructor(state:State) {
        this.discretize(state);
    }

    discretize(state:State) {
        this.ball_x = Math.floor(12.0*state.ball_x);
        this.ball_y = Math.floor(12.0*state.ball_y);
        this.location = [this.ball_x, this.ball_y];
        if(state.velocity_x < 0) 
            this.velocity_x = -1;
        else
            this.velocity_x = 1;

        if(state.velocity_y < -0.015)
            this.velocity_y = -1;
        else if (state.velocity_y > 0.015)
            this.velocity_y = 1;
        else
            this.velocity_y = 0;

        if(this.location[0]==12) {
            this.location[0] = 11;
        }
        if(this.location[1]==12) {
            this.location[1] = 11;
        }

        this.paddle_y = Math.floor(12*state.paddle_y/(0.8));
        if(this.paddle_y == 12) {
            this.paddle_y = 11;
        }
        this.state_t = [this.ball_x, this.ball_y, this.velocity_x, this.velocity_y, this.paddle_y];
        this.reward = state.reward;

    };

    printState() {
    /*    console.log("DISCRETE: velocity_x: "+this.velocity_x + ", " + "velocity_y: "+this.velocity_y);
        console.log("DISCRETE: LOCATION: "+this.location);
        console.log("DISCRETE: PADDLE: "+this.paddle_y); */
    };

    equals(d_state: Discrete_State) {
        for(var x = 0; x<5; x++) {
            if(this.state_t[x] != d_state.state_t[x])
                return false;
        }
        return true;
    };
}
