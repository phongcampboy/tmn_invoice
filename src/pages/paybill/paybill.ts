import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ToastController } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { BluetoothLE } from '@ionic-native/bluetooth-le';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { Storage } from '@ionic/storage';
import { MutableBuffer } from 'mutable-buffer';
import { AlertController } from 'ionic-angular';
import { Network } from '@ionic-native/network';


@IonicPage()
@Component({
  selector: 'page-paybill',
  templateUrl: 'paybill.html',
})
export class PaybillPage {
  item: any;
  pay: any;
  deviceList: any;
  device: any;
  user: any;
  testByte: any;
  // promotions: any;
  data_type: any
  Keeper: any;
  KeeperList: any;
  imageUrl: any = 'http://chawtaichonburi.com/logo.png';


  CLS = '\x1b\x40';
  BARCODE_MODE_CODE128 = '\x1d\x68\x08';//Barcode mode
  BARCODE_MODE_CODE39 = '\x1d\x6b\x04';//Barcode mode
  BARCODE_MODE_CODE93 = '\x1d\x6b\x72\x1d\x48\x32';//Barcode mode
  BARCODE_TXT_BLW = '\x1d\x48\x32';

  QRCODE_28 = '\x1c\x7d\x25\x1c';

  TXT_ALIGN_LT = '\x1b\x61\x00'; // Left justification
  TXT_ALIGN_CT = '\x1b\x61\x01'; // Centering
  TXT_ALIGN_RT = '\x1b\x61\x02'; // Right justification

  TXT_NORMAL = '\x1b\x21\x00';
  TXT_SMALL = '\x1b\x21\x01';
  TXT_HEADER = '\x1b\x21\x00\x1b\x21\x08';
  TXT_BOLD_OFF = '\x1b\x45\x00'; // Bold font OFF
  TXT_BOLD_ON = '\x1b\x45\x01'; // Bold font ON
  TXT_2WIDTH = '\x1b\x21\x20'; // Double width text


  S_RASTER_N = '\x1d\x76\x30\x00'; // Set raster image normal size
  S_RASTER_2W = '\x1d\x76\x30\x01'; // Set raster image double width
  S_RASTER_2H = '\x1d\x76\x30\x02'; // Set raster image double height
  S_RASTER_Q = '\x1d\x76\x30\x03'; // Set raster image quadruple

  TEXT_FORMAT = {
    //TXT_NORMAL: '\x1b\x21\x00', // Normal text
    TXT_2HEIGHT: '\x1b\x21\x10', // Double height text
    TXT_2WIDTH: '\x1b\x21\x20', // Double width text
    TXT_4SQUARE: '\x1b\x21\x30', // Double width & height text

    TXT_HEIGHT: {
      1: '\x00',
      2: '\x01',
      3: '\x02',
      4: '\x03',
      5: '\x04',
      6: '\x05',
      7: '\x06',
      8: '\x07'
    },
    TXT_WIDTH: {
      1: '\x00',
      2: '\x10',
      3: '\x20',
      4: '\x30',
      5: '\x40',
      6: '\x50',
      7: '\x60',
      8: '\x70'
    },

    TXT_UNDERL_OFF: '\x1b\x2d\x00', // Underline font OFF
    TXT_UNDERL_ON: '\x1b\x2d\x01', // Underline font 1-dot ON
    TXT_UNDERL2_ON: '\x1b\x2d\x02', // Underline font 2-dot ON
    TXT_BOLD_OFF: '\x1b\x45\x00', // Bold font OFF
    TXT_BOLD_ON: '\x1b\x45\x01', // Bold font ON
    TXT_ITALIC_OFF: '\x1b\x35', // Italic font ON
    TXT_ITALIC_ON: '\x1b\x34', // Italic font ON
    TXT_FONT_A: '\x1b\x4d\x00', // Font type A
    TXT_FONT_B: '\x1b\x4d\x01', // Font type B
    TXT_FONT_C: '\x1b\x4d\x02', // Font type C
    TXT_ALIGN_LT: '\x1b\x61\x00', // Left justification
    TXT_ALIGN_CT: '\x1b\x61\x01', // Centering
    TXT_ALIGN_RT: '\x1b\x61\x02', // Right justification

  }


  LINE_DASH = '------------------------------------------------\n';
  LINE_FEED = '\x0a';
  LINE_SPACING = '\x1b\x33\x24';
  LINE_SPACING_SMALL = '\x1b\x33\x00';

  qr_model = '\x32';           // 31 or 32
  qr_size = '\x04';         // size
  qr_eclevel = '\x33';          // error correction level (30, 31, 32, 33 - higher)
  qr_data = 'https://line.me/R/ti/p/3V3s9jNJww';
  qr_pL = String.fromCharCode((this.qr_data.length + 3) % 256);
  qr_pH = String.fromCharCode((this.qr_data.length + 3) / 256);


  bluetoothEnable: any;
  typeBill: any;
  billNumber: any;
  phoneKeep: any;
  Address: any;
  keepName: any;
  lineID: any = 'LINE ID: @tmn.pattaya';

  public transfer: boolean = false;
  KeeperName: any;
  typePay: any;

    //SMS
    url : any = 'http://smsapi.cat4sms.com/cat4api/api.php';
    method : any = 'send';
    username : any = 'tmncable';
    password : any = 'cabletmn';
    sender : any = 'TMN Cable';
    sendername :any = 'TMN Cable';
    destination :any = '0861505398';
    //msg : any = 'ขอบคุณที่ชำระค่าบริการเคเบิลทีวี';
    //tel :any = 'ติดต่อ โทร 087-138-8866';
    resultList:any;
    
  

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public api: ApiProvider,
    public bluetoothle: BluetoothLE,
    public platform: Platform,
    public bts: BluetoothSerial,
    public storage: Storage,
    private toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public network: Network
  ) {
  }

  async ionViewDidLoad() {
    console.log('ionViewDidLoad PaybillPage');
    this.item = this.navParams.get('item');
    console.log('Item = ', this.item);

    if (this.item.BranchTMN == "0" || this.item.BranchTMN == "2") {
      console.log("สาขาสำนักงานใหญ่", this.item.BranchTMN);
    } else if (this.item.BranchTMN == "1") {
      console.log("สาขาพัทยา", this.item.BranchTMN);
    }

    if (!this.item) {
      this.navCtrl.push('HomePage');
    }

    await this.checkBluetooth();
    this.user = await this.getUser();
    this.billNumber = await this.getReceiptNumber();
    await this.getKeeperList();
    this.getKeeperName();

    if (this.bluetoothEnable) {
      this.device = await this.getPrinter();
      this.deviceList = await this.listPrinter();
    }

  }

  async listPrinter() {
    return await this.bts.list();
  }


  async getPrinter() {
    return await this.storage.get('printer');
  }

  getKeeperName() {
    let kp = this.getKeeper();
    if (kp) {
      console.log('ผู้ออกบิล', kp.KeeperName);
      return kp.KeeperName;
    }
    return '';
  }

  getKeeper() {

    if (this.Keeper) {
      let data = this.api.findObject(this.KeeperList, this.Keeper, "KeeperID");
      if (data) {
        return data;
      } else {
        return null;
      }
    } else {
      return null;
    }

  }

  async getKeeperList() {
    let formData = new FormData();
    formData.append('branch', this.item.BranchTMN);
    formData.append('name', this.user.EmployeeName);
    let resultData = await this.api.Post('กำลังโหลดข้อมูล...', this.api.routeKeeper, formData)
    if (resultData.error) {
      this.api.errorAlert(resultData.error_message);
      return;
    }

    this.KeeperList = resultData.keeper;
    this.Keeper = await this.storage.get('keeperHistory');
    //console.log('Keeper=',this.Keeper);

    if (this.item.BranchTMN == "1") {

      console.log('สาขาพัทยา');

    } else {

      console.log('สำนักงานใหญ่');

    }

    if (this.Keeper == '00004') {

      this.phoneKeep = '061-7891365';
      console.log('เบอร์โทรชู', this.phoneKeep);

    } else if (this.Keeper == '00187') {

      this.phoneKeep = '061-8260089';
      console.log('เบอร์โทรต้น', this.phoneKeep);

    } else if (this.Keeper == '00093') {

      this.phoneKeep = '097-0534671';
      console.log('เบอร์โทรโด่ง', this.phoneKeep);

    }

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
  findObject(arr, value, key) {
    if (arr instanceof Array && key) {
      return arr.find(x => x[key] == value);
    }

  }

  async getReceiptNumber() {

    let formData = new FormData();
    formData.append('branch', this.item.BranchTMN);
    let data = await this.api.Post('', this.api.routeReceiptNumber, formData);
    return data;

  }

  async getUser() {
    return await this.storage.get('user');
  }

  async checkBluetooth() {

    try {
      this.bluetoothEnable = await this.bts.isEnabled();

    } catch (error) {
      this.ToastMessage('กรุณาเปิด Bluetooth');
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

  ///////////////////////******************คำสั่งการทำงาน***********************///////////////////////////////////

  async print_bill() {

    if (!this.Keeper) {
      this.api.errorAlert("กรุณาเลือกผู้ออกใบแจ้งหนี้ / ใบรับเงินชั่วคราว");
      return;
    }

    let printData = null;

    if (this.item && this.item.IsPay === 0) {

      if (this.item.BranchTMN == "1") {

        printData = this.printInvoicePattaya();
        this.ToastMessage('เลือกพิพม์ใบแจ้งราคา');
        let send = await this.notPay();
        if (!send) {
          this.api.errorAlert('ไม่สามารถเชื่อมต่ออินเตอร์เน็ตได้');
          return false;
        }
        console.log('สาขาพัทยา');

      } else {

        printData = this.printDataInvoice();
        this.ToastMessage('เลือกพิพม์ใบแจ้งราคา');
        let send = await this.notPay();
        if (!send) {
          this.api.errorAlert('ไม่สามารถเชื่อมต่ออินเตอร์เน็ตได้');
          return false;
        }
        console.log('สำนักงานใหญ่');

      }
    } else {

      console.log('เลือกพิพม์ใบเสร็จรับเงิน');
      printData = this.printDataReceipt();
      this.ToastMessage('เลือกพิพม์ใบเสร็จรับเงิน');
      let send = await this.isPay();
      if (!send) {
        this.api.errorAlert('ไม่สามารถเชื่อมต่ออินเตอร์เน็ตได้');
        return false;
      }

    }

    let connect = this.bts.connect(this.device).subscribe(data => {

      this.bts.clear().then(() => {
        this.bts.write(printData).then(dataz => {

          connect.unsubscribe();
          this.api.confirmAlert('กรุณาฉีกต้นฉบับออกจากเครื่องพิมพ์ ก่อนพิมพ์สำเนา', () => {
            // this.printCopy(this.item.IsPay);
            this.printOnlyCopy();
          
          });
        }, errx => {
          this.api.errorAlert(errx);
        });
      });

    }, err => {

      
      this.ToastMessage("ไม่มีการเชื่อมต่ออุปกรณ์ Bluetooth");


    });

  }


  async notPay() {
    let res = await this.updateStatus("กำลังอัพเดทสถานะลูกค้ายังไม่ได้จ่ายเงิน", "0", this.billNumber['invoice']);
    console.log(res);
    return res;
  }

  printOnlyCopy() {

    //this.pay = pay;

    if (this.item && this.item.IsPay === -1) {
      this.printCopy("1");
      return;
    }
    this.printCopy("0");
    //console.log('เลือก ', this.pay);
    //this.printCopy(this.pay);
    

  }

  printCopy(type) {

    let printData = null;

    this.keepName = this.getKeeperName();
    console.log('Name', this.keepName);

    if (!this.keepName) {
      this.api.errorAlert("กรุณาเลือกผู้ออกใบแจ้งหนี้ / ใบรับเงินชั่วคราว");
      return;

    } else {
      if (type === '0') {

        if (this.item.BranchTMN == "0" || this.item.BranchTMN == "2") {

          printData = this.printDataInvoice(true);
          //console.log("สาขาสำนักงานใหญ่",this.item.BranchTMN);

        } else if (this.item.BranchTMN == "1") {

          printData = this.printInvoicePattaya(true);
          // console.log("สาขาพัทยา",this.item.BranchTMN)
          ;
        }
      } else if (type === '1') {
        printData = this.printDataReceipt(true);
        // console.log("Type=",type);
      }
      console.log('type volume', type);

      let connect = this.bts.connect(this.device).subscribe(data => {

        this.bts.clear().then(() => {
          this.bts.write(printData).then(dataz => {
            this.ToastMessage("การพิมพ์สำเร็จ");

            this.typeBill = null;
            connect.unsubscribe();
          }, errx => {
            this.api.errorAlert(errx);
          });
        });

      }, err => {

        this.ToastMessage("ไม่มีการเชื่อมต่ออุปกรณ์ Bluetooth");

      });

    }

    // if (!type || !printData) {
    //   this.api.errorAlert("กรุณาเลือกประเภทบิล และ พิมพ์ต้นฉบับก่อน ปุ่มนี้สำหรับในกรณีที่หลังจากพิมพ์ต้นฉบับแล้วไม่มีสำเนาออกมา");
    //   return false;
    // }

  }


  getDate() {
    let date = new Date();
    let d = date.getDate();
    let m = date.getMonth() + 1;
    let Y = date.getFullYear();

    let D = ("0" + d).slice(-2);
    let M = ("0" + m).slice(-2);
    return [D, M, Y].join('-');
  }

  getTime() {

    let now = new Date();
    let h = now.getHours();
    let m = now.getMinutes();

    let H = ("0" + h).slice(-2);
    let M = ("0" + m).slice(-2);

    return [H, M].join(":");
  }

  getBranchName() {

    if (this.item.BranchTMN == "1") {

      return "สาขาพัทยา";

    }
    return "สำนักงานใหญ่";
  }
  getBranchAddress() {

    if (this.item.BranchTMN == "1") {

      return "99/1032 ม.10 ต.หนองปรือ อ.บางละมุง จ.ชลบุรี 20150";

    }

    return "263/92 ม.12 ต.หนองปรือ อ.บางละมุง จ.ชลบุรี 20150";

  }
  renderAddress(item) {
    let address = "";

    address += item.StreetNo + " ";
    address += (item.Moo ? "ม." + item.Moo + " " : " ");
    address += "ถ." + item.Street + " ";
    address += "ต." + item.Kwaeng + " ";

    if (address.length > 36) {
      address = address.substr(0, 36);
    }

    // address += "อ." + item.Kaet + " ";
    // address += "จ." + item.Province + " ";
    // address += item.ZipCode + " ";
    return address;
  }

  //สาขาพัทยา
  printInvoicePattaya(copy = false) {

    let qr_model = '\x32';           // 31 or 32
    let qr_size = '\x04';         // size
    let qr_eclevel = '\x33';          // error correction level (30, 31, 32, 33 - higher)
    let qr_data = '00020101021130540016A00000067701011201150205549018029010206REF0010301053037645802TH62170713IFB08714495596304530F';
    let qr_pL = String.fromCharCode((qr_data.length + 3) % 256);
    let qr_pH = String.fromCharCode((qr_data.length + 3) / 256);
    let writeData = "";

    writeData += this.CLS;
    writeData += this.TXT_ALIGN_CT;
    writeData += this.TXT_HEADER;
    writeData += "ใบวางบิล/ใบแจ้งค่าบริการ : INVOICE  \n";

    //writeData += this.TXT_SMALL;
    writeData += this.TXT_NORMAL;
    writeData += "(" + (copy ? "สำเนา:บัญชี" : "ต้นฉบับ:ลูกค้า") + ") เลขที่ " + this.billNumber['invoice'] + "\n";
    writeData += "**ไม่ใช่ใบเสร็จรับเงิน/ไม่ใช่ใบกำกับภาษี** \n";

    writeData += this.TXT_ALIGN_LT;
    writeData += this.TXT_NORMAL;

    writeData += " บริษัท ทิพย์มณี มีเดีย เน็ตเวิร์ค จำกัด (" + this.getBranchName() + ")\n";
    writeData += this.getBranchAddress() + "\n";
    writeData += "สถานที่ติดต่อประสานงาน 51/2 ม.13 ต.หนองปริอ อ.บางละมุง\n";
    writeData += "จ.ชลบุรี 20150 (ตรงข้ามสวนสุขภาพเทศบาลหนองปรือ)      \n";
    writeData += "โทร.038-249734, 038-072556-7  โทรสาร.038-072563 \n";
    writeData += this.TXT_ALIGN_CT;
    writeData += this.TXT_HEADER;
    writeData += "------------------------------------------------\n";
    writeData += this.TXT_ALIGN_LT;
    writeData += this.TXT_NORMAL;
    writeData += " รหัสสมาชิก " + this.item.InvoiceID;
    writeData += " เลขที่บิล " + this.item.InvoiceNo + "\n";
    writeData += " ชื่อ : " + this.item.FirstName + " " + this.item.LastName + "\n";
    writeData += " ที่อยู่ : " + this.renderAddress(this.item) + "\n";
    writeData += " โทรศัพท์ : " + this.item.Tel1 + "\n";
    writeData += " ประเภทสมาชิก : " + this.item.DescriptionRate + "\n";
    writeData += "รอบใช้บริการ : " + this.api.reversedDate(this.item.LastPay) + " ถึง " + this.api.reversedDate(this.item.NextPay) + "\n";
    writeData += " ยอดชำระ : " + this.api.FormatNumber(this.item.Total) + "\n";
    writeData += "(" + this.api.ArabicNumberToText(this.item.Total) + ")\n";
    //writeData += " วันครบกำหนดชำระครั้งต่อไป : "  + this.api.reversedDate(this.item.NextPay) + "\n";
    writeData += this.TXT_ALIGN_CT;
    writeData += this.TXT_HEADER;
    writeData += "------------------------------------------------\n";
    writeData += this.TXT_ALIGN_LT;
    writeData += " ลงชื่อ " + this.getKeeperName() + " ผู้แจ้งค่าบริการ\n";
    writeData += " โทรศัพท์ " + this.phoneKeep + "\n";
    writeData += " วันที่ " + this.getDate() + " เวลา " + this.getTime() + "\n";
    writeData += this.TXT_ALIGN_CT;
    writeData += this.TXT_HEADER;
    writeData += "------------------------------------------------\n";


    //ถ้าไม่ใช่ปริ้นก็อปปี้ ถึงจะปริ้นข้อมูลด้านล่าง
    if (!copy) {

      writeData += this.TXT_ALIGN_LT;
      writeData += this.TEXT_FORMAT.TXT_2WIDTH;
      writeData += " ช่องทางชำระเงิน\n";
      writeData += this.TXT_NORMAL;
      writeData += " 1.ชำระเงินกับเจ้าหน้าที่บริษัทฯ ได้ทันที\n";
      writeData += " 2.ชำระเงินได้ที่ศูนย์บริการ TMN เคเบิล ทีวี\n";
      writeData += "   เปิดบริการทุกวัน เวลา 08.00 น. ถึง 17.00 น.\n";
      writeData += "   โทร.087-1389955\n";
      writeData += "   สอบถามข้อมูล LINE ID: @tmn.pattaya\n";
      writeData += " 3.ชำระโดยโอนเงินเข้าบัญชี\n";
      writeData += "   บ.ทิพย์มณี มีเดีย เน็ตเวิร์ค จำกัด\n";
      writeData += "   ธ.ไทยพาณิชย์ เลขที่บัญชี 642-301504-6\n";
      writeData += "   สาขานาเกลือ\n";
      writeData += this.TXT_ALIGN_LT;
      writeData += this.TXT_HEADER;

/*       writeData += " 4.ชำระที่เคาน์เตอร์เซอร์วิส \n";
      writeData += "   7-Eleven ชำระค่าบริการผ่าน เคเบิล ไทยบิลลิ่ง\n";
      writeData += this.TXT_ALIGN_CT;
      writeData += this.TXT_HEADER;
      writeData += this.item.BillingCode + "\n";
      writeData += this.BARCODE_MODE_CODE39 + this.item.BillingCode + '\x00'; */

     //writeData += this.TEXT_FORMAT.TXT_2WIDTH;
     writeData += this.TXT_BOLD_ON; // Bold font ON
       
     writeData += "แจ้งยกเลิกการชำระค่าบริการผ่าน 7-Eleven\n";
     writeData += " มีผลตั้งแต่ 1 เมษายน นี้เป็นต้นไป\n";
     writeData += "โดยระหว่างนี้ท่านสมาชิกยังคงสามารถ\n";
     writeData += "ทำการชำระได้ถึงวันที่ 31 มีนาคม 2568 นี้เท่านั้น\n";

      writeData += this.TXT_ALIGN_LT;
      writeData += this.TXT_HEADER;
      writeData += " 5.สแกน QR CODE เพื่อชำระเงิน\n";
      writeData += this.TXT_ALIGN_CT;
      writeData += '\x1D\x28\x6B\x04\x00\x31\x41' + qr_model + '\x00' +        // Select the model
        '\x1D\x28\x6B\x03\x00\x31\x43' + qr_size +                  // Size of the model
        '\x1D\x28\x6B\x03\x00\x31\x45' + qr_eclevel +               // Set n for error correction
        '\x1D\x28\x6B' + qr_pL + qr_pH + '\x31\x50\x30' + qr_data + // Store data 
        '\x1D\x28\x6B\x03\x00\x31\x51\x30' +                        // Print
        '\n';
      writeData += "ID : 020554901802901\n";
      writeData += "\n";

      writeData += this.TEXT_FORMAT.TXT_2WIDTH;
      writeData += this.TXT_BOLD_ON; // Bold font ON
      writeData += "เมื่อชำระเงินเสร็จสิ้นทุกครั้ง\n";
      writeData += "กรุณาส่งหลักฐาน\n";
      writeData += "กรุณาส่งหลักฐานการชำระผ่าน\n";
      writeData += "Line ID:@tmn.pattaya\n";
      writeData += this.TXT_ALIGN_CT;
      writeData += this.TXT_HEADER;
      writeData += "------------------------------------------------\n";
      writeData += this.TXT_ALIGN_LT;
      writeData += this.TXT_HEADER;
      writeData += " หมายเหตุ\n";
      writeData += this.TXT_NORMAL;
      writeData += " 1.เมื่อชำระเงินเสร็จสิ้น\n";
      writeData += "   กรุณาส่งหลักฐานการชำระเงินมายัง\n";
      writeData += "   Line ID : @tmn.pattaya\n";
      writeData += "   เพื่อหลีกเลี่ยงการระงับสัญญาณโดยอัตโนมัติ\n";
      writeData += " 2.บริษัทฯ ขออภัยหากท่านลูกค้าชำระเงิน\n";
      writeData += "   ก่อนได้รับใบแจ้งค่าบริการฉบับนี้\n";
      writeData += " 3.ติดต่อสอบถามข้อมูลค่าบริการ\n";
      writeData += "   ต้องการใบกำกับภาษี โทร. 087-1449559\n";
      writeData += this.TXT_ALIGN_CT;
      writeData += this.TXT_HEADER;
      writeData += "------------------------------------------------\n";
      writeData += this.TXT_ALIGN_LT;
      writeData += this.TXT_HEADER;
      writeData += " พื้นที่ประชาสัมพันธ์\n";
      writeData += this.TXT_NORMAL;
      writeData += " - รับติดตั้งอินเตอร์เน็ต+เคเบิลทีวี\n";
      writeData += " - รับติดตั้งกล้องวงจรปิด\n";
      writeData += " - งานวางระบบ เน็ตเวิร์ค/IT\n";
      writeData += " - ปรึกษาฟรี โทร.038-249-734\n";
      writeData += this.TXT_ALIGN_CT;
      writeData += this.TXT_HEADER;
      writeData += "*โปรดตรวจสอบความถูกต้องของเอกสาร*\n";
      writeData += this.lineID + "\n";
      writeData += '\x1D\x28\x6B\x04\x00\x31\x41' + this.qr_model + '\x00' +        // Select the model
        '\x1D\x28\x6B\x03\x00\x31\x43' + this.qr_size +                  // Size of the model
        '\x1D\x28\x6B\x03\x00\x31\x45' + this.qr_eclevel +               // Set n for error correction
        '\x1D\x28\x6B' + this.qr_pL + this.qr_pH + '\x31\x50\x30' + this.qr_data + // Store data 
        '\x1D\x28\x6B\x03\x00\x31\x51\x30' +                        // Print
        '\n';
      writeData += this.TXT_ALIGN_CT;
      writeData += this.TXT_HEADER;
      writeData += "ขอขอบพระคุณท่านเป็นอย่างสูง \n";
      writeData += "ที่เลือกใช้บริการ TMN เคเบิลทีวี พัทยา \n";

    }//ปิด copy
    writeData += " \n";
    writeData += " \n";
    writeData += " \n";
    writeData += " \n";
    writeData += this.CLS;

    let buff = new MutableBuffer(64 * 1024, 64 * 1024);
    buff.clear();
    buff.write(writeData, 'utf8');

    return buff.buffer;
  }

  //สาขาสำนักงานใหญ่
  printDataInvoice(copy = false) {

    let qr_model = '\x32';           // 31 or 32
    let qr_size = '\x04';         // size
    let qr_eclevel = '\x33';          // error correction level (30, 31, 32, 33 - higher)
    let qr_data = '00020101021130540016A00000067701011201150205549018029000206REF0010301053037645802TH62170713IFB08714495596304CF68';
    let qr_pL = String.fromCharCode((qr_data.length + 3) % 256);
    let qr_pH = String.fromCharCode((qr_data.length + 3) / 256);
    let writeData = "";

    writeData += this.CLS;
    writeData += this.TXT_ALIGN_CT;
    writeData += this.TXT_HEADER;
    writeData += "ใบวางบิล/ใบแจ้งค่าบริการ : INVOICE  \n";

    //writeData += this.TXT_SMALL;
    writeData += this.TXT_NORMAL;
    writeData += "(" + (copy ? "สำเนา:บัญชี" : "ต้นฉบับ:ลูกค้า") + ") เลขที่ " + this.billNumber['invoice'] + "\n";
    writeData += "**ไม่ใช่ใบเสร็จรับเงิน/ไม่ใช่ใบกำกับภาษี** \n";

    writeData += this.TXT_ALIGN_LT;
    writeData += this.TXT_NORMAL;

    writeData += " บริษัท ทิพย์มณี มีเดีย เน็ตเวิร์ค จำกัด (" + this.getBranchName() + ")\n";
    writeData += this.getBranchAddress() + "\n";
    writeData += "สถานที่ติดต่อประสานงาน 51/2 ม.13 ต.หนองปริอ อ.บางละมุง\n";
    writeData += "จ.ชลบุรี 20150 (ตรงข้ามสวนสุขภาพเทศบาลหนองปรือ)      \n";
    writeData += "โทร.038-249734, 038-072556-7  โทรสาร.038-072563 \n";
    writeData += this.TXT_ALIGN_CT;
    writeData += this.TXT_HEADER;
    writeData += "------------------------------------------------\n";
    writeData += this.TXT_ALIGN_LT;
    writeData += this.TXT_NORMAL;
    writeData += " รหัสสมาชิก " + this.item.InvoiceID;
    writeData += " เลขที่บิล " + this.item.InvoiceNo + "\n";
    writeData += " ชื่อ : " + this.item.FirstName + " " + this.item.LastName + "\n";
    writeData += " ที่อยู่ : " + this.renderAddress(this.item) + "\n";
    writeData += " โทรศัพท์ : " + this.item.Tel1 + "\n";
    writeData += " ประเภทสมาชิก : " + this.item.DescriptionRate + "\n";
    writeData += " รอบใช้บริการ : " + this.api.reversedDate(this.item.LastPay) + " ถึง " + this.api.reversedDate(this.item.NextPay) + "\n";
    writeData += " ยอดชำระ : " + this.api.FormatNumber(this.item.Total) + "\n";
    writeData += " (" + this.api.ArabicNumberToText(this.item.Total) + ")\n";
    //writeData += " วันครบกำหนดชำระครั้งต่อไป : "  + this.api.reversedDate(this.item.NextPay) + "\n";
    writeData += this.TXT_ALIGN_CT;
    writeData += this.TXT_HEADER;
    writeData += "------------------------------------------------\n";
    writeData += this.TXT_ALIGN_LT;
    writeData += " ลงชื่อ " + this.getKeeperName() + " ผู้แจ้งค่าบริการ\n";
    writeData += " โทรศัพท์ " + this.phoneKeep + "\n";
    writeData += " วันที่ " + this.getDate() + " เวลา " + this.getTime() + "\n";
    writeData += this.TXT_ALIGN_CT;
    writeData += this.TXT_HEADER;
    writeData += "------------------------------------------------\n";


    //ถ้าไม่ใช่ปริ้นก็อปปี้ ถึงจะปริ้นข้อมูลด้านล่าง
    if (!copy) {
      // เพิ่มเติมชำระเงิน
      writeData += "\n";
      writeData += "\n";
      writeData += "\n";
      writeData += this.TXT_ALIGN_CT;
      writeData += this.TEXT_FORMAT.TXT_2WIDTH;
      writeData += "*** แจ้งยกเลิก ***\n";
      writeData += "การชำระค่าบริการผ่าน\n";
      writeData += "7-Eleven มีผลตั้งแต่\n";
      writeData += "1 เมษายน นี้เป็นต้นไป\n";
      writeData += "โดยระหว่างนี้ท่านสมาชิก\n";
      writeData += "ยังคงสามารถทำการชำระได้\n";
      writeData += "ถึงวันที่ 31 มีนาคม 2568\n";
      writeData += "นี้เท่านั้น\n";
      writeData += "\n";
      writeData += "\n";
      writeData += "\n";
      writeData += "------------------------------------------------\n";


      writeData += this.TXT_ALIGN_LT;
      writeData += this.TEXT_FORMAT.TXT_2WIDTH;
      writeData += " ช่องทางชำระเงิน\n";
      writeData += this.TXT_NORMAL;
      writeData += " 1.ชำระเงินกับเจ้าหน้าที่บริษัทฯ ได้ทันที\n";
      writeData += " 2.ชำระเงินได้ที่ศูนย์บริการ TMN เคเบิล ทีวี\n";
      writeData += "   เปิดบริการทุกวัน เวลา 08.00 น. ถึง 17.00 น.\n";
      writeData += "   โทร.087-1389955\n";
      writeData += "   สอบถามข้อมูล LINE ID: @tmn.pattaya\n";
      writeData += " 3.ชำระโดยโอนเงินเข้าบัญชี\n";
      writeData += "   บ.ทิพย์มณี มีเดีย เน็ตเวิร์ค จำกัด\n";
      writeData += "   ธ.ไทยพาณิชย์ เลขที่บัญชี 969-3-00060-9\n";
      writeData += "   สาขาซอยเนินพลับหวาน\n";

      /* writeData += this.TXT_ALIGN_LT;
      writeData += this.TXT_HEADER;
      writeData += " 4.ชำระที่เคาน์เตอร์เซอร์วิส \n";
      writeData += "   7-Eleven ชำระค่าบริการผ่าน เคเบิล ไทยบิลลิ่ง\n";
      writeData += this.TXT_ALIGN_CT;
      writeData += this.TXT_HEADER;
      writeData += this.item.BillingCode + "\n";
      writeData += this.BARCODE_MODE_CODE39 + this.item.BillingCode + '\x00'; */

      //writeData += this.TEXT_FORMAT.TXT_2WIDTH;

      writeData += this.TXT_ALIGN_LT;
      writeData += this.TXT_HEADER;
      writeData += " 5.สแกน QR CODE เพื่อชำระเงิน\n";
      writeData += this.TXT_ALIGN_CT;
      writeData += '\x1D\x28\x6B\x04\x00\x31\x41' + qr_model + '\x00' +        // Select the model
        '\x1D\x28\x6B\x03\x00\x31\x43' + qr_size +                  // Size of the model
        '\x1D\x28\x6B\x03\x00\x31\x45' + qr_eclevel +               // Set n for error correction
        '\x1D\x28\x6B' + qr_pL + qr_pH + '\x31\x50\x30' + qr_data + // Store data 
        '\x1D\x28\x6B\x03\x00\x31\x51\x30' +                        // Print
        '\n';
      writeData += "ID : 020554901802900\n";
      writeData += "\n";

      writeData += this.TEXT_FORMAT.TXT_2WIDTH;
      writeData += this.TXT_BOLD_ON; // Bold font ON
      writeData += "เมื่อชำระเงินเสร็จสิ้นทุกครั้ง\n";
      writeData += "กรุณาส่งหลักฐานการชำระผ่าน\n";
      writeData += "Line ID:@tmn.pattaya\n";
      writeData += this.TXT_ALIGN_CT;
      writeData += this.TXT_HEADER;
      writeData += "------------------------------------------------\n";
      writeData += this.TXT_ALIGN_LT;
      writeData += this.TXT_HEADER;
      writeData += " หมายเหตุ\n";
      writeData += this.TXT_NORMAL;
      writeData += " 1.เมื่อชำระเงินเสร็จสิ้น\n";
      writeData += "   กรุณาส่งหลักฐานการชำระเงินมายัง\n";
      writeData += "   Line ID : @tmn.pattaya\n";
      writeData += "   เพื่อหลีกเลี่ยงการระงับสัญญาณโดยอัตโนมัติ\n";
      writeData += " 2.บริษัทฯ ขออภัยหากท่านลูกค้าชำระเงิน\n";
      writeData += "   ก่อนได้รับใบแจ้งค่าบริการฉบับนี้\n";
      writeData += " 3.ติดต่อสอบถามข้อมูลค่าบริการ\n";
      writeData += "   ต้องการใบกำกับภาษี โทร. 087-1449559\n";
      writeData += this.TXT_ALIGN_CT;
      writeData += this.TXT_HEADER;
      writeData += "------------------------------------------------\n";
      /* writeData += this.TXT_ALIGN_LT;
      writeData += this.TXT_HEADER;
      writeData += " พื้นที่ประชาสัมพันธ์\n";
      writeData += this.TXT_NORMAL;
      writeData += " - รับติดตั้งอินเตอร์เน็ต+เคเบิลทีวี\n";
      writeData += " - รับติดตั้งกล้องวงจรปิด\n";
      writeData += " - งานวางระบบ เน็ตเวิร์ค/IT\n";
      writeData += " - ปรึกษาฟรี โทร.038-249-734\n"; */

      writeData += this.TXT_ALIGN_CT;
      writeData += this.TXT_HEADER;
      //writeData += "*โปรดตรวจสอบความถูกต้องของเอกสาร*\n";
      writeData += this.lineID + "\n";
      writeData += '\x1D\x28\x6B\x04\x00\x31\x41' + this.qr_model + '\x00' +        // Select the model
        '\x1D\x28\x6B\x03\x00\x31\x43' + this.qr_size +                  // Size of the model
        '\x1D\x28\x6B\x03\x00\x31\x45' + this.qr_eclevel +               // Set n for error correction
        '\x1D\x28\x6B' + this.qr_pL + this.qr_pH + '\x31\x50\x30' + this.qr_data + // Store data 
        '\x1D\x28\x6B\x03\x00\x31\x51\x30' +                       // Print
        '\n';

      /* writeData += this.TXT_ALIGN_CT;
      writeData += this.TXT_HEADER;
      writeData += "ขอขอบพระคุณท่านเป็นอย่างสูง \n";
      writeData += "ที่เลือกใช้บริการ TMN เคเบิลทีวี พัทยา \n"; */

    } //ปิด copy


    writeData += " \n";
    writeData += " \n";
    writeData += " \n";
    writeData += this.CLS;

    let buff = new MutableBuffer(64 * 1024, 64 * 1024);
    buff.clear();
    buff.write(writeData, 'utf8');

    return buff.buffer;
  }


  ////////////////////// จ่ายเงิน///////////////////////////

  pay_bill() {
    //console.log('ปริ้นจ่ายเงิน', this.typePay);
    let printData = null;

    printData = this.printDataReceipt();
    this.ToastMessage('เลือกพิพม์ใบเสร็จรับเงิน');
    let send = this.isPay();
    if (!send) {
      this.api.errorAlert('ไม่สามารถเชื่อมต่ออินเตอร์เน็ตได้');
      return false;
    }

    let connect = this.bts.connect(this.device).subscribe(data => {

      this.bts.clear().then(() => {
        this.bts.write(printData).then(dataz => {

          connect.unsubscribe();
          this.api.confirmAlert('กรุณาฉีกต้นฉบับออกจากเครื่องพิมพ์ ก่อนพิมพ์สำเนา', () => {
            this.printOnlyCopy();
          });
        }, errx => {
          this.api.errorAlert(errx);
        });
      });

    }, err => {

      this.ToastMessage("ไม่มีการเชื่อมต่ออุปกรณ์ Bluetooth");

    });
  }
  /*   printCopyPay() {
      let printDatapay = null;
      printDatapay = this.printDataReceipt(true);
  
      let connect = this.bts.connect(this.device).subscribe(data => {
  
        this.bts.clear().then(() => {
          this.bts.write(printDatapay).then(dataz => {
            this.ToastMessage("การพิมพ์สำเร็จ");
  
            this.typeBill = null;
            connect.unsubscribe();
          }, errx => {
            this.api.errorAlert(errx);
          });
        });
  
      }, err => {
  
        this.ToastMessage("ไม่มีการเชื่อมต่ออุปกรณ์ Bluetooth");
  
      })
    } */
  async clkic_typepay() {
    this.changepay((type) => {

      this.typePay = type;
      if (this.typePay == 'เงินสด') {

        this.KeeperName = this.Keeper;

      } else if (this.typePay == 'สแกนจ่าย') {

        this.KeeperName = '99993';

      } else if (this.typePay == 'เงินโอน') {

        this.KeeperName = '99996';

      } else if (this.typePay == 'เช็ค') {

        this.KeeperName = '99995';

      }

      this.pay_bill();
      console.log('TypePay =', this.typePay);
    });

  }
  changepay(cb) {
    let alert = this.alertCtrl.create();

    alert.setTitle('เลือกประเภทใบเสร็จ');

    alert.addInput({
      type: 'radio',
      label: 'เงินสด',
      value: 'เงินสด',
      checked: true
    });
    alert.addInput({
      type: 'radio',
      label: 'เงินโอน',
      value: 'เงินโอน',
      checked: false
    });
    alert.addInput({
      type: 'radio',
      label: 'สแกนจ่าย',
      value: 'สแกนจ่าย',
      checked: false
    });
    alert.addInput({
      type: 'radio',
      label: 'เช็ค',
      value: 'เช็ค',
      checked: false
    });

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: data => {
        cb(data);

      }
    });
    alert.present();
  }

    //ส่ง SMS
    async Send_SMS(){

      let data_sms = "ขอบคุณที่ชำระค่าบริการเคเบิลทีวี "+ this.item.Total +" บาท วันที่ " + this.getDate() + " เวลา " + this.getTime() +" ติดต่อ โทร.087-138-8866";
      let formData = new FormData();
      formData.append('method', this.method);
      formData.append("username", this.username);
      formData.append("password", this.password);
      formData.append("sender", this.sender);
      formData.append("sendername", this.sendername);
      formData.append("destination", this.item.Tel1);
      formData.append("message",data_sms);
      
      let data =  await this.api.Post('กำลังค้นหาข้อมูล...',this.url, formData);
      if(data){
        this.resultList = data;
        console.log('Data=',data);
      }
    }

    
  async isPay() {
    let res = await this.updateStatus("กำลังอัพเดทสถานะลูกค้าจ่ายเงินแล้ว...", "1", this.billNumber['receipt']);
    console.log(res);
    this.Send_SMS(); // Send SMS
    return res;
    
  }

  //ปริ้นจ่ายเงิน
  printDataReceipt(copy = false) {

    let writeData = "";

    writeData += this.CLS;
    writeData += this.TXT_ALIGN_CT;
    writeData += this.TXT_HEADER;
    writeData += "ใบรับเงินชั่วคราว : Temporary Receipt \n";
    //writeData += this.TXT_SMALL;
    writeData += this.TXT_NORMAL;
    writeData += "(" + (copy ? "สำเนา:บัญชี" : "ต้นฉบับ:ลูกค้า") + ") เลขที่ " + this.billNumber['receipt'] + "\n";
    writeData += "**ไม่ใช่ใบกำกับภาษี** \n";

    writeData += this.TXT_ALIGN_LT;
    writeData += this.TXT_NORMAL;

    writeData += "บริษัท ทิพย์มณี มีเดีย เน็ตเวิร์ค จำกัด (" + this.getBranchName() + ")\n";
    writeData += this.getBranchAddress() + "\n";
    writeData += "สถานที่ติดต่อประสานงาน 51/2 ม.13 ต.หนองปริอ อ.บางละมุง\n";
    writeData += "จ.ชลบุรี 20150 (ตรงข้ามสวนสุขภาพเทศบาลหนองปรือ)      \n";
    writeData += "โทร.038-249734, 038-072556-7  โทรสาร.038-072563 \n";

    writeData += "------------------------------------------------\n";
    writeData += "รหัสสมาชิก " + this.item.InvoiceID;
    writeData += "  เลขที่บิล " + this.item.InvoiceNo + "\n";
    writeData += "ชื่อ : " + this.item.FirstName + " " + this.item.LastName + "\n";
    writeData += "ที่อยู่ : " + this.renderAddress(this.item) + "\n";
    writeData += "โทรศัพท์ : " + this.item.Tel1 + "\n";
    writeData += "ประเภทสมาชิก : " + this.item.DescriptionRate + "\n";
    writeData += "รอบใช้บริการ : " + this.api.reversedDate(this.item.LastPay) + " " + this.api.reversedDate(this.item.NextPay) + "\n";
    writeData += "ยอดชำระ : " + this.api.FormatNumber(this.item.Total) + "\n";
    writeData += "          (" + this.api.ArabicNumberToText(this.item.Total) + ")\n";
    writeData += "วันครบกำหนดชำระครั้งต่อไป : " + this.api.reversedDate(this.item.NextPay) + "\n";


    writeData += "------------------------------------------------\n";

    writeData += ("ลงชื่อ " + this.typePay + " / " + this.getKeeperName() + " ผู้รับเงิน\n");

    writeData += "วันที่ " + this.getDate() + " เวลา " + this.getTime() + "\n";

    writeData += "------------------------------------------------\n";

    writeData += this.TXT_NORMAL;
    writeData += "ขอขอบพระคุณท่านเป็นอย่างสูง ที่เลือกใช้บริการ TMN เคเบิลทีวี\n";

    // writeData += this.promotions;
    writeData += "*โปรดตรวจสอบความถูกต้องของเอกสาร*\n";
    writeData += this.TXT_NORMAL;
    writeData += "LINE ID: @tmn.pattaya\n";

    writeData += " \n";
    writeData += " \n";
    writeData += " \n";

    writeData += "------------------------------------------------\n";

    writeData += this.CLS;

    let buff = new MutableBuffer(64 * 1024, 64 * 1024);
    buff.clear();
    buff.write(writeData, 'utf8');

    return buff.buffer;
  }


  async updateStatus(message, status, billapp) {

    let formData = new FormData();
    formData.append("id", this.item.InvoiceID);
    formData.append('branch', this.item.BranchTMN);
    formData.append("status", status);
    formData.append("billnumber", billapp);
    formData.append("keeper", this.typePay ? this.KeeperName : this.Keeper);
    formData.append("employee", this.user.EmployeeID);

    let res = await this.api.Post(message, this.api.routeStatus, formData);

    if (res && res.success) {
      
      this.item.IsPay = status === '1' ? -1 : 0;
      return true;
    }

    return false;

  }

}//ปิด class
