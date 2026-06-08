import { Component, Input } from '@angular/core';

export interface BreadcrumbItem {
  label: string;
  link?: string | string[];
}

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent {
  @Input() pageTitle = '';
  @Input() trail: BreadcrumbItem[] = [];
}
