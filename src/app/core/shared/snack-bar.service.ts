import { EventEmitter, Inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';

@Injectable()
export class SnackBarService {
  public openSnackbar$: EventEmitter<any>;

  private requestsRunning = 0;
  private snackBarDuration = 3000;

  constructor(
    private snackBar: MatSnackBar) {
    this.openSnackbar$ = new EventEmitter();
  }

  public list(): number {
    return this.requestsRunning;
  }

  public popupError(error): void {
    let message = error;
    if (error instanceof Error) {
      const isTsError = !!error['response'] && !!error['response'].data && !!error['response'].data.message;
      message = isTsError ? error['response'].data.message : error;
    }

    this.popupSnackBar(message, 'background-red');
  }

  public popupMessage(message): void {
    this.popupSnackBar(message, '');
  }

  private popupSnackBar(content: any, panelClass: string): void {
    this.openSnackbar$.emit(content);

    const config: any = new MatSnackBarConfig();
    config.duration = this.snackBarDuration;
    config.panelClass = panelClass;
    this.snackBar.open(content, 'OK', config);
  }
}
