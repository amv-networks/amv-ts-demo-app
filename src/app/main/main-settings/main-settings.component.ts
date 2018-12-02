import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ApplicationSettingsService } from '../shared/application_settings.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { SnackBarService } from '../../core/shared/snack-bar.service';

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
    private snackBar: SnackBarService,
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
      }, error => this.snackBar.popupError(error));
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
        error => this.snackBar.popupError(error),
        () => {
          this.onChange();
          this.snackBar.popupMessage('Settings saved');
        }
      );
  }

  onFormSubmit() {
    if (this.options.invalid) {
      return;
    }

    this.applicationSettingsService.save(this.options.value).subscribe(
      foo => { },
      error => this.snackBar.popupError(error),
      () => {
        this.onChange();
        this.snackBar.popupMessage('Settings saved');
      }
    );
  }

  onDeleteStoredSettingsClicked() {
    this.applicationSettingsService.delete().subscribe(
      foo => { },
      error => this.snackBar.popupError(error),
      () => {
        this.onChange();
        this.snackBar.popupMessage('Settings have been deleted');
      }
    );
  }

  onChange() {
    this.hasUserKey = this.applicationSettingsService.hasUserKey();
    this.hasUserValue = this.applicationSettingsService.hasUserValue();
  }
}
