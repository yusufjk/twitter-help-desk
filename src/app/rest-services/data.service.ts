import {Injectable} from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';
import {environment} from '../../environments/environment';
import 'rxjs/add/operator/map';
import {AuthService} from './../shared/auth.service'

@Injectable({
  providedIn: 'root'
})
export class DataService {

  apiUrl = environment.apiUrl;

  constructor(public http: Http, private authService: AuthService) {
  }

  /* get method function */
  get(url) {
    const token = this.authService.getToken('authToken');
    const opts = new RequestOptions();

    let headers = new Headers();
    headers.append('x-access-token', token);

    opts.headers = headers;

    return this.http.get(this.apiUrl + url, opts)
      .toPromise()
      .then(
        res => {
          return {
            status: res.status,
            json: res.json()
          }
        },
        error => {
          return {
            status: error.status,
            json: error.json()
          }
        }
      )
  }

  /* post method function */
  post(url, body) {
    const token = this.authService.getToken('authToken');
    let headers = new Headers();

    headers.append('x-access-token', token);

    return this.http.post(this.apiUrl + url, body, {headers: headers})
      .toPromise()
      .then(
        res => {
          return {
            status: res.status,
            json: res.json()
          }
        },
        error => {
          return {
            status: error.status,
            json: error.json()
          }
        }
      )
  }

  getParams(url, params) {
    const token = this.authService.getToken('authToken');
    const opts = new RequestOptions();
    opts.params = params;

    let headers = new Headers();
    headers.append('x-access-token', token);

    opts.headers = headers;

    return this.http.get(this.apiUrl + url, opts)
      .toPromise()
      .then(
        res => {
          return {
            status: res.status,
            json: res.json()
          }
        },
        error => {
          return {
            status: error.status,
            json: error.json()
          }
        }
      )
  }
}
