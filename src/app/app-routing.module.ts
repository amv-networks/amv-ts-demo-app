import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppConfig } from './config/app.config';
import { Error404Component } from './core/error404/error-404.component';

const routes: Routes = [
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: '', loadChildren: './main/main.module#MainModule' },
  { path: AppConfig.routes.error404, component: Error404Component },

  // otherwise redirect to 404
  { path: '**', redirectTo: '/' + AppConfig.routes.error404 }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      enableTracing: AppConfig.debug['enableTracing']
    })
  ],
  exports: [
    RouterModule
  ]
})

export class AppRoutingModule {
}
