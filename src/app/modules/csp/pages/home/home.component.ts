import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CspService } from '../../../../core/services/csp.service';
import { HomeBanner, HomeSection } from '../../../../models/home.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  banners: HomeBanner[] = [];
  sections: HomeSection[] = [];
  currentSlideIndex = 0;
  isLoading = true;

  constructor(
    private readonly csp: CspService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadHomeData();
    this.startBannerAutoSlide();
  }

  loadHomeData(): void {
    this.isLoading = true;

    // Load banners and sections
    this.banners = this.csp.getHomeBanners();
    this.sections = this.csp.getHomeSections();

    this.isLoading = false;
  }

  // Banner navigation
  previousSlide(): void {
    if (this.banners.length === 0) return;
    this.currentSlideIndex = (this.currentSlideIndex - 1 + this.banners.length) % this.banners.length;
  }

  nextSlide(): void {
    if (this.banners.length === 0) return;
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.banners.length;
  }

  goToSlide(index: number): void {
    this.currentSlideIndex = index;
  }

  startBannerAutoSlide(): void {
    setInterval(() => {
      if (this.banners.length > 1) {
        this.nextSlide();
      }
    }, 10000); // Auto-slide every 10 seconds
  }

  onBannerClick(banner: HomeBanner): void {
    if (banner.redirectUrl) {
      this.router.navigateByUrl(banner.redirectUrl);
    }
  }

  onSectionClick(section: HomeSection): void {
    this.router.navigateByUrl(section.route);
  }

  getSectionIcon(code: string): string {
    const icons: Record<string, string> = {
      'NEWS': '📰',
      'SERVICES': '⚙️',
      'TENDERS': '📋',
    };
    return icons[code] || '📄';
  }
}
