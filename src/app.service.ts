import { Injectable, Logger, MessageEvent } from '@nestjs/common';
import { Worker, isMainThread } from 'worker_threads';
import workerThreadFilePath from './worker-threads/config';
import { BehaviorSubject, Observable, filter, fromEvent, map } from 'rxjs';
import { join } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  private worker: Worker; 
  

  checkMainThread() {
    this.logger.debug(
      'Are we on the main thread here?',
      isMainThread ? 'Yes.' : 'No.',
    );
  }

  // do not run this from the worker thread or you will spawn an infinite number of threads in cascade
  runWorker(fibonacci: number): string {
    this.checkMainThread();
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisService = this;
    const worker = new Worker(workerThreadFilePath, {
      workerData: fibonacci,
    });
    worker.on('message', (fibonacciSum) => {
      thisService.logger.verbose('Calculated sum', fibonacciSum);
    });
    worker.on('error', (e) => console.log('on error', e));
    worker.on('exit', (code) => console.log('on exit', code));

    return 'Processing the fibonacci sum... Check NestJS app console for the result.';
  }

  runWorkerSse(fibonacci: number): Observable<MessageEvent> {
    this.checkMainThread();

    const messageId = randomUUID()
    const messages$ = new BehaviorSubject<MessageEvent>({ 
      id: messageId,
      data: { state: "init", properties: null },
      type: "init"
    });

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisService = this;
    const worker = new Worker(workerThreadFilePath, {
      workerData: fibonacci,
    });
    worker.on('message', (fibonacciSum) => {
      const messageEvent = {
        id: messageId,
        type: "message",
        data: {
          state: 'message',
          properties: {
            value: fibonacciSum
          }
        }
      } as MessageEvent
      thisService.logger.verbose('Calculated sum', messageEvent);
      messages$.next(messageEvent)
    });
    worker.on('error', (e) => {
      const messageEvent = {
        id: messageId,
        type: "error",
        data: {
          state: 'error',
          properties: {
            error: e
          }
        }
      } as MessageEvent
      messages$.next(messageEvent)
    });
    worker.on('exit', (code) => {
      const messageEvent = {
        id: messageId,
        type: "exit",
        data: {
          state: 'exit',
          properties: {
            code: code
          }
        }
      } as MessageEvent
      messages$.next(messageEvent)
      messages$.complete()
    });
  

    return messages$
  }
}
