export class Result {
  constructor(
    public id: string,
    public type: string,
    public attributes: {
      status: string,
      countQty: number,
      listQty: number,
      download: string
    }
 ){}
}
