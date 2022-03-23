import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Employee } from '../employee/employee.component';

@Component({
  selector: 'kp-employee-dialog',
  templateUrl: './employee-dialog.component.html',
  styleUrls: ['./employee-dialog.component.scss']
})
export class EmployeeDialogComponent {
  empForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', []),
    age: new FormControl(1, [Validators.required, Validators.min(1)])
  });

  constructor(
    public dialogRef: MatDialogRef<EmployeeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Employee
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
