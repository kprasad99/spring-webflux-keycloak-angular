import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'kp-page-not-found',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './page-not-found.html',
  styleUrl: './page-not-found.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageNotFound {}
