import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { EmitterService } from './emitter.service';

@Injectable()
export class CriteriaService {

  private listSample = '';
  private countSample = {
    simple : '',
    geo    : '',
    all    : '',
  };

  constructor (private http: Http) {
    Observable.zip(
      this.http.get('./assets/mock-data/CountCriteria_CV_simple.json'),
      this.http.get('./assets/mock-data/CountCriteria_CV_AllGeo.json'),
      this.http.get('./assets/mock-data/CountCriteria_CV_AllPossible.json'),
      this.http.get('./assets/mock-data/ListCriteria.json'),
      (simpleRes, geoRes, allRes, listRes) => {
        return {
          simple  : simpleRes.text(),
          geo     : geoRes.text(),
          all     : allRes.text(),
          list    : listRes.text(),
        };
      }
    ).subscribe((data) => {
      // const { simple, geo, all } = data;

      if ( this.isJsonValid(data.simple) ) {
        this.countSample.simple = data.simple;
      }
      if ( this.isJsonValid(data.geo) ) {
        this.countSample.geo = data.geo;
      }
      if ( this.isJsonValid(data.all) ) {
        this.countSample.all = data.all;
      }

      if ( this.isJsonValid(data.list) ) {
        this.listSample = data.list;
      }

      // this.countSample = { simple, geo, all };
      // this.listSample = data.list;

      EmitterService.get('JSON_FILES_LOADED').emit();
    });
  }

  getCountSampleTypes() {
    return [
      { value: 'simple', text: 'Simple'  },
      { value: 'geo',    text: 'All Geo' },
      { value: 'all',    text: 'All'     },
    ];
  }

  getCountSampleByType(type) {
    return this.countSample[type] || '';
  }

  getListSample() {
    return this.listSample;
  }

  parseGeoCriteria(json) {
    let list = [];
    if ( json.geoCriteria && Array.isArray(json.geoCriteria.children) ) {
      list = json.geoCriteria.children.map( (item) => item.criterionCode );
    }
    return list.join(', ');
  }

  parseDemoCriteria(json) {
    let list = [];
    if ( json.demoCriteria && Array.isArray(json.demoCriteria.children) ) {
      list = json.demoCriteria.children.map( (item) => item.criterionCode );
    }
    return list.join(', ');
  }

  parseCountCriteria(str) {
    const parsedJson = JSON.parse(str) || {};

    return {
      datasetCode: parsedJson.datasetCode || '',
      geoCriteria: this.parseGeoCriteria(parsedJson),
      demoCriteria: this.parseDemoCriteria(parsedJson),
    };
  }

  parseListCriteria(str) {
    const parsedJson = JSON.parse(str) || {};

    return {
      datasetCode: parsedJson.datasetCode || '',
      qtyDesired: parsedJson.qtyDesired || '',
      countId: parsedJson.countId || '',
      geoCriteria: this.parseGeoCriteria(parsedJson),
      demoCriteria: this.parseDemoCriteria(parsedJson),
    };
  }

  isJsonValid(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }
}