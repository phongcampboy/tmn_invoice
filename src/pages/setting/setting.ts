import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, Events } from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { Storage } from '@ionic/storage';
import { MutableBuffer } from 'mutable-buffer';

@IonicPage()
@Component({ selector: 'page-setting', templateUrl: 'setting.html' })
export class SettingPage {
  deviceList: any;
  device: any;
  bluetoothEnable: any;
  defaultBranch: any = "0";
  defaultSearch: any = "MemberID";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public bts: BluetoothSerial,
    public storage: Storage,
    public toastCtrl: ToastController,
    public events: Events
  ) { }

  async ionViewDidLoad() {
    await this.checkBluetooth();
    if (this.bluetoothEnable) {
      this.device = await this.getPrinter();
      this.deviceList = await this.listPrinter();
    }

    this.getBranchSetting();
    this.getSearchSetting();


  }

  getBranchSetting() {
    this.storage.get('settingBranch').then((data) => {
      if (data) {
        this.defaultBranch = data;

      }
    });
  }

  getSearchSetting() {
    this.storage.get('settingSearch').then((data) => {
      if (data) {
        this.defaultSearch = data;
        this.events.publish('settingSearch', data);
      }
    });
  }

  async getPrinter() {
    return await this.storage.get('printer');
  }

  async listPrinter() {
    return await this.bts.list();
  }

  setPrinter() {

    if (!this.device) {
      return false;
    }
    this.storage.set('printer', this.device).then(() => {

      let devices = this.findObject(this.deviceList, this.device, 'address');
      this.ToastMessage('ตั้งค่าเครื่องพิมพ์คือ ' + devices.name + ' : ' + devices.address);

    });


  }

  async checkBluetooth() {

    try {
      let enable = await this.bts.isEnabled();
      if (enable) {
        this.bluetoothEnable = true;
      }

    } catch (error) {
      this.bluetoothEnable = false;
      this.ToastMessage('กรุณาเปิด Bluetooth');
    }
  }

  findObject(arr, value, key) {
    if (arr instanceof Array && key) {
      return arr.find(x => x[key] == value);
    }

  }


  ToastMessage(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 5000,
      position: 'bottom'
    });

    toast.present();
  }

  qrcode(url) {
    var buff = "";
    buff += "\x1b\x40";
    buff += "\x1d\x28\x6b\x03\x00\x31\x43\x03";
    buff += "\x1d\x28\x6b\x03\x00\x31\x45\x30";
    buff += "\x1d\x28\x6b\x06\x00\x31\x50\x30 " + url;
    buff += "\x1b\x61\x01";
    buff += "\x1d\x28\x6b\x03\x00\x31\x52\x30";
    buff += "\x1d\x28\x6b\x03\x00\x31\x51\x30";
    return buff;
  }

  ConvertHex(text, sp = " ") {
    if (!text) return;
    var txt = text;
    var del = sp;
    var len = txt.length;
    var hex = '';
    for (var i = 0; i < len; i++) {
      var a = txt.charCodeAt(i);
      var h = a.toString(16);
      if (h.length == 1) h = '0' + h;
      hex += h;
      if (i < len - 1) hex += del;
    }
    return hex;
  }

  printDataTest() {

    var CLS = '\x1b\x40';
    let writeData = CLS;

    writeData += "บริษัท ทิพย์มณี มีเดีย เน็ตเวิร์ค จำกัด (โรงโป๊ะ)\n";
    writeData += "263/92 ม.12 ต.หนองปรือ อ.บางละมุง จ.ชลบุรี 20150    \n";
    writeData += "สถานที่ติดต่อประสานงาน 51/2 ม.13 ต.หนองปริอ อ.บางละมุง\n";
    writeData += "จ.ชลบุรี 20150 (ตรงข้ามสวนสุขภาพเทศบาลหนองปรือ)      \n";
    writeData += "โทร.038-249734, 038-072556-7  โทรสาร.038-072563 \n";
    writeData += "\n\n\n\n";


    let buff = new MutableBuffer(64 * 1024, 64 * 1024);
    buff.clear();
    buff.write(writeData, 'utf8');

    return buff.buffer;
  }

  print() {
    ///this.printDataTest()
    let connect = this.bts.connect(this.device).subscribe(data => {
      this.bts.clear().then(() => {
        this.bts.write(this.printDataTest()).then(dataz => {
          this.ToastMessage("การพิมพ์สำเร็จ");

          connect.unsubscribe();
        }, errx => {
          this.ToastMessage(errx);
        });
      });

    }, err => {

      this.ToastMessage("ไม่มีการเชื่อมต่ออุปกรณ์ Bluetooth");

    });
  }


  async openBluetooth() {
    try {
      let enable = await this.bts.enable();
      if (enable) {
        this.bluetoothEnable = true;
        this.device = await this.getPrinter();
        this.deviceList = await this.listPrinter();

        this.ToastMessage('เปิด Bluetooth ');
      }


    } catch (error) {
      this.bluetoothEnable = false;
      this.ToastMessage('ไม่สามารถเปิด Bluetooth ได้');
    }

  }

  settingSearch(data, message) {
    this.storage.set('settingSearch', data).then(() => {
      this.ToastMessage('เลือก ' + message + ' เป็นค่าเริ่มต้น');
      this.events.publish('settingSearch', data);
    });
  }

  settingBranch(data, message) {
    this.storage.set('settingBranch', data).then(() => {
      this.ToastMessage('เลือก ' + message + ' เป็นค่าเริ่มต้น');
      this.events.publish('settingBranch', data);
    });
  }


}
