export default class Particle {
  constructor(x, y, size, color, angle, verticalAngle, speed, shape, canvasObj) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.angle = angle;
    this.verticalAngle = verticalAngle;
    this.speed = speed;
    this.shape = shape;
    this.ctx = canvasObj.getContext("2d");
  }
  draw() {
    this.ctx.beginPath();
    if (this.shape == 5) {
      for (let i = 0; i < 5; i++) {
        this.ctx.lineTo(
          Math.cos(((18 + i * 72) / 180) * Math.PI) * this.size + this.x,
          -Math.sin(((18 + i * 72) / 180) * Math.PI) * this.size + this.y
        );
        this.ctx.lineTo(
          (Math.cos(((54 + i * 72) / 180) * Math.PI) * this.size) / 2 + this.x,
          (-Math.sin(((54 + i * 72) / 180) * Math.PI) * this.size) / 2 + this.y
        );
      }
    } else if (this.shape == 4) {
      for (let i = 0; i < 4; i++) {
        this.ctx.lineTo(
          Math.cos(((0 + i * 90) / 180) * Math.PI) * this.size + this.x,
          -Math.sin(((0 + i * 90) / 180) * Math.PI) * this.size + this.y
        );
        this.ctx.lineTo(
          (Math.cos(((35 + i * 90) / 180) * Math.PI) * this.size) / 2 + this.x,
          (-Math.sin(((35 + i * 90) / 180) * Math.PI) * this.size) / 2 + this.y
        );
      }
    } else {
      this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    }
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
  }
  update() {
    this.x += -1 * this.speed * Math.cos(this.angle * (Math.PI / 180));
    this.y += this.speed * Math.sin(this.verticalAngle * (Math.PI / 180));
    this.size -= 0.06;
    if (this.size <= 0) {
      this.size = 0;
    }
  }
}
