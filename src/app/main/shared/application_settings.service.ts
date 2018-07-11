import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Observable, of, EMPTY } from 'rxjs';
import { Injectable } from '@angular/core';
import { ApplicationSettings } from './application_settings.model';
import { catchError, filter, tap, map, flatMap, defaultIfEmpty, delay, share } from 'rxjs/operators';
import { EnterPassphraseDialogComponent, EnterPassphraseDialogData } from './enter_passphrase.dialog';
import * as sjcl from 'sjcl';

@Injectable()
export class ApplicationSettingsService {
  static APP_KEY = 'application_settings';

  private lastKey: string = null;
  private promptForPassphraseObservable: Observable<string>;
  private defaultSettings: ApplicationSettings;

  constructor(public dialog: MatDialog) {
    this.defaultSettings = new ApplicationSettings(
      '',
      'john_doe',
      'correct battery horse staple',
      1,
      false
    );

    this.promptForPassphraseObservable = this.promptForPassphraseIfNecessary({
      title: 'Enter passphrase',
      label: 'Passphrase',
      hint: 'Choose a strong passphrase',
      placeholder: 'correct horse battery staple',
      submit: 'OK',
    } as EnterPassphraseDialogData).pipe(share());
  }

  hasUserKey(): boolean {
    return this.lastKey !== null;
  }

  hasUserValue(): boolean {
    return !!localStorage.getItem(ApplicationSettingsService.APP_KEY);
  }

  delete(): Observable<any> {
    return of(1).pipe(
      tap(val => localStorage.removeItem(ApplicationSettingsService.APP_KEY)),
      tap(val => this.lastKey = null)
    );
  }

  get(): Observable<ApplicationSettings> {
    return of(1).pipe(
      map(val => localStorage.getItem(ApplicationSettingsService.APP_KEY)),
      flatMap(data => data ? of(data) : EMPTY),
      flatMap(data => this.promptForPassphraseObservable.pipe(
        flatMap(passphrase => {
          return !passphrase ? EMPTY : of([passphrase, data]);
        }))
      )).pipe(
        flatMap(pair => this.decrypt(pair[0], pair[1])),
        flatMap(jsonString => jsonString ? of(JSON.parse(jsonString)) : EMPTY),
        defaultIfEmpty(this.defaultSettings)
      );
  }

  save(settings: ApplicationSettings): Observable<ApplicationSettings> {
    return this.promptForPassphraseObservable.pipe(
      flatMap(passphrase => this.encrypt(passphrase, JSON.stringify(settings))),
      tap(enc => localStorage.setItem(ApplicationSettingsService.APP_KEY, enc)),
      flatMap(foo => this.get())
    );
  }

  saveWithNewPassphrase(settings: ApplicationSettings): Observable<ApplicationSettings> {
    return of(1).pipe(
      tap(this.lastKey = null),
      flatMap(foo => this.save(settings))
    );
  }

  decrypt(passphrase: string, value: string): Observable<string> {
    return of(1).pipe(map(val => sjcl.decrypt(passphrase, value)));
  }

  encrypt(passphrase: string, value: string): Observable<string> {
    return of(1).pipe(map(val => {
      const parameters = { 'iter': 500 };
      const rp = {};
      return sjcl.encrypt(passphrase, value, parameters, rp);
    }));
  }

  promptForPassphraseIfNecessary(data: EnterPassphraseDialogData): Observable<string> {
    return of(1).pipe(
      flatMap(foo => {
        if (this.lastKey) {
          return of(this.lastKey);
        }

        return this.promptForPassphrase(data);
      }));
  }

  promptForPassphrase(data: EnterPassphraseDialogData): Observable<string> {
    return of(1).pipe(
      // delay to prevent dialog issue in onInit (view creation in onInit does not work in angular atm!)
      delay(1),
      flatMap(foo => {
        const dialogRef = this.dialog.open(EnterPassphraseDialogComponent, {
          autoFocus: true,
          disableClose: true,
          minWidth: 350,
          data: data
        });

        return dialogRef.afterClosed().pipe(
          filter(result => typeof result === 'string' && result.length > 0),
          tap(val => this.lastKey = val)
        );
      })
    );
  }
}
