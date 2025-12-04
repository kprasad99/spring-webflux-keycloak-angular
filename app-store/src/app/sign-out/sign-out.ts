import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'kp-sign-out',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './sign-out.html',
  styleUrl: './sign-out.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignOut implements OnInit {
  private readonly titleService = inject(Title);
  protected readonly appTitle = signal('');

  ngOnInit(): void {
    this.appTitle.set(this.titleService.getTitle());
  }
}
