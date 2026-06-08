import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CspService } from '../../../../core/services/csp.service';
import { News } from '../../../../models/home.model';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
})
export class NewsComponent implements OnInit {
  newsList: News[] = [];
  isLoading = true;
  selectedNews: News | null = null;
  showDetailsModal = false;

  constructor(
    private readonly csp: CspService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadNews();
  }

  loadNews(): void {
    this.isLoading = true;
    this.newsList = this.csp.getNews();
    this.isLoading = false;
  }

  openNewsDetails(news: News): void {
    this.selectedNews = news;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedNews = null;
  }

  formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  goBack(): void {
    this.router.navigate(['/csp/home']);
  }
}
