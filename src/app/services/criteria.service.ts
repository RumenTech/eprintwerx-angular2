import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { EmitterService } from './emitter.service';

@Injectable()
export class CriteriaService {

  private basePath = './assets/mock-data/';
  private listSampleFile = 'ListCriteria.json';
  private listSampleCriteria = '';
  private countSampleCriteria = { };
  private countSamples = [
    { type: 'CV_SIMPLE',   display: 'Consumer View - Simple',        file: 'CountCriteria_CV_simple.json' },
    { type: 'CV_MEDIUM',   display: 'Consumer View - Medium',        file: 'CountCriteria_CV_Medium.json' },
    { type: 'CV_COMPLEX',  display: 'Consumer View - Advanced',      file: 'CountCriteria_CV_AllPossible.json' },
    { type: 'NM_SIMPLE',   display: 'New Movers - Simple',           file: 'CountCriteria_NM_Simple.json' },
    { type: 'NM_MEDIUM',   display: 'New Movers - Medium',           file: 'CountCriteria_NM_Medium.json' },
    { type: 'NM_COMPLEX',  display: 'New Movers - Advanced',         file: 'CountCriteria_NM_Complex.json' },
    { type: 'NPL_SIMPLE',  display: 'Newborn Network - Simple',      file: 'CountCriteria_NPL_Simple.json' },
    { type: 'NPL_MEDIUM',  display: 'Newborn Network - Medium',      file: 'CountCriteria_NPL_Medium.json' },
    { type: 'NPL_COMPLEX', display: 'Newborn Network - Advanced',    file: 'CountCriteria_NPL_Complex.json' },
    { type: 'NHO_SIMPLE',  display: 'New Homeowners - Simple',       file: 'CountCriteria_NHO_Simple.json' },
    { type: 'NHO_MEDIUM',  display: 'Newborn Homeowners - Medium',   file: 'CountCriteria_NHO_Medium.json' },
    { type: 'NHO_COMPLEX', display: 'Newborn Homeowners - Advanced', file: 'CountCriteria_NHO_Complex.json' },
    { type: 'BIS_SIMPLE',  display: 'US Business - Simple',          file: 'CountCriteria_BIS_Simple.json' },
    { type: 'BIS_MEDIUM',  display: 'US Business - Medium',          file: 'CountCriteria_BIS_Medium.json' },
    { type: 'BIS_COMPLEX', display: 'US Business - Advanced',        file: 'CountCriteria_BIS_Complex.json' },
  ];

  constructor (private http: Http) {
    Observable.zip(
      this.readCountSamples(),
      this.readListSample(),
    ).subscribe(() => {
      EmitterService.get('JSON_FILES_LOADED').emit();
    });
  }

  // Read json files for sample count criteria
  readCountSamples() {
    let batch = [];
    this.countSamples.map( sample => {
      batch.push(
        this.http.get( this.basePath + sample.file ).map( res => {
          if ( this.isJsonValid( res.text() ) ) {
            this.countSampleCriteria[ sample.type ] = res.text();
          }
        })
      )
    });

    return Observable.forkJoin(batch);
  }

  // Read the json file for sample list criteria
  readListSample() {
    return this.http.get( this.basePath + this.listSampleFile ).map( res => {
      if ( this.isJsonValid( res.text() ) ) {
        this.listSampleCriteria = res.text();
      }
    });
  }

  getCountSamples() {
    return this.countSamples;
  }

  getCountCriteriaByType(type: string): string {
    return this.countSampleCriteria[ type ] || '';
  }

  getListCriteria(): string {
    return this.listSampleCriteria;
  }

  parseGeoCriteria(json): string {
    let list = [];
    if ( json.geoCriteria && Array.isArray(json.geoCriteria.children) ) {
      list = json.geoCriteria.children.map( (item) => item.criterionCode );
    }
    return list.join(', ');
  }

  parseDemoCriteria(json): string {
    let list = [];
    if ( json.demoCriteria && Array.isArray(json.demoCriteria.children) ) {
      list = json.demoCriteria.children.map( (item) => item.criterionCode );
    }
    return list.join(', ');
  }

  parseCountCriteria(str: string) {
    const parsedJson = JSON.parse(str) || {};

    return {
      datasetCode: parsedJson.datasetCode || '',
      geoCriteria: this.parseGeoCriteria(parsedJson),
      demoCriteria: this.parseDemoCriteria(parsedJson),
    };
  }

  parseListCriteria(str: string) {
    const parsedJson = JSON.parse(str) || {};

    return {
      datasetCode: parsedJson.datasetCode || '',
      qtyDesired: parsedJson.qtyDesired || '',
      countId: parsedJson.countId || '',
      geoCriteria: this.parseGeoCriteria(parsedJson),
      demoCriteria: this.parseDemoCriteria(parsedJson),
    };
  }

  isJsonValid(str: string): boolean {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }
}