/// <reference path="discrete_state.ts"/>


/*

ball_x and ball_y are real numbers on the interval [0,1]. 
The lines x=0, y=0, and y=1 are walls; the ball bounces off a wall whenever it hits. 
The line x=1 is defended by your paddle.
The absolute value of velocity_x is at least 0.03, 
guaranteeing that the ball is moving either left or right at a reasonable speed.
paddle_y represents the top of the paddle and is on the interval [0, 1 - paddle_height], 
where paddle_height = 0.2, as can be seen in the image above. 
(The x-coordinate of the paddle is always paddle_x=1, 
so you do not need to include this variable as part of the state definition).

*/

class State {
    ball_x: number; // [0,1]
    ball_y: number; // [0,1]
    velocity_x: number; // absolute value is at least 0.3
    velocity_y: number;
    paddle_y: number; // top of the padd, [0,0.8] or [0,1-paddle_height], 
                      //x coordinate is always the line x=1, paddle_height is 0.2
    state_t: [number, number, number, number, number]; // tuple for all the previous values
    reward:number = 0;
    discrete: Discrete_State;
    
    constructor(public ball_X, public ball_Y, public velocity_X, public velocity_Y, public paddle_Y) {
        this.ball_x = ball_X;
        this.ball_y = ball_Y;
        this.velocity_x = velocity_X;
        this.velocity_y = velocity_Y;
        this.paddle_y = paddle_Y;
        this.state_t = [ball_X, ball_Y, velocity_X, velocity_Y, paddle_Y];
        this.reward = 0;
        this.discrete = new Discrete_State(this);
    }

    moveUp() {
        this.paddle_y -= 0.04;
        if(this.paddle_y < 0)
            this.paddle_y = 0;
    }
    moveDown() {
        this.paddle_y += 0.04;
        if(this.paddle_y > 0.8)
            this.paddle_y = 0.8;
    }

    movePaddle(j: number) {
        if(j==0) {
            this.moveUp();
        }
        else if(j==1) {
            this.moveDown();
        }
    }
    moveBall(x: number, y: number) {
        this.ball_x += x;
        this.ball_y += y;
     //   console.log("top paddle: "+this.paddle_y+", bottom: "+(this.paddle_y+0.2));
        // ball gets past the paddle

        // ball bounces off the top wall
        if(this.ball_y < 0) {
       //     console.log("top wall hit")
            this.ball_y = (-1*this.ball_y);
            this.velocity_y = (-1*this.velocity_y);
        }
        // ball bounces off the bottom wall
        if(this.ball_y > 1) {
        //    console.log("bottom wall hit")
            this.ball_y = (2-this.ball_y);
            this.velocity_y = (-1*this.velocity_y);
        }
        // ball bounces off the left wall
        if(this.ball_x < 0) {
         //   console.log("left wall hit")
            this.ball_x = (-1*this.ball_x);
            this.velocity_x = (-1*this.velocity_x);
        }


        // ball bounces off the paddle
        if((this.ball_x >= 1.0) && 
        (this.ball_y > this.paddle_y) && 
        (this.ball_y < this.paddle_y+0.2)) {
         //   console.log("paddle hit")
            this.ball_x = (2-this.ball_x);
            var random_x: number = (Math.random()*(0.015 - (-0.015) - 0.015));
          //  console.log("random: "+random_x);
            this.velocity_x = (-1*this.velocity_x + random_x);
            this.velocity_y = (this.velocity_y + (Math.random()*(0.03 - (-0.03) + 1) - 0.03));
            this.reward = 1;
        }
        else if(this.ball_x > 1) {
          //  console.log("GAME OVER");
            this.reward = -1;
        }
        else {
            this.reward = 0;
        }
        // make sure velocity x is reasonable
        if(Math.abs(this.velocity_x) < 0.03) {
            if(this.velocity_x < 0) {
                this.velocity_x = -0.03;
            }
            else
                this.velocity_x = 0.03;
        }
    //    console.log("ball_x: "+this.ball_x + ", " + "ball_y: "+this.ball_y);
     //   console.log("velocity_x: "+this.velocity_x + ", " + "velocity_y: "+this.velocity_y );
        return this.reward;
    }
    changeVelocity(x: number, y: number) {
        this.velocity_x += x;
        this.velocity_y += y;
    }
}