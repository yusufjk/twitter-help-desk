import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ChattingRoutingModule} from './chatting-routing.module';
import {ChattingComponent} from './chatting.component';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [ChattingComponent],
  imports: [
    CommonModule,
    ChattingRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ChattingModule {
}
