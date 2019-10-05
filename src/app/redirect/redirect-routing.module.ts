import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RedirectComponent} from './redirect.component'

const routes: Routes = [
  {
    path: '',
    component: RedirectComponent
  }, {
    path: ':url',
    component: RedirectComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RedirectRoutingModule {
}
