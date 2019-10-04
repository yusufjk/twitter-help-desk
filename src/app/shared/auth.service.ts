import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service'

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private myRoute: Router, private cookieService: CookieService) { }
  /* set cookie */
  sendToken(cookieName: string, value: any, date: any, path: any) {
    this.cookieService.set(cookieName, value, date, path)
    /* setting local storage also */
    this.sendLocalStorageToken(cookieName, value)
  }

  sendLocalStorageToken(cookieName, value: string) {
    localStorage.setItem('authToken', value)
  }

  /* get cookie */
  getToken(cookieName) {
    return this.cookieService.get(cookieName)
  }

  getLocalStorageToken(cookieName) {
    return localStorage.getItem(cookieName)
  }

  /* checking logged in or not */
  isLoggednIn() {
    console.log(' auth token ', this.getToken('authToken'), this.getToken('authToken') !== null)
    let returnData = (this.getToken('authToken') === null || this.getToken('authToken') === "" || this.getToken('authToken') === undefined) && (this.getLocalStorageToken('authToken') === null || this.getLocalStorageToken('authToken') === "" || this.getLocalStorageToken('authToken') === undefined)
    return !returnData
  }

  /* remove cookie */
  removeToken(cookieName) {
    return this.cookieService.delete(cookieName);
    this.removeLocalStorageToken(cookieName)
  }

  removeLocalStorageToken(cookieName) {
    return localStorage.removeItem(cookieName)
  }

  /* functioning logout */
  logout() {
    this.cookieService.delete('authToken');
    this.myRoute.navigate(["/login"]);
  }
}
