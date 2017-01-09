import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

import { EmitterService } from '../services/emitter.service';
import { CriteriaService } from '../services/criteria.service';

@Component({
  selector: 'list-criteria-form',
  templateUrl: './list-criteria-form.component.html',
})
export class ListCriteriaForm implements OnInit { 
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
    const dataToSend = {
      datasetCode: parsedJson.datasetCode,
      payload: this.padExtraInfo(parsedJson),
    };

    this.onSubmitForm.emit(dataToSend);
  }

  ngOnInit() {
    EmitterService.get('JSON_FILES_LOADED').subscribe(() => {
      this.sample = this.criteriaService.getListCriteria();
    });

    EmitterService.get('ON_CHANGE_COUNT').subscribe((data) => {
      const json = JSON.parse(this.sample);
      json.countId = data.countId;
      json.datasetCode = data.datasetCode;

      this.model.criteriaString = JSON.stringify(json, null, '\t');

      this.onCriteriaChange(this.model.criteriaString);
    });
  }

  padExtraInfo(json: Object) {
    return {
      data: {
        type: 'orders',
        attributes: {
          source: 'API',
          listCriterias: [ json ],
          tags: {
            name: 'AugOrder1'
          },
          billingData: {
            salesPerson: 'PS1',
            firstName: 'John',
            lastName: 'Doe',
            company: 'Apple',
            address1: '1 Infinite Loop',
            address2: 'Suite 100',
            city: 'San Francisco',
            country: 'USA',
            state: 'CA',
            zip: '90210',
            phone: '555-555-5555',
            fax: '555-555-5566',
            email: 'john.doe@apple.com',
            poNumber: 'Apple123',
            description: 'Standard Optional Description',
            endUser: 'John',
            mailerName: 'Mailer1',
            mailerDate: '2016-04-29T10:25:13Z',
            invoiceGroup: 'INV001',
            coupon: 'MyOffer1',
            billingNotes: 'Some Billing Note',
            otherEmails: 'john.doe@apple.com;jane.doe@apple.com',
            otherEmailSubject: 'Your Order Number {ORDERNO} is now ready for download',
            priceSchema: 'PS1'
          }
        }
      }
    };
  }

}
