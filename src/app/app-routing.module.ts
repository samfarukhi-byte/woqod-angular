import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WoqodShellComponent } from './shared/components/woqod-shell/woqod-shell.component';
import { LoginComponent } from './shared/components/login/login.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent, title: 'Sign In · WOQOD Total Control' },
  {
    path: '',
    component: WoqodShellComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'csp',
        loadChildren: () => import('./modules/csp/csp.module').then((m) => m.CspModule),
      },
      {
        path: 'kenar',
        loadChildren: () => import('./modules/kenar/kenar.module').then((m) => m.KenarModule),
      },
      { path: '', redirectTo: 'csp/home', pathMatch: 'full' },
    ],
  },
  { path: '**', component: NotFoundComponent, title: 'Not Found · WOQOD Total Control' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
