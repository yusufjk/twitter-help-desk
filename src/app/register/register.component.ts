import { Component, OnInit } from '@angular/core';
import { DataService } from './../rest-services/data.service'

import { AuthService } from './../shared/auth.service';
import { Router } from '@angular/router'

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  userData: any = {}
  message: String
  alertMessageType: String

  constructor(private dataService: DataService, private authService: AuthService, private router: Router) { }

  ngOnInit() {

  }

  formSubmit() {
    console.log('form submitted');
    console.log('user data', this.userData)

    this.message = 'Processing request'
    this.alertMessageType = 'info'

    /* submitting the data */
    this.dataService.post('/api/user/register', this.userData).
    then((userResponse) => {
      console.log("user response ", userResponse)
      this.userData = {}

      if(userResponse.status === 200){
        this.message = userResponse.json.message
        this.alertMessageType = 'success'
      }else if (userResponse.status > 200 && userResponse.status <= 300 ) {
        this.message = userResponse.json.message
        this.alertMessageType = 'info'
      } else if(userResponse.status === 0){
        this.message = 'Some thing went Wrong. Please try again later.!'
        this.alertMessageType = 'danger'
      } else if(userResponse.status >= 400){
        this.message = userResponse.json.message
        this.alertMessageType = 'danger'
      }
    }, (error) => {
      console.log("user response2 ", error)
      this.userData = {}

      this.message = error && error.message ? error.message : 'Some thing went Wrong. Please try again later.!'
      this.alertMessageType = 'danger'
    })
  }

  /* checking alredy logged or not */
  checkingAlreadyLoggedOrNot() {
    console.log('checking already logged')
    if (this.authService.isLoggednIn()) {
      console.log('already login')
      /* already login */
      this.router.navigate(['/twitter-check'])
    }
  }
}
