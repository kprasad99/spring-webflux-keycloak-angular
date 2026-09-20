import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { form, FormField, min, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { EmployeeData } from '../employee/employee';

@Component({
  selector: 'kp-employee-dialog',
  imports: [
    FormField,
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

  protected readonly empModel = signal({ firstName: '', lastName: '', age: 1 });
  protected readonly empForm = form(this.empModel, (s) => {
    required(s.firstName, { message: 'First Name is required' });
    required(s.lastName, { message: 'Last Name is required' });
    required(s.age, { message: 'Age is required' });
    min(s.age, 1, { message: 'Age must be at least 1' });
  });

  onNoClick(): void {
    this.dialogRef.close();
  }
}
