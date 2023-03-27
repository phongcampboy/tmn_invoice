import { Component } from '@angular/core';
import { NavController, IonicPage, Platform, MenuController, ToastController, Events} from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AuthProvider } from '../../providers/auth/auth';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  formBranch:any = '0';
  formField:any = 'MemberID';
  formValue: any;

  resultList:any;

  lastBack :any;

  constructor(
    public navCtrl: NavController,
    public api : ApiProvider,
    public auth: AuthProvider,
    public platform: Platform,
    private menuCtrl: MenuController,
    private toastCtrl : ToastController,
    public events : Events
    ) {

      this.platform.ready().then(() => {
        this.platform.registerBackButtonAction(() => {
         this.ToastMessage('กดสองครั้งเพื่อออกจาก App');
          if (Date.now() - this.lastBack < 500) {
            this.platform.exitApp();
          }
          this.lastBack = Date.now();
        });
      });

      events.subscribe('settingBranch', (data) => {
        this.formBranch = data;
      });

      events.subscribe('settingSearch', (data) => {
        this.formField = data;
      });

  }

  ionViewDidLoad() {
    setTimeout(() => {
      if (!this.auth.isAuthenticated()) {
        this.navCtrl.push('LoginPage');
      }

    }, 500);

    this.getBranchSetting();
    this.getSearchSetting();

    //this.test1(this.test);
  }

/*   test(){
    console.log("F1");
  }

  test1(cb){
    console.log("F2");
    cb();
  } */   

  getBranchSetting(){
    this.auth.storage.get('settingBranch').then((data) => {
      if(data){
        this.formBranch = data;
      }
    });
  }
  

   getSearchSetting(){
    this.auth.storage.get('settingSearch').then((data) => {
      if(data){
        this.formField = data;
      }
    });
  }

  menuOpen() {
    this.menuCtrl.open();
  }
  
  ToastMessage(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });

    toast.present();
  }

  async searchData(){

    if(!this.formValue){
        this.api.errorAlert("กรุณากรอกคำค้นหาด้วยครับ");
        return false;
    }
    

    let formData = new FormData();
    formData.append('branch', this.formBranch);
    formData.append("field", this.formField);
    formData.append("value", this.formValue);
    
    let data = await this.api.Post('กำลังค้นหาข้อมูล...',this.api.routeSearch, formData);

    if(data){
      this.resultList = data;
      console.log('Data=',data);
    }

  }

  renderAddress(item) {
    let address = "";

    address += item.StreetNo + " ";
    address += (item.Moo ? "ม." + item.Moo + " " : " ");
    address += item.Mooban + " ";

    if(item.Mooban.length > 20){
      return address;
    }

    address += "ถ." + item.Street + " ";
    address += "ต." + item.Kwaeng + " ";
    // address += "อ." + item.Kaet + " ";
    // address += "จ." + item.Province + " ";
    // address += item.ZipCode + " ";
    return address;
  }

  viewDetail(item){

    item['BranchTMN'] = this.formBranch;
    //this.navCtrl.push('PrintPage',{item : item });
    this.navCtrl.push('PaybillPage',{item : item });
  }

  printPage(){
    let item = {
      id : 12,
      test: 345
    };
    this.navCtrl.push('PrintPage',{item : item });
  }


}
