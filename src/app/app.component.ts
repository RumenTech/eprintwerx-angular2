import { Component } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { HarnessApiService } from './services/harness-api.service';
import { EmitterService } from './services/emitter.service';
import { Result } from './model/result';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  private results: Array<Result> = [];
  private TIME_LIMIT = 15;

  constructor(private apiService:
    HarnessApiService) { }

  /**
    * 1. {POST} /counts
    * 2. {GET}  /counts/queue-jobs/{countId}
    * 3. {GET}  /counts/{countId}
  **/
  onSubmitCountCriteriaForm(data: any) {
    let cachedResult;

    this.apiService.createEntity('count', data.datasetCode, data.payload)
      .mergeMap(result => {
        cachedResult = result;
        this.results.push(result);
        return this.startPolling(result);
      })
      .mergeMap( (result: any) =>
        this.apiService.getEntity(result.type, result.datasetCode, result.id)
      )
      .subscribe(result => {
        result.attributes.status = 'OK';
        this.updateResults(result);

        EmitterService.get('ON_CHANGE_COUNT').emit({
          countId: result.id,
          datasetCode: result.datasetCode,
        });
      }, err => {
        cachedResult.attributes.status = 'FAILED!';
        if (err === 'TIMED_OUT') {
          cachedResult.attributes.status = 'TIMED OUT!';
        }
        this.updateResults(cachedResult);
      });
  }

  /**
    * 1. {POST} /orders
    * 2. {GET}  /orders/queue-jobs/{orderId}
    * 3. {GET}  /orders/{countId}
    * 4. {GET}  /orders/{countId}/lists
  **/
  onSubmitListCriteriaForm(data: any) {
    let cachedResult;
    this.apiService.createEntity('order', data.datasetCode, data.payload)
      .mergeMap(result => {
        cachedResult = result;
        this.results.push(result);
        return this.startPolling(result);
      })
      .mergeMap( (result: any) =>
        this.apiService.getEntity(result.type, result.datasetCode, result.id)
      )
      .mergeMap( (result: any) =>
        this.apiService.getEntity(result.type, result.datasetCode, result.id, true)
      )
      .subscribe(
        result => {
          result.attributes.status = 'OK';
          result.id = cachedResult.id;
          this.updateResults(result);
        },
        err => {
          cachedResult.attributes.status = 'FAILED!';
          if (err === 'TIMED_OUT') {
            cachedResult.attributes.status = 'TIMED OUT!';
          }
          this.updateResults(cachedResult);
        }
      );
  }

  onSelectCountResult(row: Result) {
    EmitterService.get('ON_CHANGE_COUNT').emit({
      countId: row.id,
      datasetCode: row.datasetCode,
    });
  }

  startPolling(result: Result) {
    return Observable.create(observer => {
      if ( result.attributes.status !== 'PENDING' ) {
        observer.copmlete(result);
      }

      let timer = Observable.timer(0, 1000);

      let pollingSubscription = this.apiService.pollEntity(result.type, result.datasetCode, result.id)
        .expand(result1 => {
          return this.apiService.pollEntity(result1.type, result1.datasetCode, result1.id);
        })
        .subscribe(
          result2 => {
            if ( result2.attributes.status === 'OK' ) {
              pollingSubscription.unsubscribe();
              observer.next(result2);
              observer.complete();
            }
          },
          err => {
            pollingSubscription.unsubscribe();
            observer.error(err);
          }
        );

      let timerSubscription = timer.subscribe(t => {
        if (t >= this.TIME_LIMIT) {
          pollingSubscription.unsubscribe();
          timerSubscription.unsubscribe();
          observer.error('TIMED_OUT');
        }
      });
    });
  }

  updateResults(result: Result) {
    const index = this.results.findIndex( (e) => e.id === result.id );

    // update array without mutation
    this.results = this.results
      .slice(0, index)
      .concat(result)
      .concat(this.results.slice(index + 1));
  }
}
