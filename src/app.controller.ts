import {
  Controller,
  Get,
  MessageEvent,
  Query,
  Sse,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Observable, interval, map } from 'rxjs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  amIResponsive(): string {
    return 'Try calling this endpoint while the thread is calculating the fibonacci sum. If you receive this message it means the app is responsive. Call /runWorker?fibonacci=50 in a new tab and refresh this page.';
  }

  @Get('/runWorker')
  runWorker(@Query('fibonacci') fibonacci: string): string {
    const parsedFibonacci = parseInt(fibonacci);
    if (isNaN(parsedFibonacci)) {
      throw new UnprocessableEntityException('fibonacci must be a number!');
    }

    return this.appService.runWorker(parsedFibonacci);
  }

  @Sse('/runWorkerSse')
  runWorkerSse(@Query('fibonacci') fibonacci: string): any {
    const parsedFibonacci = parseInt(fibonacci);
    if (isNaN(parsedFibonacci)) {
      throw new UnprocessableEntityException('fibonacci must be a number!');
    }

    return this.appService.runWorkerSse(parsedFibonacci);
  }

  @Sse('sse')
  sse(): Observable<MessageEvent> {
    return interval(1000).pipe(map((_) => ({ data: { hello: 'world' } })));
  }
}
