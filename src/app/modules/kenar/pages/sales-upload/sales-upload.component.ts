import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { KenarService } from '../../../../core/services/kenar.service';
import { SalesUploadHistory, Shop } from '../../../../models/kenar.model';

@Component({
  selector: 'app-sales-upload',
  templateUrl: './sales-upload.component.html',
  styleUrls: ['./sales-upload.component.scss'],
})
export class SalesUploadComponent implements OnInit, OnDestroy {
  uploadHistory: SalesUploadHistory[] = [];
  shops: Shop[] = [];

  selectedShop: string = '';
  selectedFile: File | null = null;
  uploading: boolean = false;
  uploadProgress: number = 0;

  private sub = new Subscription();

  constructor(private readonly kenarService: KenarService) {}

  ngOnInit(): void {
    this.sub.add(
      this.kenarService.salesUploadHistory$.subscribe((history) => {
        this.uploadHistory = history;
      })
    );

    this.sub.add(
      this.kenarService.shops$.subscribe((shops) => {
        this.shops = shops;
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadFile(): void {
    if (!this.selectedFile || !this.selectedShop) {
      alert('Please select both a shop and a file to upload');
      return;
    }

    this.uploading = true;
    this.uploadProgress = 0;

    // Simulate upload progress
    const interval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        this.uploading = false;
        this.uploadProgress = 0;
        this.selectedFile = null;
        this.selectedShop = '';
        alert('File uploaded successfully! Sales data is being processed.');
      }
    }, 200);

    // TODO: Implement actual file upload to backend
    console.log('Uploading file:', this.selectedFile.name, 'for shop:', this.selectedShop);
  }

  cancelUpload(): void {
    this.uploading = false;
    this.uploadProgress = 0;
    this.selectedFile = null;
  }

  downloadTemplate(): void {
    // TODO: Implement template download
    alert('Downloading sales data upload template...');
    console.log('Download template');
  }

  viewUploadDetails(uploadId: string): void {
    // TODO: Implement upload details view
    console.log('View upload details:', uploadId);
    alert(`View details for upload ${uploadId}`);
  }

  getStatusClass(status: string): string {
    const map: { [key: string]: string } = {
      'Processed Successfully': 'woqod-badge-success',
      'Pending Tenant Confirmation': 'woqod-badge-warning',
      'Confirmed by Tenant': 'woqod-badge-success',
      'Validation Failed': 'woqod-badge-danger',
      'Disputed by Tenant': 'woqod-badge-danger',
      'Received': 'woqod-badge-info',
      'Under Processing': 'woqod-badge-info',
      'Rejected': 'woqod-badge-secondary',
    };
    return map[status] || 'woqod-badge-secondary';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
