import {isArray} from './util';
export  default class Stack {


    stack: Array<any> = [];

    pop() {
        return this.stack.pop()
    }

    push(stack: any | Array<any>) {


        if (isArray(stack)) {


            for (let i = 0; i < stack.length; i++) {
                this.stack.push(stack[i])

            }


        } else {
            this.stack.push(stack)
        }


    }

    clear() {
        this.stack = [];
    }

    size() {
        return this.stack.length;
    }

    peek() {
        return this.stack[this.stack.length - 1];
    }

    isEmpty() {
        return this.stack.length === 0;
    }

    shift(stack: any) {
        return this.stack.shift();
    }

    unshift(stack: any) {
        this.stack.unshift(stack)
    }

    toString(string?: any) {
        return string ? this.stack.join(string) : this.stack.join(" ")
    }

    constructor(stack?: Array<any> | any) {
        // this.stack = <Array<any>> [];
        if (this.isEmpty()) {
            this.push(stack);
        }
        // return <Array<any>>this.stack
    }
}