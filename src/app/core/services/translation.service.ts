import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Lang = 'en' | 'ar';
const STORAGE_KEY = 'woqod.lang';

/**
 * Lightweight runtime i18n for the prototype (EN ⇄ AR with RTL).
 * Keys are looked up against per-language dictionaries; missing keys fall back to
 * the English value, then to the key itself. A real deployment would back this
 * with @angular/localize or transloco + externalized catalogs.
 */
@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly _lang$ = new BehaviorSubject<Lang>(this.restore());
  readonly lang$: Observable<Lang> = this._lang$.asObservable();

  private readonly dict: Record<Lang, Record<string, string>> = {
    en: {
      'nav.insights': 'Insights',
      'nav.home': 'Home',
      'nav.news': 'News & Updates',
      'nav.tenders': 'Tenders',
      'nav.viewAllServices': 'View All Services',
      'nav.kenar': 'Kenar (Rental Shops)',
      'nav.portalManagement': 'Portal Management',
      'nav.submitTrack': 'Submit and Track Request',
      'nav.notifications': 'Notifications',
      'nav.announcements': 'Announcements',
      'nav.settings': 'Settings',
      'nav.dashboard': 'Dashboard',
      'nav.myShops': 'My Shops',
      'nav.contracts': 'Contracts',
      'nav.rentInvoices': 'Rent & Invoices',
      'nav.chequeStatus': 'Cheque Status',
      'nav.utilityBills': 'Utility Bills',
      'nav.payments': 'Payments & Receipts',
      'nav.documents': 'Documents',
      'nav.reports': 'Reports',
      'nav.salesData': 'Sales Data Management',
      'nav.salesDashboard': 'Sales Dashboard',
      'nav.viewSales': 'View Sales Data',
      'nav.uploadSales': 'Upload Sales Data',
      'nav.salesReports': 'Sales Reports',
      'nav.companyProfile': 'Company Profile',
      'nav.userAccess': 'User & Access',
      'nav.configurations': 'Configurations',
      'nav.apiIntegration': 'API Integration',
      'nav.security': 'Security & Compliance',
      'nav.system': 'System Preferences',
      'header.search': 'Search here...',
      'profile.viewProfile': 'View Profile',
      'profile.trackRequests': 'Track Requests',
      'profile.logout': 'Logout',
      'footer.contactUs': 'Contact Us',
      'a11y.skip': 'Skip to main content',
      'login.title': 'Sign in to your account',
      'login.lead': 'Welcome back. Please enter your credentials to continue.',
      'login.username': 'Username',
      'login.password': 'Password',
      'login.signIn': 'Sign In',
      'login.continue': 'Continue',
      'login.signingIn': 'Signing in…',
      'login.demo': 'Demo account (password: woqod123)',
      'login.sub': 'Total Control — Customer Self-Portal',
      'login.otpTitle': 'Verify it\'s you',
      'login.otpLead': 'Enter the 6-digit verification code we sent to your registered contact.',
      'login.otpDemo': 'For this demo, your code is:',
      'login.otpLabel': 'Verification code',
      'login.verify': 'Verify & Sign In',
      'login.resend': 'Resend code',
      'login.back': 'Back',
      'notFound.title': 'Page not found',
      'notFound.text': 'The page you’re looking for doesn’t exist or may have moved.',
      'notFound.back': '← Back to Home',
    },
    ar: {
      'nav.insights': 'الرؤى',
      'nav.home': 'الرئيسية',
      'nav.news': 'الأخبار والتحديثات',
      'nav.tenders': 'المناقصات',
      'nav.viewAllServices': 'عرض جميع الخدمات',
      'nav.kenar': 'كنار (المحلات المؤجرة)',
      'nav.portalManagement': 'إدارة البوابة',
      'nav.submitTrack': 'تقديم وتتبع الطلب',
      'nav.notifications': 'الإشعارات',
      'nav.announcements': 'الإعلانات',
      'nav.settings': 'الإعدادات',
      'nav.dashboard': 'لوحة التحكم',
      'nav.myShops': 'محلاتي',
      'nav.contracts': 'العقود',
      'nav.rentInvoices': 'الإيجار والفواتير',
      'nav.chequeStatus': 'حالة الشيكات',
      'nav.utilityBills': 'فواتير المرافق',
      'nav.payments': 'المدفوعات والإيصالات',
      'nav.documents': 'المستندات',
      'nav.reports': 'التقارير',
      'nav.salesData': 'إدارة بيانات المبيعات',
      'nav.salesDashboard': 'لوحة المبيعات',
      'nav.viewSales': 'عرض بيانات المبيعات',
      'nav.uploadSales': 'رفع بيانات المبيعات',
      'nav.salesReports': 'تقارير المبيعات',
      'nav.companyProfile': 'ملف الشركة',
      'nav.userAccess': 'المستخدمون والصلاحيات',
      'nav.configurations': 'الإعدادات والتكوينات',
      'nav.apiIntegration': 'تكامل واجهة البرمجة',
      'nav.security': 'الأمن والامتثال',
      'nav.system': 'تفضيلات النظام',
      'header.search': 'ابحث هنا...',
      'profile.viewProfile': 'عرض الملف الشخصي',
      'profile.trackRequests': 'تتبع الطلبات',
      'profile.logout': 'تسجيل الخروج',
      'footer.contactUs': 'اتصل بنا',
      'a11y.skip': 'تخطَّ إلى المحتوى الرئيسي',
      'login.title': 'تسجيل الدخول إلى حسابك',
      'login.lead': 'مرحبًا بعودتك. يُرجى إدخال بيانات الدخول للمتابعة.',
      'login.username': 'اسم المستخدم',
      'login.password': 'كلمة المرور',
      'login.signIn': 'تسجيل الدخول',
      'login.continue': 'متابعة',
      'login.signingIn': 'جارٍ تسجيل الدخول…',
      'login.demo': 'حساب تجريبي (كلمة المرور: woqod123)',
      'login.sub': 'توتال كنترول — بوابة العملاء',
      'login.otpTitle': 'تأكيد الهوية',
      'login.otpLead': 'أدخل رمز التحقق المكوّن من 6 أرقام الذي أرسلناه إلى جهة الاتصال المسجّلة.',
      'login.otpDemo': 'لأغراض العرض، الرمز الخاص بك هو:',
      'login.otpLabel': 'رمز التحقق',
      'login.verify': 'تحقق وتسجيل الدخول',
      'login.resend': 'إعادة إرسال الرمز',
      'login.back': 'رجوع',
      'notFound.title': 'الصفحة غير موجودة',
      'notFound.text': 'الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها.',
      'notFound.back': '← العودة إلى الرئيسية',
    },
  };

  constructor() {
    this.apply(this._lang$.value);
  }

  get lang(): Lang { return this._lang$.value; }
  get isRtl(): boolean { return this._lang$.value === 'ar'; }

  t(key: string): string {
    return this.dict[this._lang$.value][key] ?? this.dict.en[key] ?? key;
  }

  setLang(lang: Lang): void {
    localStorage.setItem(STORAGE_KEY, lang);
    this.apply(lang);
    this._lang$.next(lang);
  }

  toggle(): void {
    this.setLang(this._lang$.value === 'en' ? 'ar' : 'en');
  }

  private apply(lang: Lang): void {
    const rtl = lang === 'ar';
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
    document.body.classList.toggle('rtl', rtl);
  }

  private restore(): Lang {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'ar' ? 'ar' : 'en';
  }
}
