import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { Result } from '../model/result';

@Injectable()
export class HarnessApiService {

  private baseUrl = 'https://test.dataselect.us/public-staging/v1';
  private headers = {
    'x-api-key': 'Egqw4MFFvu3Lgv65tCenr1pwbUN1t4Ee6KcPI0ZK',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  constructor (private http: Http) {}

  getEntity(type: string, datasetCode: string, id: string, isList?: boolean): Observable<Result> {
    let url = `${this.baseUrl}/${type}s/${id}`;
    let slug = `[GET]  /${type}s/${id}`;
    let headers = new Headers(this.headers);
    let options = new RequestOptions({ headers });

    if ( isList ) {
      url += '/lists';
      slug += '/lists';
    }

    return this.http.get(url, options)
                     .map((res: Response) => {
                       console.log(`${slug} Response`, res.json());
                       return this.parseResponse(type, datasetCode, res, isList);
                     })
                     .catch((err: any) => {
                       console.log(`${slug} ERROR!!!`, err);
                       return Observable.throw('Server error');
                     });
  }

  createEntity(type: string, datasetCode: string, body: Object): Observable<Result> {
    const url = `${this.baseUrl}/${type}s`;
    const slug = `[POST] /${type}s`;
    let headers = new Headers(this.headers);
    let options = new RequestOptions({ headers });

    return this.http.post(url, body, options)
                    .map((res: Response) => {
                      console.log(`${slug} Response`, res.json());
                      return this.parseResponse(type, datasetCode, res);
                    })
                    .catch((err: any) => {
                      console.log(`${slug} ERROR!!!`, err);
                      return Observable.throw('Server error');
                    });
  }

  pollEntity(type: string, datasetCode: string, id: string): Observable<Result> {
    const url = `${this.baseUrl}/${type}s/queue-jobs/${id}`;
    const slug = `[GET]  /${type}s/queue-jobs/${id}`;
    let headers = new Headers(this.headers);
    let options = new RequestOptions({ headers });

    return this.http.get(url, options)
                     .map((res: Response) => {
                       console.log(`${slug} Response`, res.json());
                       return this.parseResponse(type, datasetCode, res);
                     })
                     .catch((err: any) => {
                       console.log(`${slug} ERROR!!!`, err);
                       return Observable.throw('Server error');
                     });
  }

  private parseResponse(type: string, datasetCode: string, response: Response, isList?: boolean): Result {
    let responseData = response.json().data;

    if ( isList ) { // lists response format is slightly different
      responseData = responseData[0];
    }

    const result = new Result(
      responseData.id,
      type,
      datasetCode,
      responseData.attributes,
    );

    result.attributes.quantity = result.attributes.countQty || result.attributes.listQty;

    return result;
  }
}
