import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'k-sign-out',
  templateUrl: './sign-out.component.html',
  styleUrls: ['./sign-out.component.scss']
})
export class SignOutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    localStorage.clear();
    sessionStorage.clear();
  }

}
