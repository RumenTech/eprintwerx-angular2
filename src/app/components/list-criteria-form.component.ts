import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

import { EmitterService } from '../services/emitter.service';
import { CriteriaService } from '../services/criteria.service';

@Component({
  selector: 'list-criteria-form',
  templateUrl: './list-criteria-form.component.html',
})
export class ListCriteriaForm implements OnInit { 
  @Output() onSubmitForm = new EventEmitter<Object>();

  private sample = '';
  private model = {
    datasetCode: '',
    qtyDesired: '',
    countId: '',
    geoCriteria: '',
    demoCriteria: '',
  };
  private jsonEditor = {
    listCriteria: '', // only this field is two-way binding
    billingData: '',
    outCriteria: '',
    tags: '',
  };
  private samples = {
    listCriteria: '',
    billingData: '',
    tags: '',
  };
  private isValid = {
    listCriteria: false,
    billingData: false,
    outCriteria: false,
    tags: false,
  };

  constructor(private criteriaService: CriteriaService) {
  }

  onJsonDataChange(type: string) {
    this.isValid[ type ] = this.criteriaService.isJsonValid( this.jsonEditor[ type ]);

    if (!this.isValid[ type ] || type !== 'listCriteria') {
      return;
    }

    const {
      datasetCode,
      qtyDesired,
      countId,
      geoCriteria,
      demoCriteria
    } = this.criteriaService.parseListCriteria( this.jsonEditor.listCriteria );

    this.model.datasetCode = datasetCode;
    this.model.qtyDesired = qtyDesired;
    this.model.countId = countId;
    this.model.geoCriteria = geoCriteria;
    this.model.demoCriteria = demoCriteria;
  }

  submitForm() {
    if ( ! (
      this.criteriaService.isJsonValid(this.jsonEditor.listCriteria) &&
      this.criteriaService.isJsonValid(this.jsonEditor.billingData) &&
      this.criteriaService.isJsonValid(this.jsonEditor.outCriteria) &&
      this.criteriaService.isJsonValid(this.jsonEditor.tags)
    ) ) {
      return;
    }

    const dataToSend = {
      datasetCode: this.model.datasetCode,
      payload: this.getFullPayload(),
    };

    this.onSubmitForm.emit(dataToSend);
  }

  ngOnInit() {
    EmitterService.get('JSON_FILES_LOADED').subscribe(() => {
      this.samples = this.criteriaService.getMiscSamples();
    });

    EmitterService.get('ON_CHANGE_COUNT').subscribe((data) => {
      const listCriteria = JSON.parse(this.samples.listCriteria);
      listCriteria.countId = data.countId;
      listCriteria.datasetCode = data.datasetCode;

      this.jsonEditor.billingData = this.samples.billingData;
      this.jsonEditor.tags = this.samples.tags;
      this.jsonEditor.outCriteria = this.criteriaService.getOutCriteriaByDatasetCode(data.datasetCode);
      this.jsonEditor.listCriteria = JSON.stringify(listCriteria, null, '\t');

      this.onJsonDataChange('listCriteria');
      this.onJsonDataChange('outCriteria');
      this.onJsonDataChange('billingData');
      this.onJsonDataChange('tags');
    });
  }

  getFullPayload() {
    let listCriteria = JSON.parse(this.jsonEditor.listCriteria);
    listCriteria.outCriterion = JSON.parse(this.jsonEditor.outCriteria);

    return {
      data: {
        type: 'orders',
        attributes: {
          source: 'API',
          listCriterias: [ listCriteria ],
          tags: JSON.parse(this.jsonEditor.tags),
          billingData: JSON.parse(this.jsonEditor.billingData),
        }
      }
    };
  }

  isAllValid() {
    const { listCriteria, billingData, outCriteria, tags } = this.isValid;
    return listCriteria && billingData && outCriteria && tags;
  }

  isAllSet() {
    const { listCriteria, billingData, outCriteria, tags } = this.jsonEditor;
    return listCriteria && billingData && outCriteria && tags;
  }
}
