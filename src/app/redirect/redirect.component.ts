import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router'

@Component({
  selector: 'app-redirect',
  templateUrl: './redirect.component.html',
  styleUrls: ['./redirect.component.css']
})
export class RedirectComponent implements OnInit {

  constructor(private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((data) => {
      console.log('params data ', data);
      if (data.url) {
        window.location.href = 'https://twitter.com/' + data.url
      }
    })
  }

}
