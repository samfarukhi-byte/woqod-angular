import { AfterViewInit, Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

/**
 * Accessibility helper for dialogs: traps Tab focus within the host element,
 * focuses the first control on open, and emits `escape` when Esc is pressed.
 * Usage: <div appFocusTrap (escape)="close()"> … </div>
 */
@Directive({ selector: '[appFocusTrap]' })
export class FocusTrapDirective implements AfterViewInit {
  @Output() escape = new EventEmitter<void>();

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    setTimeout(() => this.focusables()[0]?.focus(), 30);
  }

  @HostListener('keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.stopPropagation();
      this.escape.emit();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = this.focusables();
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement as HTMLElement;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  private focusables(): HTMLElement[] {
    return Array.from(
      this.host.nativeElement.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el.offsetParent !== null);
  }
}
