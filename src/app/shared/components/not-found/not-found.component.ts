import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  template: `
    <div class="woqod-404">
      <div class="woqod-404__card">
        <div class="woqod-404__code">404</div>
        <h1 class="woqod-404__title">{{ 'notFound.title' | t }}</h1>
        <p class="woqod-404__text">{{ 'notFound.text' | t }}</p>
        <a class="csp-btn csp-btn--primary" routerLink="/csp/home">{{ 'notFound.back' | t }}</a>
      </div>
    </div>
  `,
  styles: [':host { display: block; }'],
})
export class NotFoundComponent {}
