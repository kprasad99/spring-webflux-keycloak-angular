import { ChangeDetectionStrategy, Component } from '@angular/core';

import { httpResource } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface AppItem {
  title: string;
  url: string;
}

@Component({
  selector: 'kp-apps-list',
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './apps-list.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './apps-list.scss',
})
export class AppsList {
  protected readonly appsResource = httpResource<AppItem[]>(() => './apps.json');
}
