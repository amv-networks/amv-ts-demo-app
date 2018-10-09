import { NgModule } from '@angular/core';
import { ProgressBarService } from '../../core/shared/progress-bar.service';
import { SnackBarService } from '../../core/shared/snack-bar.service';
import { MaterialModule } from './material.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

@NgModule({
  exports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule,
    RouterTestingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [ProgressBarService, SnackBarService]
})

export class TestsModule {
}
