import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {LayoutComponent} from './layout.component'
import {DashboardComponent} from './dashboard/dashboard.component'

import {TwitterDeskComponent} from './twitter-desk/twitter-desk.component'
import {TwitterCheckComponent} from './twitter-check/twitter-check.component'

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'twitter-check'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      }, {
        path: 'twitter-desk',
        component: TwitterDeskComponent
      }, {
        path: 'twitter-check',
        component: TwitterCheckComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class LayoutRoutingModule {
}
