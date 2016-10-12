import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { Result } from '../model/result';

@Injectable()
export class HarnessApiService {

  constructor (private http: Http) {}

  private baseUrl = 'https://test.dataselect.us/fetest/v1';
  private headers = {
    'userToken': 'any',
    'x-api-key': 'JyO3NvBVEy1vOljETe8T920rEJ0BdirK5dDlSM0J',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  getEntity(type: string, id: string): Observable<Result> {
    const url = `${this.baseUrl}/${type}s/${id}`;
    const slug = `[GET] /${type}s/${id}`;
    let headers = new Headers(this.headers);
    let options = new RequestOptions({ headers });

    console.log(`${slug} STARTED...`);
    return this.http.get(url, options)
                     .map((res:Response) => {
                       console.log(`${slug} SUCCESS...`, res.json());
                       return this.parseResponse(type, res);
                     })
                     .catch((err:any) => {
                       console.log(`${slug} ERROR!!!`, err);
                       return Observable.throw('Server error');
                     });
  }

  createEntity(type: string, body: Object): Observable<Result> {
    const url = `${this.baseUrl}/${type}s`;
    const slug = `[POST] /${type}s`;
    let headers = new Headers(this.headers);
    let options = new RequestOptions({ headers });

    console.log(`${slug} STARTED WITH...`, body);
    return this.http.post(url, body, options)
                    .map((res:Response) => {
                      console.log(`${slug} SUCCESS...`, res.json());
                      return this.parseResponse(type, res);
                    })
                    .catch((err:any) => {
                      console.log(`${slug} ERROR!!!`, err);
                      return Observable.throw('Server error')
                    });
  }

  pollEntity(type: string, id: string): Observable<Result> {
    const url = `${this.baseUrl}/${type}s/queue-jobs/${id}`;
    const slug = `[GET] /${type}s/queue-jobs/${id}`;
    let headers = new Headers(this.headers);
    let options = new RequestOptions({ headers });

    console.log(`${slug} STARTED...`);
    return this.http.get(url, options)
                     .map((res:Response) => {
                       console.log(`${slug} SUCCESS...`, res.json());
                       return this.parseResponse(type, res);
                     })
                     .catch((err:any) => {
                       console.log(`${slug} ERROR!!!`, err);
                       return Observable.throw('Server error');
                     });
  }

  private parseResponse(type: string, response: Response): Result {
    const responseData = response.json().data;
    return new Result(
      responseData.id,
      type,
      responseData.attributes,
    );
  }
}
