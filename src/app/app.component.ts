import { Component } from '@angular/core';
import { Observable, Subject } from 'rxjs/Rx';

import { HarnessApiService } from './services/harness-api.service';
import { Result } from './model/result';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  private currentCountId: string;
  private results: Array<Result> = [];
  private pollers: { [id: string]: Observable<Result> } = {};
  private stoppers: { [id: string]: Subject<{}> } = {};

  constructor(private apiService: HarnessApiService) { }

  onSubmitCountCriteriaForm(payload: Object) {
    let operation:Observable<Result> = this.apiService.createEntity('count', payload);
    operation.subscribe(
      result => {
        this.results.push(result);
        this.startPolling(result);

        this.currentCountId = result.id;
      }
    );
  }

  onSubmitListCriteriaForm(payload: Object) {
    let operation:Observable<Result> = this.apiService.createEntity('list', payload);
    operation.subscribe(
      result => {
        this.results.push(result);
        this.startPolling(result);
      }
    );
  }

  startPolling(result: Result) {
    if ( result.attributes.status !== 'PENDING' ) {
      return;
    }

    this.stoppers[result.id] = new Subject();
    this.pollers[result.id] = Observable
      .interval(1000)
      .flatMap( () => this.apiService.pollEntity(result.type, result.id) )
      .takeUntil(this.stoppers[result.id]);

    this.pollers[result.id].subscribe(
      result => {
        if (result.attributes.status !== 'PENDING') {
          const index = this.results.findIndex( (e) => e.id === result.id );

          // update array without mutation
          this.results = this.results
            .slice(0, index)
            .concat(result)
            .concat(this.results.slice(index + 1));
          // emit to stop polling
          this.stoppers[result.id].next(true);
        }
      },
      err => {
        this.stoppers[result.id].next(true);
      }
    );
  }
}
