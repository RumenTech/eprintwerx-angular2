import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

import { EmitterService } from '../services/emitter.service';
import { CriteriaService } from '../services/criteria.service';

@Component({
  selector: 'count-criteria-form',
  templateUrl: './count-criteria-form.component.html',
})
export class CountCriteriaForm implements OnInit {
  @Input() handleSubmit: Function;
  @Output() onSubmitForm = new EventEmitter<Object>();

  private countSamples = [];
  private isValid = false;
  private model = {
    datasetCode: '',
    geoCriteria: '',
    demoCriteria: '',
    criteriaString: '', // only this field is two-way binding
  };

  constructor(private criteriaService: CriteriaService) {
  }

  onSampleTypeChange(type: string) {
    this.model.criteriaString = this.criteriaService.getCountCriteriaByType(type);

    this.onCriteriaChange(this.model.criteriaString);
  }

  onCriteriaChange(text: string) {
    this.isValid = this.criteriaService.isJsonValid(text);

    if (!this.isValid) {
      return;
    }

    const { datasetCode, geoCriteria, demoCriteria } = 
                                this.criteriaService.parseCountCriteria(text);

    this.model.datasetCode = datasetCode;
    this.model.geoCriteria = geoCriteria;
    this.model.demoCriteria = demoCriteria;
  }

  submitForm() {
    if ( !this.criteriaService.isJsonValid(this.model.criteriaString) ) {
      return;
    }

    const parsedJson = JSON.parse(this.model.criteriaString);
    const dataToSend = {
      datasetCode: parsedJson.datasetCode,
      payload: this.padExtraInfo(parsedJson)
    };

    this.onSubmitForm.emit(dataToSend);
  }

  ngOnInit() {
    EmitterService.get('JSON_FILES_LOADED').subscribe(() => {
      this.countSamples = this.criteriaService.getCountSamples();
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
