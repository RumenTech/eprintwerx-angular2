import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { EmitterService } from '../services/emitter.service';
import { CriteriaService } from '../services/criteria.service';

@Component({
  selector: 'count-criteria-form',
  templateUrl: './count-criteria-form.component.html',
})
export class CountCriteriaForm implements OnInit { 
  @Input() handleSubmit: Function;

  private sampleTypes = [];
  private isValid = false;
  private model = {
    datasetCode: '',
    geoCriteria: '',
    demoCriteria: '',
    criteriaString: '', // only this field is two-way binding
  };

  constructor(private criteriaService: CriteriaService) {
  }

  onSampleTypeChange(value: string) {
    this.model.criteriaString = this.criteriaService.getCountSampleByType(value);

    this.onCriteriaChange(this.model.criteriaString);
  }

  onCriteriaChange(value: string) {
    this.isValid = this.criteriaService.isJsonValid(value);

    if (!this.isValid) {
      return;
    }

    const { datasetCode, geoCriteria, demoCriteria } = 
                                this.criteriaService.parseCountCriteria(value);

    this.model.datasetCode = datasetCode;
    this.model.geoCriteria = geoCriteria;
    this.model.demoCriteria = demoCriteria;
  }

  onSubmitForm() {
    if ( !this.criteriaService.isJsonValid(this.model.criteriaString) ) {
      return;
    }

    const parsedJson = JSON.parse(this.model.criteriaString);
    const dataToSend = this.padExtraInfo(parsedJson);

    this.handleSubmit(dataToSend);
  }

  ngOnInit() {
    EmitterService.get('JSON_FILES_LOADED').subscribe(() => {
      this.sampleTypes = this.criteriaService.getCountSampleTypes();  
    });
  }

  padExtraInfo(json: Object) {
    return {
      data: {
        type: 'counts',
        attributes: {
          criteria: json
        }
      }
    };
  }

}
