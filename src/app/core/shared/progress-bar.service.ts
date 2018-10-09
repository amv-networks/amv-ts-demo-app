import { EventEmitter, Injectable } from '@angular/core';

@Injectable()
export class ProgressBarService {
  public updateProgressBar$: EventEmitter<any>;

  private requestsRunning = 0;

  constructor() {
    this.updateProgressBar$ = new EventEmitter();
  }

  public list(): number {
    return this.requestsRunning;
  }

  public increase(): void {
    this.requestsRunning++;
    if (this.requestsRunning === 1) {
      this.updateProgressBar$.emit('query');
    }
  }

  public decrease(): void {
    if (this.requestsRunning > 0) {
      this.requestsRunning--;
      if (this.requestsRunning === 0) {
        this.updateProgressBar$.emit('none');
      }
    }
  }

  public increaseIndeterminate(): void {
    this.requestsRunning++;
    this.updateProgressBar$.emit('indeterminate');
  }

  public buffer(): void {
    this.requestsRunning++;
    this.updateProgressBar$.emit('buffer');
  }

  public none(): void {
    if (this.requestsRunning > 0) {
      this.requestsRunning = 0;
      this.updateProgressBar$.emit('none');
    }
  }
}
