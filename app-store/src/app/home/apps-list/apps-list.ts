import { Component, inject, OnInit, signal } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface AppItem {
  title: string;
  url: string;
}

@Component({
  selector: 'kp-apps-list',
  imports: [MatCardModule, MatIconModule],
  templateUrl: './apps-list.html',
  styleUrl: './apps-list.scss',
})
export class AppsList implements OnInit {
  private readonly http = inject(HttpClient);
  protected readonly apps = signal<AppItem[]>([]);

  ngOnInit(): void {
    // Load apps
    this.http.get<AppItem[]>('./apps.json').subscribe((apps) => {
      this.apps.set(apps);
    });
  }
}
