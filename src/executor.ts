interface Task {
    f: Function; // function
    p: any[];    // parameters
    t: Function; // if true
    n: Function; // if not
}

/**
 * A simple executor for queuing and executing asynchronous operations sequentially.
 * @class
 */
class executorC {
    /**
     * Create a new executor instance.
     * @constructor
     */
    constructor(private q: Task[] = [], private e: boolean = false) {}

    /**
     * Add an asynchronous operation to the execution queue.
     */
    async addOp(f: Function, ...p) {
        return await new Promise((t, n) => {
            this.q.push({ f, p, t, n });
            this.execute();
        });
    }

    /**
     * Execute the queued asynchronous operations sequentially.
     */
    async execute() {
        if (this.e) return;
        this.e = true;
        while (this.q.length > 0) {
            let q = this.q.shift();
            let res = await q.f(...q.p);
            q.t(res)
        }
        this.e = false;
    }
}

export default executorC;