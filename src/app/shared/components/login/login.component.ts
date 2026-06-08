import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  showPassword = false;
  error = '';
  submitting = false;

  // Two-step sign-in: credentials → OTP verification.
  step: 'credentials' | 'otp' = 'credentials';
  otp = '';
  otpError = '';
  /** Mock OTP for the prototype (no real SMS/email gateway). */
  generatedOtp = '';

  private returnUrl = '/csp/home';

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/csp/home';
    if (this.route.snapshot.queryParamMap.get('reason') === 'expired') {
      this.error = 'Your session has expired. Please sign in again.';
    }
    // Already signed in? Skip login.
    if (this.auth.isAuthenticated()) this.router.navigateByUrl(this.returnUrl);
  }

  /** Step 1 — verify username + password, then send the OTP. */
  submit(): void {
    this.error = '';
    if (!this.username || !this.password) {
      this.error = 'Please enter your username and password.';
      return;
    }
    this.submitting = true;
    const result = this.auth.verifyCredentials(this.username, this.password);
    this.submitting = false;
    if (result.success) {
      this.sendOtp();
      this.step = 'otp';
    } else {
      this.error = result.message ?? 'Sign in failed.';
    }
  }

  /** Step 2 — verify the OTP, then establish the session. */
  verifyOtp(): void {
    this.otpError = '';
    const code = this.otp.trim();
    if (!/^\d{6}$/.test(code)) {
      this.otpError = 'Enter the 6-digit verification code.';
      return;
    }
    if (code !== this.generatedOtp) {
      this.otpError = 'Invalid verification code. Please try again.';
      return;
    }
    this.submitting = true;
    const result = this.auth.login(this.username, this.password);
    this.submitting = false;
    if (result.success) {
      this.toast.success(`Welcome back, ${this.auth.currentUser?.name}!`);
      this.router.navigateByUrl(this.returnUrl);
    } else {
      // Credentials changed underneath us — fall back to step 1.
      this.error = result.message ?? 'Sign in failed.';
      this.backToCredentials();
    }
  }

  /** Generate and "send" a fresh 6-digit OTP (shown on screen for the prototype). */
  sendOtp(): void {
    this.otp = '';
    this.otpError = '';
    this.generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
    this.toast.success('A verification code has been sent.');
  }

  resendOtp(): void {
    this.sendOtp();
  }

  backToCredentials(): void {
    this.step = 'credentials';
    this.otp = '';
    this.otpError = '';
    this.generatedOtp = '';
  }

  /** Demo helper: prefill the customer credentials. */
  useDemo(username: string): void {
    this.username = username;
    this.password = 'woqod123';
    this.error = '';
  }
}
