import { inject, Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { EmployeeData } from './employee';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly http = inject(HttpClient);

  add(emp: EmployeeData): Observable<EmployeeData> {
    return this.http.put<EmployeeData>('/api/employee', emp);
  }

  remove(emp: EmployeeData): Observable<void> {
    return this.http.delete<void>(`/api/employee/${emp.id}`);
  }

  list(): Observable<EmployeeData[]> {
    return this.http.get<EmployeeData[]>('/api/employee');
  }
}
