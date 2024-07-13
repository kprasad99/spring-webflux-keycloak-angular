import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'kp-sign-out',
  templateUrl: './sign-out.component.html',
  styleUrl: './sign-out.component.scss'
})
export class SignOutComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    sessionStorage.clear();
  }
}
