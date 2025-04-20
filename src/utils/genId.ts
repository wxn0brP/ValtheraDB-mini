import { Id } from "../types";

export default function genId(): Id {
    const time = new Date().getTime().toString(36);
    const a = gen();
    const b = gen();
    const id = time + "-" + a + "-" + b;

    return id;
}

function gen() {
    return Math.floor(Math.random() * 1000).toString(36);
}