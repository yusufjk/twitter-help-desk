import { Component, OnInit, OnDestroy } from '@angular/core';

import { DataService } from './../../rest-services/data.service'
import { Router } from '@angular/router'
import { environment } from './../../../environments/environment'
import { SocketServiceService } from './../../shared/socket-service.service';
import { CookieService } from 'ngx-cookie-service'
import { ImgCacheService } from 'ng-imgcache';

import { trigger, animate, style, group, animateChild, query, stagger, transition, state } from '@angular/animations';
import { AuthService } from './../../shared/auth.service'

@Component({
  selector: 'app-twitter-desk',
  templateUrl: './twitter-desk.component.html',
  styleUrls: ['./twitter-desk.component.css'],
  providers: [SocketServiceService],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({ opacity: 0 }),
          animate('3000ms', style({ opacity: 1 }))
        ]),
        // transition(':leave', [
        //   style({transform: 'translateX(0)', opacity: 1}),
        //   animate('3000ms', style({transform: 'translateX(100%)', opacity: 0}))
        // ])
      ]
    )
  ]
})
export class TwitterDeskComponent implements OnInit, OnDestroy {

  // constructor(private dataService: DataService, private router: Router, private socketServiceService : SocketServiceService, private cookieService : CookieService) { }
  constructor(private socketServiceService: SocketServiceService, private dataService: DataService, private router: Router, private cookieService: CookieService, private imgCache: ImgCacheService, private autheService: AuthService) {
    imgCache.init({})
  }
  connection: any
  messages: any = []

  sampleHtml = '<b>ss </b> <i>dd</i> <a class="twitter-url" href="/redirect/christyram99" ">@ramaiah74297305</a>'
  mentionsData: any
  mentionsDataIndexWise: any = {}
  message: String
  totalCount: Number
  inReplyIdString: string
  inReplyUserScreenName: String
  inReplyIdStringPresent: Boolean = false
  inReplyData: any
  twitter: any
  apiUrl = environment.apiUrl
  totalAvailableCharacters: any = 280
  totalCharacters: any = 280
  replyDataMessage: String
  replyDataChecking: Boolean = false
  postTweetChecking: Boolean = false
  postTweetStatus: Boolean = false
  postTweetMessage: String

  setIntId: any
  name: String

  userDetailsDisplay: any = {
    qualification: false,
    lastViewed: false,
    externalProfiles: false,
    latestConservations: false,
    notes: false,
    details: false,
    tags: false,
    segments: false
  }

  widthExtend: Boolean = false
  widthDeExtend: Boolean = false

  userData: any = {}

  register() {
    let authToken = this.cookieService.get('authToken')
    if (authToken) {
      authToken = localStorage.getItem('authToken')
    }
    console.log('resigter', authToken)
    this.socketServiceService.register(authToken)
  }

  adjustNewMention(data) {
    console.log('data ', data, typeof (data))
    data.forEach((ele) => {
      if (this.mentionsDataIndexWise[ele.maintwittweStatusIdStr] === undefined) {
        this.mentionsData.unshift(ele)
        /* update the indexes */
        this.adjustingIndexes()
        console.log('mention twitter id string index ', this.mentionsDataIndexWise[ele.maintwittweStatusIdStr])
        this.mentionsData[this.mentionsDataIndexWise[ele.maintwittweStatusIdStr]].newMentionsCount = 1
      } else {
        if (this.mentionsData[this.mentionsDataIndexWise[ele.maintwittweStatusIdStr]].newMentionsCount && this.mentionsData[this.mentionsDataIndexWise[ele.maintwittweStatusIdStr]].newMentionsCount !== 0) {
          console.log('if', this.mentionsData[this.mentionsDataIndexWise[ele.maintwittweStatusIdStr]].newMentionsCount)
          this.mentionsData[this.mentionsDataIndexWise[ele.maintwittweStatusIdStr]].newMentionsCount += 1
        } else {
          console.log('else')
          this.mentionsData[this.mentionsDataIndexWise[ele.maintwittweStatusIdStr]].newMentionsCount = 1
        }

        if(this.inReplyIdStringPresent){
          if(this.inReplyIdString === ele.maintwittweStatusIdStr){
            this.inReplyData.push(ele)
          }
        }
      }
    })
  }

  adjustingIndexes(){
    /* inserting mentions data into object */
    let index = 0
    this.mentionsData.forEach((ele) => {
      this.mentionsDataIndexWise[ele.maintwittweStatusIdStr] = index
      index++;
    })
  }

  removeNewMentionCount(){
    // let inReplyIdNumber = Number(this.inReplyIdString)
    // console.log('s1', this.inReplyIdString, inReplyIdNumber)
    // console.log('s2', this.mentionsDataIndexWise[this.inReplyIdString], this.mentionsDataIndexWise[inReplyIdNumber])
    this.mentionsData[this.mentionsDataIndexWise[this.inReplyIdString]].newMentionsCount = 0
  }

  ngOnInit() {
    this.connection = this.socketServiceService.getMessages().subscribe(message => {
      console.log('ss ', JSON.parse(JSON.stringify(message)))
      if (message['statusCode'] === 'SUCCESS') {
        /* calling two save in mentions data */
        this.adjustNewMention(message['data'])
      }
    })

    this.inReplyIdStringPresent = false
    this.mentionsData = []
    this.message = 'Getting data'
    this.totalCount = 0
    this.inReplyData = []
    this.twitter = {}

    /* get new mentions */
    // this.getNewMentions()

    this.getMentions(1)
  }

  unhideUserDetails(property) {
    this.userDetailsDisplay[property] = !this.userDetailsDisplay[property]
  }

  encode(url) {
    return encodeURI(url)
  }

  redirect(url) {
    console.log('sdf')
    return '/redirect/' + encodeURI('http://google.com')
  }

  convertData(data) {
    let exp = /\@\w+/
    let splittedData = data.match(/\@\w+/g)

    splittedData.forEach((element) => {
      let newElement = element
      newElement = newElement.replace('@', '')

      let nn = '<a class="twitter-url" style="color:black; font-weight: 440" target="_blank" href="/redirect/' + newElement + '">' + element + '</a>'
      data = data.replace(element, nn)
    });

    // console.log('data2 ', data)

    return data
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }

  getMentions(page) {
    console.log('int getMentions')
    console.log('user data', this.mentionsData)

    this.message = 'Processing request'
    let params = {
      page: page
    }

    /* submitting the data */
    this.dataService.getParams('/api/twitter/display-mentions', params).then((userResponse) => {
      console.log("user response ", userResponse)

      if (userResponse.status === 200) {
        this.mentionsData = userResponse.json.data.mentions
        this.totalCount = this.mentionsData.length
        this.userData = userResponse.json.data.user
        this.adjustingIndexes()
      } else if (userResponse.status == 201) {
        this.router.navigate(['/twitter-check'])
      } else if (userResponse.status === 202) {
        /* accounts not found */
        // this.autheService.removeToken('authToken')
        this.router.navigateByUrl('/twitter-check?token_expire=true')
      } else if (userResponse.status > 202 && userResponse.status <= 300) {
        this.message = userResponse.json.message
      } else if (userResponse.status === 0) {
        this.message = 'Some thing went Wrong. Please try again later.!'
      } else if (userResponse.status >= 400) {
        this.message = userResponse.json.message

      }
      this.register()
      console.log('this mentionsData', this.mentionsData, this.userData, this.mentionsDataIndexWise)
    }, (error) => {
      console.log("user response2 ", error)
      this.mentionsData = []

      this.message = error && error.json.message ? error.json.message : 'Some thing went Wrong. Please try again later.!'
    })
  }

  // register(){
  //   console.log('called registered socket ')
  //   let authToken = this.cookieService.get('authToken')
  //   console.log('resigter', authToken)
  //   this.socketServiceService.register(authToken)
  // }

  getMentionReplies(page) {
    console.log('getMentionReplies');
    console.log('user data', this.mentionsData)

    if (!this.inReplyIdString) {
      console.log('no data found')
      return
    }

    this.message = 'Processing request'
    let params = {
      page: page,
      getByStatusString: this.inReplyIdString
    }

    this.replyDataChecking = true
    /* submitting the data */
    this.dataService.getParams('/api/twitter/display-mentions', params).then((userResponse) => {
      this.replyDataChecking = false
      console.log("user response21 ", userResponse)

      if (userResponse.status === 200) {
        this.postTweetStatus = true
        this.inReplyData = userResponse.json.data.mentions
        // this.replyDataMessage = userResponse.json.data.count
      } else if (userResponse.status == 201) {
        this.router.navigate(['/twitter-check'])
      } else if (userResponse.status === 202) {
        // this.autheService.removeToken('authToken')
        /* accounts not found */
        // this.router.navigateByUrl('/twitter-check?token_expire=true')
      } else if (userResponse.status > 202 && userResponse.status <= 300) {
        this.replyDataMessage = userResponse.json.message
      } else if (userResponse.status === 0) {
        this.replyDataMessage = 'Some thing went Wrong. Please try again later.!'
      } else if (userResponse.status >= 400) {
        this.replyDataMessage = userResponse.json.message

      }
      console.log('this reply mentionsData', this.inReplyData)
    }, (error) => {
      console.log("user response2 ", error)
      this.mentionsData = []

      this.message = error && error.json.message ? error.json.message : 'Some thing went Wrong. Please try again later.!'
    })
  }

  getNewMentions() {
    console.log('in getNewMentions')
    this.dataService.get('/api/twitter/mentions').then((result) => {
      console.log('new mentions data ', result)
    }, (error) => {
      console.log('new mentions error', error)
    })
  }

  inReplyDataAdd(index, inReplyIdString) {
    this.mentionsData[index].newMentionsCount = 0
    this.totalAvailableCharacters = 280
    this.postTweetChecking = false
    this.postTweetStatus = false
    this.postTweetMessage = null
    this.name = this.mentionsData[index].user.name
    this.twitter.twitterText = ""

    this.inReplyData = []
    console.log('clicked in reply data add')
    this.inReplyData.push(this.mentionsData[index])
    this.inReplyIdString = inReplyIdString
    this.inReplyUserScreenName = this.mentionsData[index].user.screen_name
    this.totalAvailableCharacters = Number(this.totalAvailableCharacters) - Number(this.inReplyUserScreenName.length)
    this.inReplyIdStringPresent = true
    console.log('in reply data ', this.inReplyData, this.totalAvailableCharacters)

    /* getting previous replies */
    this.getMentionReplies(1)
  }

  calculateCharacters() {
    this.totalAvailableCharacters = Number(this.totalCharacters) - Number(this.twitter.twitterText ? this.twitter.twitterText.length : 0) - Number(this.inReplyUserScreenName.length)
  }

  /* post tweet */
  postTweet() {

    if (!this.twitter.twitterText || !this.twitter.twitterText.length) {
      return
    }

    this.postTweetChecking = true
    // this.twitter.inReplyIdString = this.inReplyIdString
    console.log('twitter data', this.twitter)

    let params = {
      inReplyToStatusId: this.inReplyIdString,
      twitterText: this.twitter.twitterText
    }

    /* checking user mentions or not */
    console.log('in reply screen name ', this.inReplyUserScreenName)
    if (this.twitter.twitterText.indexOf(this.inReplyUserScreenName) === -1) {
      /* add screen name at the end */
      params.twitterText = params.twitterText + ' @' + this.inReplyUserScreenName
    }

    this.inReplyData.push({
      user: this.userData,
      full_text: params.twitterText,
      created_at: Date.now(),
      replyMessageFromTextArea: true
    })

    this.twitter.twitterText = ''
    this.totalAvailableCharacters = 280

    let newIndex = this.inReplyData.length - 1
    let newInReplyData = this.inReplyData

    console.log('params for twitter post ', params)

    /* submitting the data */
    this.dataService.post('/api/twitter/post-tweet', params).then((userResponse) => {

      console.log("user response ", userResponse)
      if (userResponse.status === 200) {
        this.twitter.twitterText = ''
        this.totalAvailableCharacters = 280

        this.postTweetMessage = 'Successfully posted.'
        this.postTweetStatus = true
        console.log('in reply data ', this.inReplyData)

        setTimeout(function () {
          /* hiding success message */
          newInReplyData[newIndex].replyMessageFromTextArea = false
        }, 4000)
      } else if (userResponse.status == 202) {
        console.log('status code', userResponse.json.statusCode)
        /* remove tokesn */
        // this.autheService.removeToken('authToken')

        this.router.navigateByUrl('/twitter-check?token_expire=true')
      } else if (userResponse.status > 200 && userResponse.status <= 300) {
        this.twitter.twitterText = ''
        this.totalAvailableCharacters = 280

        this.postTweetMessage = userResponse.json.message ? userResponse.json.message : 'Something wenth wrong'
        this.postTweetStatus = false
      } else if (userResponse.status === 0) {
        this.twitter.twitterText = ''
        this.totalAvailableCharacters = 280

        this.postTweetMessage = 'Some thing went Wrong. Please try again later.!'
      } else if (userResponse.status >= 400) {
        console.log('status code', userResponse.json.statusCode)
        if (userResponse.json.statusCode === 'TWITTER-TOKEN-ERROR') {
          this.router.navigateByUrl('/twitter-check?token_expire=true')
        } else {
          this.message = userResponse.json.message
        }
      }

    }, (error) => {
      console.log("user response2 ", error)
      this.postTweetMessage = 'Something went wrong'
    })
  }

  ram(id_str) {
    console.log('ss', id_str)
  }

  dateConversion(timestamp) {
    let date = new Date(timestamp)
    return date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + '  ' + date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear()
  }

  /* convert to short form */
  dateConvertIntoShortFormat(timestamp) {
    let currentDate = Date.now()
    let dateDifference = currentDate - timestamp
    let shortForm

    if (currentDate - timestamp < 60 * 1000) {
      shortForm = Math.floor(dateDifference / 1000) + 's'
    } else if (currentDate - timestamp < (60 * 60 * 1000)) {
      shortForm = Math.floor(dateDifference / (60 * 1000)) + 'm'
    } else if (currentDate - timestamp < (24 * 60 * 60 * 1000)) {
      shortForm = Math.floor(dateDifference / (60 * 60 * 1000)) + 'h'
    } else {
      shortForm = Math.floor(dateDifference / (24 * 60 * 60 * 1000)) + 'd'
    }
    return shortForm
  }

  /* truncate display characters */
  truncateChar(text: String) {
    let length = 35
    return (text.length > length) ? text.substring(0, length) + '...' : text
  }

  ss() {
    console.log('$$$$$$$$$$$$ clicked refresh')
    this.getMentionReplies(1)
    this.getMentions(1)
    this.getNewMentions()
  }

  togglePreLeftBar() {
    if (this.widthExtend === false && this.widthDeExtend === false) {
      /* if default pre left bar present */
      this.widthDeExtend = true

      /* if default pre left bar not present */
      // this.widthExtend = true
    } else {
      if (!this.widthExtend) {
        this.widthDeExtend = !this.widthDeExtend
        this.widthExtend = !this.widthExtend
      } else if (!this.widthDeExtend) {
        this.widthExtend = !this.widthExtend
        this.widthDeExtend = !this.widthDeExtend
      }
    }
  }

  refreshRepliesData() {
    this.getMentionReplies(1)
  }
}
