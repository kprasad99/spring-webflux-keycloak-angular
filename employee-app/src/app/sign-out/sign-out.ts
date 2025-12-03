import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'kp-sign-out',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './sign-out.html',
  styleUrl: './sign-out.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignOut {}
