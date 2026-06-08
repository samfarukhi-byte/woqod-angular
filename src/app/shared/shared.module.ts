import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { WoqodShellComponent } from './components/woqod-shell/woqod-shell.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { ProfileDropdownComponent } from './components/profile-dropdown/profile-dropdown.component';
import { WoqodChatbotComponent } from './components/woqod-chatbot/woqod-chatbot.component';
import { LoginComponent } from './components/login/login.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';
import { TranslatePipe } from './pipes/translate.pipe';
import { FocusTrapDirective } from './directives/focus-trap.directive';

@NgModule({
  declarations: [
    WoqodShellComponent,
    BreadcrumbComponent,
    ProfileDropdownComponent,
    WoqodChatbotComponent,
    LoginComponent,
    NotFoundComponent,
    ToastContainerComponent,
    TranslatePipe,
    FocusTrapDirective,
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    WoqodShellComponent,
    BreadcrumbComponent,
    ProfileDropdownComponent,
    WoqodChatbotComponent,
    LoginComponent,
    NotFoundComponent,
    ToastContainerComponent,
    TranslatePipe,
    FocusTrapDirective,
  ],
})
export class SharedModule {}
