import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';
import { environment } from './../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class SocketServiceService {

  constructor() { }

  private url = environment.wsUrl;
  private socket;

  sendMessage(message) {
    this.socket.emit('message', message)
  }

  register(message) {
    this.socket.emit('register', message)
  }

  getMessages() {
    let observable = new Observable(observer => {
      this.socket = io(this.url)
      this.socket.on('newTweet', (data) => {
        console.log('get new message ', data)
        observer.next(data)
      })

      return () => {
        this.socket.disconnect()
      }
    })
    return observable
  }
}
