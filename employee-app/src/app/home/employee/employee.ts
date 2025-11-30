import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';

import { OidcSecurityService } from 'angular-auth-oidc-client';

import { EmployeeDialog } from '../employee-dialog/employee-dialog';
import { EmployeeService } from './employee.service';
import { HasAdminPipe } from '../../has-admin-pipe';

export interface EmployeeData {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
}

export interface UserData {
  sub: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  authorities: string[];
}

export interface Column {
  field: string;
  label: string;
}

@Component({
  selector: 'kp-employee',
  imports: [MatCheckboxModule, MatTableModule, MatButtonModule, MatDialogModule, HasAdminPipe],
  templateUrl: './employee.html',
  styleUrl: './employee.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Employee implements OnInit {
  private readonly empService = inject(EmployeeService);
  private readonly auth = inject(OidcSecurityService);
  private readonly dialog = inject(MatDialog);

  protected readonly displayedColumns = ['select', 'firstName', 'lastName', 'age'];
  protected readonly dataSource = new MatTableDataSource<EmployeeData>();
  protected readonly selection = new SelectionModel<EmployeeData>(true, []);
  protected readonly userData = signal<UserData | null>(null);

  ngOnInit(): void {
    this.auth.checkAuth().subscribe(({ userData }) => {
      console.log('Employee component user data:', userData);
      this.userData.set(userData);
    });
    this.empService.list().subscribe((e) => (this.dataSource.data = e));
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      for (const row of this.dataSource.data) {
        this.selection.select(row);
      }
    }
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: EmployeeData): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  add(): void {
    const dialogRef = this.dialog.open(EmployeeDialog, {
      width: '360px',
      data: {},
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.empService
        .add(result)
        .subscribe((r) => (this.dataSource.data = [...this.dataSource.data, r]));
    });
  }

  remove(): void {
    for (const e of this.selection.selected) {
      this.empService.remove(e).subscribe(() => {
        this.dataSource.data = this.removeItem(this.dataSource.data, 'id', e.id);
      });
    }
    this.selection.clear();
  }

  removeItem<T>(arr: T[], prop: keyof T, key: T[keyof T]): T[] {
    const index = arr.findIndex((e) => e[prop] === key);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return [...arr];
  }
}
