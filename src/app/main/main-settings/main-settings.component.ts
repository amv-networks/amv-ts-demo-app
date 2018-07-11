import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AppConfig } from '../../config/app.config';
import { ApplicationSettingsService } from '../shared/application_settings.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';

@Component({
  selector: 'app-main-settings',
  templateUrl: './main-settings.component.html',
  styleUrls: ['./main-settings.component.scss']
})

export class MainSettingsComponent implements OnInit, AfterViewInit {
  options: FormGroup;

  hasUserKey = false;
  hasUserValue = false;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private applicationSettingsService: ApplicationSettingsService) {

    this.options = this.formBuilder.group({
      baseUrl: [null, Validators.required],
      username: [null, Validators.required],
      password: [null, Validators.required],
      contractId: [null, Validators.required],
      debugMode: null,
    });
  }

  ngOnInit() {
    this.hasUserKey = this.applicationSettingsService.hasUserKey();
    this.hasUserValue = this.applicationSettingsService.hasUserValue();

    this.applicationSettingsService.get()
      .subscribe(data => {
        this.options = this.formBuilder.group({
          baseUrl: [data.baseUrl, Validators.required],
          username: [data.username, Validators.required],
          password: [data.password, Validators.required],
          contractId: [data.contractId, Validators.required],
          debugMode: data.debugMode,
        });

        this.onChange();
      }, error => this.popupError(error));
  }

  ngAfterViewInit() {

  }

  onFormSubmitWithNewPassphrase() {
    if (this.options.invalid) {
      return;
    }

    this.applicationSettingsService.saveWithNewPassphrase(this.options.value)
      .subscribe(
        foo => { },
        error => this.popupError(error),
        () => {
          this.onChange();
          this.popupMessage('Settings saved');
        }
      );
  }

  onFormSubmit() {
    if (this.options.invalid) {
      return;
    }

    this.applicationSettingsService.save(this.options.value).subscribe(
      foo => { },
      error => this.popupError(error),
      () => {
        this.onChange();
        this.popupMessage('Settings saved');
      }
    );
  }

  onDeleteStoredSettingsClicked() {
    this.applicationSettingsService.delete().subscribe(
      foo => { },
      error => this.popupError(error),
      () => {
        this.onChange();
        this.popupMessage('Settings have been deleted');
      }
    );
  }

  onChange() {
    this.hasUserKey = this.applicationSettingsService.hasUserKey();
    this.hasUserValue = this.applicationSettingsService.hasUserValue();
  }

  popupError(error): void {
    this.popupSnackBar(error, 'background-red');
  }

  popupMessage(message): void {
    this.popupSnackBar(message, '');
  }

  popupSnackBar(content: any, panelClass: string): void {
    const config: any = new MatSnackBarConfig();
    config.duration = AppConfig.snackBarDuration;
    config.panelClass = panelClass;
    this.snackBar.open(content, 'OK', config);
  }
}
