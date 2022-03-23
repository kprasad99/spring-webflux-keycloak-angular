import { Component, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';

import { OidcSecurityService } from 'angular-auth-oidc-client';

import { EmployeeDialogComponent } from '../employee-dialog/employee-dialog.component';
import { EmployeeService } from './employee.service';

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
}

export interface Column {
  field: string;
  label: string;
}

@Component({
  selector: 'kp-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent implements OnInit {
  displayedColumns: string[] = ['select', 'firstName', 'lastName', 'age'];
  dataSource = new MatTableDataSource<Employee>();
  selection = new SelectionModel<Employee>(true, []);
  userData: any = {};

  constructor(private auth: OidcSecurityService, private empService: EmployeeService, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.auth.userData$.subscribe(e => {
      this.userData = e;
    });
    this.empService.list().subscribe(e => (this.dataSource.data = e));
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(): void {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Employee): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  add(): void {
    const dialogRef = this.dialog.open(EmployeeDialogComponent, {
      width: '360px',
      data: {}
    });
    dialogRef.afterClosed().subscribe(result => {
      this.empService.add(result).subscribe(r => (this.dataSource.data = [...this.dataSource.data, r]));
    });
  }

  remove(): void {
    this.selection.selected.forEach(e =>
      this.empService.remove(e).subscribe(r => {
        this.dataSource.data = this.removeItem(this.dataSource.data, 'id', e.id);
      })
    );
    this.selection.clear();
  }

  removeItem(arr: any[], prop: string, key: any): any[] {
    const index = arr.findIndex(e => e[prop] === key);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return [...arr];
  }
}
