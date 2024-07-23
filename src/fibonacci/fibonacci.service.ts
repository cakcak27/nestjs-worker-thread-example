import { Injectable } from '@nestjs/common';

@Injectable()
export class FibonacciService {
  fibonacci(n) {
    if (n <= 1) {
      return 1;
    }
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }

  listFibonacci(n) {
    let fib = [0, 1];
    let count = n + 1;
    for(var i=fib.length; i<count; i++) {
      fib[i] = fib[i-2] + fib[i-1];
    }
    fib.shift()
    return fib
  }
}
