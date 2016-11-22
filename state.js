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
var State = (function () {
    function State(ball_X, ball_Y, velocity_X, velocity_Y, paddle_Y) {
        this.ball_X = ball_X;
        this.ball_Y = ball_Y;
        this.velocity_X = velocity_X;
        this.velocity_Y = velocity_Y;
        this.paddle_Y = paddle_Y;
        this.ball_x = ball_X;
        this.ball_y = ball_Y;
        this.velocity_x = velocity_X;
        this.velocity_y = velocity_Y;
        this.paddle_y = paddle_Y;
        this.state_t = [ball_X, ball_Y, velocity_X, velocity_Y, paddle_Y];
    }
    State.prototype.moveUp = function () {
        this.paddle_y -= 0.04;
        if (this.paddle_y < 0)
            this.paddle_y = 0;
    };
    State.prototype.moveDown = function () {
        this.paddle_y += 0.04;
        if (this.paddle_y > 0.8)
            this.paddle_y = 0.8;
    };
    State.prototype.moveBall = function (x, y) {
        this.ball_x += x;
        this.ball_y += y;
        // ball gets past the paddle
        if (this.ball_x > 1)
            console.log("GAME OVER");
        else if (this.ball_y < 0) {
            this.ball_y = (-1 * this.ball_y);
            this.velocity_y = (-1 * this.velocity_y);
        }
        else if (this.ball_y > 1) {
            this.ball_y = (2 - this.ball_y);
            this.velocity_y = (-1 * this.velocity_y);
        }
        else if (this.ball_x < 0) {
            this.ball_x = (-1 * this.ball_x);
            this.velocity_x = (-1 * this.velocity_x);
        }
        else if ((this.ball_x == 1) &&
            (this.ball_y > this.paddle_y) &&
            (this.ball_y < this.paddle_y + 0.2)) {
            this.ball_x = (2 * (1 - this.ball_x));
            this.velocity_x = (-1 * this.velocity_x + (Math.random() * (0.015 - (-0.015) + 1) - 0.015));
            this.velocity_y = (this.velocity_y + (Math.random() * (0.03 - (-0.03) + 1) - 0.03));
        }
        // make sure velocity x is reasonable
        if (Math.abs(this.velocity_x) < 0.03) {
            if (this.velocity_x < 0) {
                this.velocity_x = -0.03;
            }
            else
                this.velocity_x = 0.03;
        }
    };
    State.prototype.changeVelocity = function (x, y) {
        this.velocity_x += x;
        this.velocity_y += y;
    };
    return State;
}());
