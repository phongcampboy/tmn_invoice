import { Http } from '@angular/http';
import { Injectable } from '@angular/core';

import { LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';


@Injectable()
export class ApiProvider {
  baseURL = "http://tmnserver1.dyndns.tv";
  token = "FJBAGItGT7f2pSz3VBKnsYePCMAv68VNN7M5uG";

  loading: any;


  constructor(
    public http: Http,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
  ) {
    
  }

  loader: any = {
    show: (message) => {
      if (!this.loading) {
        this.loading = this.loadingCtrl.create({
          content: message
        })
        this.loading.present();
      }
    },
    hide: () => {
      if (this.loading) {
        this.loading.dismiss();
        this.loading = null;
      }
    }
  };

  Router(path) {
    return this.baseURL + path;
  }

  routeLogin = this.Router('/login');
  routeBarcode = this.Router('/barcode');
  routeSearch = this.Router('/search/') + this.token;
  routePromotions = this.Router('/receipt/promotions/') + this.token;
  routeReceiptNumber = this.Router('/receipt/numbers/') + this.token;
  routeKeeper = this.Router('/keeper');

  routeStatus = this.Router('/ststus');
  //routeStatus = "http://apiapp.tmncabletv.local/ststus";

  async Get(message, url): Promise<any> {
    this.loader.show(message)
    try {
      //const url = this.url + this.token;
      const response = await this.http.get(url).toPromise();
      const returnData = response.json();
      this.loader.hide();
      return returnData;

    } catch (error) {
      this.loader.hide();
      this.errorAlert("Connect error!");
      console.log('there was an error');
      console.log(error);
    }
  }


  async Post(message, url, formObject): Promise<any> {
    message && this.loader.show(message)
    try {
      //const url = this.url + this.token;
      const response = await this.http.post(url, formObject).toPromise();
      const returnData = response.json();
      this.loader.hide();
      return returnData;

    } catch (error) {
      this.loader.hide();
      this.errorAlert("Connect error!");
      console.log('there was an error');
      console.log(error);
    }

  }

  findObject(arr, value, key = null) {
    if (arr instanceof Array && key) {
      return arr.find(x => x[key] == value);
    }

    if (arr instanceof Array && !key) {
      return arr.find(x => x.id == value);
    }
  }

  errorAlert(message) {
    let alert = this.alertCtrl.create({
      title: "Error!",
      message: message,
      buttons: ['OK']
    });
    alert.present();
  }

  successAlert(message) {
    let alert = this.alertCtrl.create({
      title: "Success!",
      message: message,
      buttons: ['OK']
    });
    alert.present();
  }

  Alert(message) {
    let alert = this.alertCtrl.create({
      title: "Alert!",
      message: message,
      buttons: ['OK']
    });
    alert.present();
  }

  confirmAlert(message, cb) {
    let alert = this.alertCtrl.create({
      title: "Success!",
      message: message,
      enableBackdropDismiss: false,
      buttons: [{
        text: 'OK',
        handler: () => {
          cb();
        }
      }]
    });
    alert.present();
  }

  FormatNumber = (x) => {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".") + " บาท";
  }

  ThaiNumberToText(Number) {
    Number = Number.replace(/๐/gi, '0');
    Number = Number.replace(/๑/gi, '1');
    Number = Number.replace(/๒/gi, '2');
    Number = Number.replace(/๓/gi, '3');
    Number = Number.replace(/๔/gi, '4');
    Number = Number.replace(/๕/gi, '5');
    Number = Number.replace(/๖/gi, '6');
    Number = Number.replace(/๗/gi, '7');
    Number = Number.replace(/๘/gi, '8');
    Number = Number.replace(/๙/gi, '9');
    return this.ArabicNumberToText(Number);
  }

  ArabicNumberToText(Number) {
    var Number = this.CheckNumber(Number);
    var NumberArray = new Array("ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า", "สิบ");
    var DigitArray = new Array("", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน");
    var BahtText = "";
    if (isNaN(Number)) {
      return "ข้อมูลนำเข้าไม่ถูกต้อง";
    } else {
      if ((Number - 0) > 9999999.9999) {
        return "ข้อมูลนำเข้าเกินขอบเขตที่ตั้งไว้";
      } else {
        Number = Number.split(".");
        if (Number[1].length > 0) {
          Number[1] = Number[1].substring(0, 2);
        }
        var NumberLen = Number[0].length - 0;
        for (var i = 0; i < NumberLen; i++) {
          var tmp = Number[0].substring(i, i + 1) - 0;
          if (tmp != 0) {
            if ((i == (NumberLen - 1)) && (tmp == 1)) {
              BahtText += "เอ็ด";
            } else
              if ((i == (NumberLen - 2)) && (tmp == 2)) {
                BahtText += "ยี่";
              } else
                if ((i == (NumberLen - 2)) && (tmp == 1)) {
                  BahtText += "";
                } else {
                  BahtText += NumberArray[tmp];
                }
            BahtText += DigitArray[NumberLen - i - 1];
          }
        }
        BahtText += "บาท";
        if ((Number[1] == "0") || (Number[1] == "00")) {
          BahtText += "ถ้วน";
        } else {
          var DecimalLen = Number[1].length - 0;
          for (var ii = 0; ii < DecimalLen; ii++) {
            var tmp1 = Number[1].substring(ii, ii + 1) - 0;
            if (tmp1 != 0) {
              if ((ii == (DecimalLen - 1)) && (tmp1 == 1)) {
                BahtText += "เอ็ด";
              } else
                if ((ii == (DecimalLen - 2)) && (tmp1 == 2)) {
                  BahtText += "ยี่";
                } else
                  if ((ii == (DecimalLen - 2)) && (tmp1 == 1)) {
                    BahtText += "";
                  } else {
                    BahtText += NumberArray[tmp];
                  }
              BahtText += DigitArray[DecimalLen - ii - 1];
            }
          }
          BahtText += "สตางค์";
        }
        return BahtText;
      }
    }
  }

  CheckNumber(Number) {
    var decimal = false;
    Number = Number.toString();
    Number = Number.replace(/ |,|บาท|฿/gi, '');
    for (var i = 0; i < Number.length; i++) {
      if (Number[i] == '.') {
        decimal = true;
      }
    }
    if (decimal == false) {
      Number = Number + '.00';
    }
    return Number
  }

  reversedDate($date){
      let $expl = $date.split('-');
      return $expl[2]+"-"+$expl[1]+"-"+$expl[0];
  }

  getReceipt(){
    return '';
  }

  async activeApi(){
    return await this.Post(null, 'http://tmnapi.wawdog.com', null);
  }

}
