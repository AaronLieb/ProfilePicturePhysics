const blue = "#263E51";
const green = "#44FF5F";

const SIZE = 500;
const EYE_RADIUS = 45;

let canvas;
let ctx;

let eyes = [];

const dir = (a) => {
  return a >= 0 ? 1 : -1;
};

class Thing {
  constructor(x, y, vx = 0, vy = 0, ax = 0, ay = 0) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.ax = ax;
    this.ay = ay;
    this.x_dir = dir(vx);
    this.y_dir = dir(vy);
    this.bounced = false;
    this.updateBox();
  }

  updateBox() {
    this.left = this.x - EYE_RADIUS;
    this.right = this.x + EYE_RADIUS;
    this.top = this.y - EYE_RADIUS;
    this.bottom = this.y + EYE_RADIUS;
  }

  move() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx += this.ax * this.x_dir;
    this.vy += this.ay * this.y_dir;
    this.x_dir = dir(this.vx);
    this.y_dir = dir(this.vy);
    this.updateBox();
  }

  draw() {
    return;
  }
}

// Mouth
// 228.52, 308.59, 302.73, 312.5, 218.75, 359.38, 296.88, 367.19

class Eye extends Thing {
  constructor(x, y, vx = 0, vy = 0, ax = 0, ay = 0) {
    super(x, y, vx, vy, ax, ay);
    eyes.push(this);
  }

  draw() {
    draw_circle(this.x, this.y, EYE_RADIUS, green);
  }

  move() {
    // ball collisions
    let other;
    eyes.forEach((eye) => {
      if (eye != this) other = eye;
    });

    if (
      Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2) <
        EYE_RADIUS * 2 &&
      !this.bounced
    ) {
      const total_speed =
        Math.sqrt(this.vx ** 2 + this.vy ** 2) +
        Math.sqrt(other.vx ** 2 + other.vy ** 2);
      const dx = this.x - other.x;
      const dy = this.y - other.y;
      const h = Math.sqrt(dy ** 2 + dx ** 2);
      this.vx = ((total_speed / 2) * dx) / h;
      this.vy = ((total_speed / 2) * dy) / h;
      other.vx = (-1 * (total_speed / 2) * dx) / h;
      other.vy = (-1 * (total_speed / 2) * dy) / h;
      other.bounced = true;
      this.bounced = true;
    }

    // wall collisions
    const x_dis_from_center = Math.abs(SIZE / 2 - this.x);
    const y_dis_from_center = Math.abs(SIZE / 2 - this.y);
    if (
      Math.sqrt(x_dis_from_center ** 2 + y_dis_from_center ** 2) >
      SIZE / 2 - EYE_RADIUS
    ) {
      const speed = Math.sqrt(this.vx ** 2 + this.vy ** 2);

      // calculate the new launch angle, and add a little randomness to make it more fun
      const angle =
        Math.atan(y_dis_from_center / x_dis_from_center) + Math.random() - 0.5;

      const x_in_dir = this.x > SIZE / 2 ? -1 : 1;
      const y_in_dir = this.y > SIZE / 2 ? -1 : 1;

      this.vx = x_in_dir * speed * Math.cos(angle);
      this.vy = y_in_dir * speed * Math.sin(angle);
    }

    // mouth collisions
    if (
      Math.sqrt((this.x - mouth.x) ** 2 + (this.y - mouth.y) ** 2) <
        MOUTH_RADIUS * 2 &&
      !this.bounced
    ) {
      const speed = Math.sqrt(this.vx ** 2 + this.vy ** 2);
      const dx = this.x - mouth.x;
      const dy = this.y - mouth.y;
      const h = Math.sqrt(dy ** 2 + dx ** 2);
      this.vx = (speed * dx) / h;
      this.vy = (speed * dy) / h;
      this.bounced = true;
    }

    this.bounced = false;
  }
}

class Mouth extends Thing {
  constructor(x, y, vx = 0, vy = 0, ax = 0, ay = 0) {
    super(x, y, vx, vy, ax, ay);
  }

  draw() {}
}

let left_eye = new Eye(126, 248, 2, 0, 0, 0);
let right_eye = new Eye(369, 256, 0, 0, 0, 0);
let mouth = new Mouth();

const draw_circle = (x, y, r, color) => {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = "1";
  ctx.stroke();
};

const draw_smile = (x1, y1, x2, y2, cpx1, cpy1, cpx2, cpy2) => {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, x2, y2);
  ctx.strokeStyle = green;
  ctx.lineWidth = "33";
  ctx.stroke();
  draw_circle(x1, y1, 15.9);
  draw_circle(x2, y2, 15.9);
};

const draw_background = () => {
  ctx.beginPath();
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.fill();
  draw_circle(SIZE / 2, SIZE / 2, SIZE / 2, blue);
};

const move = () => {
  eyes.forEach((eye) => eye.move());
};

const draw = () => {
  draw_background();
  eyes.forEach((eye) => eye.draw());
  mouth.draw();
  draw_smile(228.52, 308.59, 302.73, 312.5, 218.75, 359.38, 296.88, 367.19);
};

const loop = () => {
  move();
  draw();
};

const main = () => {
  canvas = document.getElementById("pfp");
  ctx = canvas.getContext("2d");
  setInterval(loop, 1000 / 60);
};

window.onload = main;
