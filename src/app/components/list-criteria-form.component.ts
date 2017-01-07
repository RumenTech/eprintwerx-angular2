import { Component, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { EmitterService } from '../services/emitter.service';
import { CriteriaService } from '../services/criteria.service';

@Component({
  selector: 'list-criteria-form',
  templateUrl: './list-criteria-form.component.html',
})
export class ListCriteriaForm implements OnInit { 
  @Input() countId: string;
  @Output() onSubmitForm = new EventEmitter<Object>();

  private isValid = false;
  private sample = '';
  private model = {
    datasetCode: '',
    qtyDesired: '',
    countId: '',
    geoCriteria: '',
    demoCriteria: '',
    criteriaString: '', // only this field is two-way binding
  };

  constructor(private criteriaService: CriteriaService) {
  }

  onCriteriaChange(value: string) {
    this.isValid = this.criteriaService.isJsonValid(value);

    if (!this.isValid) {
      return;
    }

    const {
      datasetCode,
      qtyDesired,
      countId,
      geoCriteria,
      demoCriteria
    } = this.criteriaService.parseListCriteria(value);

    this.model.datasetCode = datasetCode;
    this.model.qtyDesired = qtyDesired;
    this.model.countId = countId;
    this.model.geoCriteria = geoCriteria;
    this.model.demoCriteria = demoCriteria;
  }

  submitForm() {
    if ( !this.criteriaService.isJsonValid(this.model.criteriaString) ) {
      return;
    }

    const parsedJson = JSON.parse(this.model.criteriaString);
    const dataToSend = this.padExtraInfo(parsedJson);

    this.onSubmitForm.emit(dataToSend);
  }

  ngOnInit() {
    EmitterService.get('JSON_FILES_LOADED').subscribe(() => {
      this.sample = this.criteriaService.getListCriteria();
    });
  }

  ngOnChanges(changes) {
    const countIds = changes.countId;

    if ( countIds && countIds.previousValue !== countIds.currentValue && countIds.currentValue !== undefined ) {
      const json = JSON.parse(this.sample);
      json.countId = countIds.currentValue;

      this.model.criteriaString = JSON.stringify(json, null, '\t');

      this.onCriteriaChange(this.model.criteriaString);
    }
  }

  padExtraInfo(json: Object) {
    return {
      data: {
        type: 'list',
        attributes: {
          listCriteria: json,
          tags: {
            name: 'MyList#1'
          }
        }
      }
    };
  }

}
