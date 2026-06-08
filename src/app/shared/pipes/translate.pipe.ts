import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../../core/services/translation.service';

/** Usage: {{ 'nav.home' | t }} — impure so it re-renders on language change. */
@Pipe({ name: 't', pure: false })
export class TranslatePipe implements PipeTransform {
  constructor(private readonly i18n: TranslationService) {}
  transform(key: string): string {
    return this.i18n.t(key);
  }
}
