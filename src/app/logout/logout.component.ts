import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  constructor(private cookieService : CookieService, private router: Router) { }

  ngOnInit() {
    this.removeCookie()
  }

  removeCookie(){
    console.log('deleting cookie')
    this.cookieService.delete('authToken')
    localStorage.removeItem('authToken')

    this.router.navigate(['/login']);
  }

}
