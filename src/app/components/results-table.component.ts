import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Result } from '../model/result';

@Component({
  selector: 'results-table',
  templateUrl: './results-table.component.html',
})
export class ResultsTable { 
  @Input() rows: Array<Result>;
  @Output() onSelectRow = new EventEmitter<Object>();

  private baseUrl: string = 'https://test.dataselect.us/public-staging/v1';

  constructor() {
  }

  onSelectCountResult(row: Result) {
    this.onSelectRow.emit(row);
  }
}
