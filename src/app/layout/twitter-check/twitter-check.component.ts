import { Component, OnInit } from '@angular/core';
import { environment } from './../../../environments/environment'

import { DataService } from './../../rest-services/data.service'
import { Router, ActivatedRoute } from '@angular/router'
@Component({
  selector: 'app-twitter-check',
  templateUrl: './twitter-check.component.html',
  styleUrls: ['./twitter-check.component.css']
})
export class TwitterCheckComponent implements OnInit {

  constructor(private dataService: DataService, private router: Router, private activatedRoute: ActivatedRoute) { }

  message: String
  messageAlertType: String
  twitterConnectDisplay: Boolean = true
  apiUrl = environment.apiUrl
  loading: Boolean = true

  ngOnInit() {
    let params = this.activatedRoute.snapshot.params;
    let paramsData = this.activatedRoute.snapshot.queryParams;
    console.log(paramsData, params)
    if (paramsData.login_failed) {
      this.loading = false
      this.message = paramsData.message ? paramsData.message : 'Login failed. Please connect twitter again'
      this.messageAlertType = 'danger'
    }else if(paramsData.token_expire){
      this.loading = false
      this.message = paramsData.message ? paramsData.message : 'Your tokens was expired. Please connect twitter again.'
      this.messageAlertType = 'danger'
    } else {
      this.checkConnectedTwitterAccounts()
    }
  }


  connectToTwitter() {
    let twitterAuthUrl = environment.twitterAuthUrl
    window.location.href = twitterAuthUrl
  }

  /* check connected twitter accounts */
  checkConnectedTwitterAccounts() {
    this.message = 'checking accounts connected or not'
    console.log('checkConnectedTwitterAccounts')
    this.dataService.get('/api/twitter/check-connected-accounts').then((result) => {
      console.log('result', result)
      
      if (result.status === 200) {
        this.message = 'Active account present.'
        this.messageAlertType = 'success'

        /* navigating twitter desk */
        this.router.navigate(['/twitter-desk'])
      } else if (result.status === 201) {
        this.message = 'InActive account present. Please re connect with Twitter'
        this.messageAlertType = 'info'
        this.loading = false
      } else if (result.status === 202) {
        this.message = 'No accounts present. Please connect with Twitter.'
        this.messageAlertType = 'info'
        this.loading = false
      } else {
        this.message = result.json.message
        this.messageAlertType = 'info'
        this.loading = false
      }
      
    }).catch((error) => {
      console.log('error ', error)
      this.message = error.json.message ? error.json.message : 'Something went wrong. Please try again'
      this.messageAlertType = 'info'
    })
  }
}
