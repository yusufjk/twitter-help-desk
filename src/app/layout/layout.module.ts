import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LayoutRoutingModule} from './layout-routing.module';
import {LayoutComponent} from './layout.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {TwitterDeskComponent} from './twitter-desk/twitter-desk.component';
import {TwitterCheckComponent} from './twitter-check/twitter-check.component';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {ImgCacheModule} from 'ng-imgcache';


import {SafePipe} from './../shared/safe.pipe';
import {LinkifyPipe} from './../shared/linkify.pipe'

@NgModule({
  imports: [
    CommonModule,
    LayoutRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ImgCacheModule
  ],
  declarations: [LayoutComponent, DashboardComponent, TwitterDeskComponent, TwitterCheckComponent, SafePipe, LinkifyPipe]
})
export class LayoutModule {
}
