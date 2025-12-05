import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { EmployeeData } from '../employee/employee';

@Component({
  selector: 'kp-employee-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
  ],
  templateUrl: './employee-dialog.html',
  styleUrl: './employee-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeDialog {
  private readonly dialogRef = inject(MatDialogRef<EmployeeDialog>);
  readonly data = inject<EmployeeData>(MAT_DIALOG_DATA);

  protected readonly empForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    age: new FormControl(1, [Validators.required, Validators.min(1)]),
  });

  // Convert form status to signal for reactive template usage
  private readonly formStatus = toSignal(this.empForm.statusChanges, {
    initialValue: this.empForm.status,
  });

  protected readonly isFormValid = computed(() => this.formStatus() === 'VALID');

  protected readonly firstNameError = computed(() => {
    const control = this.empForm.controls.firstName;
    return control.touched && control.hasError('required');
  });

  protected readonly lastNameError = computed(() => {
    const control = this.empForm.controls.lastName;
    return control.touched && control.hasError('required');
  });

  protected readonly ageError = computed(() => {
    const control = this.empForm.controls.age;
    return control.touched && control.hasError('required');
  });

  onNoClick(): void {
    this.dialogRef.close();
  }
}
