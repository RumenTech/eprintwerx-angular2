import { Component, EventEmitter, Output, OnInit } from '@angular/core';

import { EmitterService } from '../services/emitter.service';
import { CriteriaService } from '../services/criteria.service';

@Component({
  selector: 'list-criteria-form',
  templateUrl: './list-criteria-form.component.html',
})
export class ListCriteriaForm implements OnInit {
  @Output() onSubmitForm = new EventEmitter<Object>();

  private model = {
    datasetCode: '',
    qtyDesired: '',
    countId: '',
  };
  private listCriteriaString = '';
  private isValid = false;

  constructor(private criteriaService: CriteriaService) {
  }

  onListCriteriaChange() {
    this.isValid = this.criteriaService.isJsonValid( this.listCriteriaString );

    if (!this.isValid) {
      return;
    }

    const {
      datasetCode,
      qtyDesired,
      countId,
    } = this.criteriaService.parseListCriteria( this.listCriteriaString );

    this.model.datasetCode = datasetCode;
    this.model.qtyDesired = qtyDesired;
    this.model.countId = countId;
  }

  submitForm() {
    if ( !this.criteriaService.isJsonValid(this.listCriteriaString) ) {
      return;
    }

    const dataToSend = {
      datasetCode: this.model.datasetCode,
      payload: this.getFullPayload(),
    };

    this.onSubmitForm.emit(dataToSend);
  }

  ngOnInit() {
    EmitterService.get('ON_CHANGE_COUNT').subscribe((data) => {
      const jsonObject = JSON.parse(this.criteriaService.getListCriteriaSample());
      const outputColumns = JSON.parse(this.criteriaService.getOutCriteriaByDatasetCode(data.datasetCode));

      if (jsonObject.listCriterias && jsonObject.listCriterias.length) {
        jsonObject.listCriterias[0].countId = data.countId;
        jsonObject.listCriterias[0].datasetCode = data.datasetCode;
        jsonObject.listCriterias[0].outCriterion = outputColumns;
      }

      this.listCriteriaString = JSON.stringify(jsonObject, null, '\t');
      this.onListCriteriaChange();
    });
  }

  getFullPayload() {
    let listCriteria = JSON.parse(this.listCriteriaString);

    return {
      data: {
        type: 'orders',
        attributes: listCriteria
      }
    };
  }
}
