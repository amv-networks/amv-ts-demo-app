import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';



export interface EnterPassphraseDialogData {
  title: string;
  label: string;
  placeholder: string;
  hint: string;
  submit: string;
}

@Component({
  selector: 'app-enter-passphrase-dialog',
  templateUrl: 'enter_passphrase.dialog.html',
})
export class EnterPassphraseDialogComponent {
  options: FormGroup;

  input: string;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<EnterPassphraseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EnterPassphraseDialogData) {

    this.options = this.formBuilder.group({
      input: [null, Validators.required]
    });
  }

  onEnterPressed(): void {
    if (this.options.get('input').valid) {
      this.dialogRef.close(this.options.get('input').value);
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
