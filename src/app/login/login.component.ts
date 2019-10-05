import {Component, OnInit} from '@angular/core';

import {DataService} from './../rest-services/data.service';
import {AuthService} from './../shared/auth.service';

import {Router} from '@angular/router'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  userData: any = {};
  message: String;
  alertMessageType: String;

  constructor(private dataService: DataService, private authService: AuthService, private router: Router) {
  }

  ngOnInit() {
    /* checking already logged or not */
    this.checkingAlreadyLoggedOrNot()
  }

  formSubmit() {
    console.log('form submitted');
    console.log('user data', this.userData);

    this.message = 'Processing request';
    this.alertMessageType = 'info';

    /* submitting the data */
    this.dataService.getParams('/api/user/login', this.userData).then((userResponse) => {
      console.log('user response ', userResponse);
      this.userData = {};

      if (userResponse.status === 200) {
        this.message = userResponse.json.message;
        this.alertMessageType = 'success';
        this.authService.sendToken('authToken', userResponse.json.data.token, new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), '/');

        this.router.navigate(['/twitter-check'])
        // this.cookieService.set('authToken', userResponse.json.data.token, new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), '/');
      } else if (userResponse.status > 200 && userResponse.status <= 300) {
        this.message = userResponse.json.message;
        this.alertMessageType = 'info'
      } else if (userResponse.status === 0) {
        this.message = 'Some thing went Wrong. Please try again later.!';
        this.alertMessageType = 'danger'
      } else if (userResponse.status >= 400) {
        this.message = userResponse.json.message;
        this.alertMessageType = 'danger'
      }
    }, (error) => {
      console.log('user response2 ', error);
      this.userData = {};

      this.message = error && error.message ? error.message : 'Some thing went Wrong. Please try again later.!';
      this.alertMessageType = 'danger'
    })
  }

  /* checking alredy logged or not */
  checkingAlreadyLoggedOrNot() {
    console.log('checking already logged');
    if (this.authService.isLoggednIn()) {
      console.log('already login');
      /* already login */
      this.router.navigate(['/twitter-check'])
    }
  }
}
