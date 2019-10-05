import {Component, OnDestroy, OnInit} from '@angular/core';
// import { Control }           from '@angular/common';
import {SocketServiceService} from './../shared/socket-service.service';
import {CookieService} from 'ngx-cookie-service'

@Component({
  moduleId: module.id,
  selector: 'chat',
  template: `
      <div *ngFor="let message of messages">
          {{message.text}}
      </div>
      <input [(ngModel)]="message" name="message"/>
      <button (click)="sendMessage()">Send</button>`,
  providers: [SocketServiceService]
})
export class ChattingComponent implements OnInit, OnDestroy {
  messages = [];
  connection;
  message;

  constructor(private socketServiceService: SocketServiceService, private cookieService: CookieService) {
  }

  register() {
    let authToken = this.cookieService.get('authToken');
    if (authToken) {
      authToken = localStorage.getItem('authToken')
    }
    console.log('resigter', authToken);
    this.socketServiceService.register(authToken)
  }

  sendMessage() {
    console.log('ds');
    this.socketServiceService.sendMessage(this.message);
    this.message = '';
  }

  ngOnInit() {

    let newconnection = this.socketServiceService.getMessages().subscribe(message => {
      console.log('ss ', message);
      this.messages.push(message)
    });
    this.register()
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }
}
