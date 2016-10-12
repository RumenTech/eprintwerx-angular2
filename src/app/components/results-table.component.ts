import { Component, Input } from '@angular/core';

import { Result } from '../model/result';

@Component({
  selector: 'results-table',
  templateUrl: './results-table.component.html',
})
export class ResultsTable { 
  @Input() items: Array<Result>;
  private baseUrl: string = 'https://test.dataselect.us';

  constructor() {
  }
}
