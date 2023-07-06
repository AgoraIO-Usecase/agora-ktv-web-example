class Scheduler {
  task: (...args: any) => any;
  time: number;
  intervalId: any;

  constructor(time: number = 0) {
    this.task = () => {};
    this.time = time;
    this.intervalId = null;
  }

  addTask(task: (...args: any) => any) {
    this.task = task;
  }

  run() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(() => {
      this.task();
    }, this.time);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

export default Scheduler;
