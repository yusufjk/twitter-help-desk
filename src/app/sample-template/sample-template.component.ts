import { Component, OnInit } from '@angular/core';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-sample-template',
  templateUrl: './sample-template.component.html',
  styleUrls: ['./sample-template.component.css']
})
export class SampleTemplateComponent implements OnInit {

  constructor() { }

  apiUrl: string = environment.apiUrl
  mentions: any = []
  replies: any = []

  defaultMentionIndex = 0
  ngOnInit() {
    this.mentions = [
      {
        name: 'K.V.Rmaiah',
        date: '20s',
        full_text: 'Its okay done.',
        image: 'https://pbs.twimg.com/profile_images/912340163019206658/oWYK_f3B_normal.jpg'
      }, {
        name: 'Seetha',
        date: '50s',
        full_text: 'Heollw sldf dsetsdjfs.',
        image: 'https://pbs.twimg.com/profile_images/813396403019923459/hlzuzaPw_normal.jpg'
      }, {
        name: 'Madd',
        date: '3m',
        full_text: 'Let me know.1',
        image: 'https://pbs.twimg.com/profile_images/912340163019206658/oWYK_f3B_normal.jpg'
      }, {
        name: 'K.V.Rmaiah',
        date: '20s',
        full_text: 'Its okay done.2',
        image: 'https://pbs.twimg.com/profile_images/813396403019923459/hlzuzaPw_normal.jpg'
      }, {
        name: 'K.V.Rmaiah',
        date: '20s',
        full_text: 'Its okay done.3',
        image: 'https://pbs.twimg.com/profile_images/912340163019206658/oWYK_f3B_normal.jpg'
      }, {
        name: 'K.V.Rmaiah',
        date: '20s',
        full_text: 'Its okay done.4',
        image: 'https://pbs.twimg.com/profile_images/912340163019206658/oWYK_f3B_normal.jpg'
      }, {
        name: 'K.V.Rmaiah',
        date: '20s',
        full_text: 'Its okay done.5',
        image: 'https://pbs.twimg.com/profile_images/912340163019206658/oWYK_f3B_normal.jpg'
      }, {
        name: 'K.V.Rmaiah',
        date: '20s',
        full_text: 'Its okay done.6',
        image: 'https://pbs.twimg.com/profile_images/912340163019206658/oWYK_f3B_normal.jpg'
      }, {
        name: 'K.V.Rmaiah',
        date: '20s',
        full_text: 'Its okay done.7',
        image: 'https://pbs.twimg.com/profile_images/912340163019206658/oWYK_f3B_normal.jpg'
      }, {
        name: 'K.V.Rmaiah',
        date: '20s',
        full_text: 'Its okay done.8',
        image: 'https://pbs.twimg.com/profile_images/912340163019206658/oWYK_f3B_normal.jpg'
      }
    ]

    this.replies = [
      {
        name: 'K.V.Rmaiah',
        date: '20s',
        full_text: 'Its okay done.',
        image: 'https://pbs.twimg.com/profile_images/912340163019206658/oWYK_f3B_normal.jpg'
      }, {
        name: 'Seetha',
        date: '50s',
        full_text: 'Heollw sldf dsetsdjfs.',
        image: 'https://pbs.twimg.com/profile_images/813396403019923459/hlzuzaPw_normal.jpg'
      }, {
        name: 'Madd',
        date: '3m',
        full_text: 'Let me know.1',
        image: 'https://pbs.twimg.com/profile_images/912340163019206658/oWYK_f3B_normal.jpg'
      }, {
        name: 'K.V.Rmaiah',
        date: '20s',
        full_text: 'Its okay done.2',
        image: 'https://pbs.twimg.com/profile_images/813396403019923459/hlzuzaPw_normal.jpg'
      }, {
        name: 'K.V.Rmaiah',
        date: '20s',
        full_text: 'Its okay done.3',
        image: 'https://pbs.twimg.com/profile_images/912340163019206658/oWYK_f3B_normal.jpg'
      }, {
        name: 'K.V.Rmaiah',
        date: '20s',
        full_text: 'Its okay done.4',
        image: 'https://pbs.twimg.com/profile_images/912340163019206658/oWYK_f3B_normal.jpg'
      }, {
        name: 'K.V.Rmaiah',
        date: '20s',
        full_text: 'Its okay done.5',
        image: 'https://pbs.twimg.com/profile_images/912340163019206658/oWYK_f3B_normal.jpg'
      }, {
        name: 'K.V.Rmaiah',
        date: '20s',
        full_text: 'Its okay done.6',
        image: 'https://pbs.twimg.com/profile_images/912340163019206658/oWYK_f3B_normal.jpg'
      }, {
        name: 'K.V.Rmaiah',
        date: '20s',
        full_text: 'Its okay done.7',
        image: 'https://pbs.twimg.com/profile_images/912340163019206658/oWYK_f3B_normal.jpg'
      }, {
        name: 'K.V.Rmaiah',
        date: '20s',
        full_text: 'Its okay done.8',
        image: 'https://pbs.twimg.com/profile_images/912340163019206658/oWYK_f3B_normal.jpg'
      }
    ]
  }

  clickMention(index) {
    this.defaultMentionIndex = index
  }

}
