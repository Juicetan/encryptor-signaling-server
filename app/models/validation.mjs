import ObjUtil from "../utils/obj.mjs";

class Validation{
  static type = {
    MALFORMED: 1000,
    INVALIDARG: 1001,
    MISSINGARG: 1002,
    NOTFOUND: 1003,
    CONNECTIONERROR: 1004,
    UNAUTHENTICATED: 1005,
    RETRIEVALERROR: 1006,
    NOTSUPPORTED: 1007,
    UNEXPECTED: 1008,
  }
  
  static ErrorObj = class ErrorObj{
    constructor(header, message, detailsObj){
      this.errID = ObjUtil.guid(2);
      this.header = header || '';
      this.message = message || '';
      this.labels = [];
      this.code = Validation.type.UNEXPECTED;

      if(detailsObj){
        this.context = detailsObj.context;
        this.code = detailsObj.code || Validation.type.UNEXPECTED;
        this.serverCode = detailsObj.serverCode;
        if(detailsObj.errID){
          this.errID = detailsObj.errID
        }
        if(detailsObj.labels){
          this.labels = detailsObj.labels;
        }
      }
    }
  }

  static createError(header, message, detailsObj){
    return new Validation.ErrorObj(header, message, detailsObj);
  }

  constructor(){
    this.errors = [];
  }
  
  get state(){
    return this.errors.length <= 0;
  }
  
  get error(){
    return this.errors?.[0];
  }

  addError(header, message, detailsObj){
    const err = Validation.createError(header, message, detailsObj);
    this.add(err);

    return this;
  }

  add(errorObj){
    if(errorObj instanceof Validation.ErrorObj){
      if(!this.errors.includes(errorObj)){
        this.errors.push(errorObj);
      }
    } else{
      throw new Error('Invalid error object type: must be Validation.ErrorObj');
    }
  }

  firstError(){
    if(this.errors.length > 0){
      return this.errors[0];
    }
    return null;
  }

  findError(errID){
    return this.errors.find((e) => {
      return e.errID === errID
    });
  }

  findErrorsByLabel(label){
    return this.errors.filter((e) => {
      return e.labels.includes(label);
    })
  }

  removeError(error){
    ObjUtil.removeObject(this.errors, error);
  }

  removeErrorByID(errID){
    let existingErr = this.findError(errID);
    if(existingErr){
      this.removeError(existingErr);
    }
  }

  removeErrorsByLabel(label){
    this.errors = this.errors.filter((e) => {
      return !e.labels.includes(label);
    })
  }

  toJSON(){
    let retObj = {
      state: this.state,
      ...this,
    }

    return retObj;
  }
}

export default Validation;