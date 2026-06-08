import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('adds a toast on show()', async () => {
    service.show('success', 'Saved', 0); // 0 = no auto-dismiss
    const toasts = await firstValueFrom(service.toasts$);
    expect(toasts.length).toBe(1);
    expect(toasts[0].type).toBe('success');
    expect(toasts[0].text).toBe('Saved');
  });

  it('dismisses a toast by id', async () => {
    service.show('error', 'Oops', 0);
    let toasts = await firstValueFrom(service.toasts$);
    const id = toasts[0].id;
    service.dismiss(id);
    toasts = await firstValueFrom(service.toasts$);
    expect(toasts.length).toBe(0);
  });

  it('exposes typed helpers', async () => {
    service.info('hello');
    const toasts = await firstValueFrom(service.toasts$);
    expect(toasts[0].type).toBe('info');
  });
});
