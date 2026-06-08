import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DocumentType, ExistingDocument, StagedDocument } from '../../../../models/document.model';

@Component({
  selector: 'app-document-card',
  templateUrl: './document-card.component.html',
  styles: [':host { display: block; }'],
})
export class DocumentCardComponent {
  @Input() type!: DocumentType;
  @Input() existing: ExistingDocument | null = null;
  @Input() staged: StagedDocument | null = null;
  @Input() error = '';
  @Output() upload = new EventEmitter<File>();
  @Output() unstage = new EventEmitter<void>();

  isDragOver = false;

  cardClass(): string {
    if (this.staged) return 'csp-doc-card--staged';
    if (!this.existing && this.type.required) return 'csp-doc-card--required';
    return '';
  }

  acceptList(): string {
    return this.type.accepted.map((e) => '.' + e).join(',');
  }

  acceptDisplay(): string {
    return this.type.accepted.join(', ').toUpperCase();
  }

  formatBytes(n: number): string {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
  }

  formatDate(iso?: string | null): string {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return iso; }
  }

  badgeClass(status: string): string {
    if (status === 'Approved') return 'csp-badge--approved';
    if (status === 'Expired') return 'csp-badge--rejected';
    if (status === 'Pending Review' || status === 'Requires Update') return 'csp-badge--pending';
    return 'csp-badge--info';
  }

  badgeIcon(status: string): string {
    if (status === 'Approved') return '✓';
    if (status === 'Expired') return '✗';
    if (status === 'Pending Review') return '⏳';
    if (status === 'Requires Update') return '⚠';
    return 'ⓘ';
  }

  onFilePicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.upload.emit(file);
    input.value = '';
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(): void {
    this.isDragOver = false;
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragOver = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) this.upload.emit(file);
  }
}
