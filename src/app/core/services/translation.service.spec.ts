import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  let service: TranslationService;

  beforeEach(() => {
    localStorage.removeItem('woqod.lang');
    TestBed.configureTestingModule({});
    service = TestBed.inject(TranslationService);
    service.setLang('en');
  });

  it('defaults to English', () => {
    expect(service.lang).toBe('en');
    expect(service.t('nav.home')).toBe('Home');
    expect(service.isRtl).toBeFalse();
  });

  it('translates to Arabic and flips direction', () => {
    service.setLang('ar');
    expect(service.lang).toBe('ar');
    expect(service.isRtl).toBeTrue();
    expect(service.t('nav.home')).toBe('الرئيسية');
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    expect(document.documentElement.getAttribute('lang')).toBe('ar');
  });

  it('toggles between languages', () => {
    expect(service.lang).toBe('en');
    service.toggle();
    expect(service.lang).toBe('ar');
    service.toggle();
    expect(service.lang).toBe('en');
  });

  it('falls back to the key for unknown strings', () => {
    expect(service.t('does.not.exist')).toBe('does.not.exist');
  });

  it('persists the chosen language', () => {
    service.setLang('ar');
    expect(localStorage.getItem('woqod.lang')).toBe('ar');
  });
});
