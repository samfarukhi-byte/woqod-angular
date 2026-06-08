import { Component, Input } from '@angular/core';
import { ProfileChangeDraft } from '../../../../models/request.model';

const FIELD_LABELS: Record<string, string> = {
  firstName: 'First Name', lastName: 'Last Name', email: 'Email',
  phone: 'Phone', phoneExtension: 'Extension', jobTitle: 'Job Title',
  address1: 'Address Line 1', city: 'City', state: 'State / Region',
  postalCode: 'Postal Code', country: 'Country',
};

@Component({
  selector: 'app-diff-table',
  templateUrl: './diff-table.component.html',
  styles: [':host { display: block; }'],
})
export class DiffTableComponent {
  @Input() diff: ProfileChangeDraft | null = null;

  fieldLabel(key: string): string {
    return FIELD_LABELS[key] ?? key;
  }
}
