import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ToastController } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AuthProvider } from '../../providers/auth/auth';


@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  username: string = '';
  password: string = '';
  
  lastBack:any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private api: ApiProvider,
    private auth: AuthProvider,
    private platform : Platform,
    private toastCtrl: ToastController
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
  }

  async ionViewDidLoad() {

/*     let apiservice = await this.api.activeApi();
    if(!apiservice.active){
      setTimeout(() => {
        this.platform.exitApp();
      }, 3000); */
      
    //}else{

      setTimeout(() => {
        if (this.auth.isAuthenticated()) {
          this.navCtrl.push('HomePage');
        }
      }, 1000);

    //}

  }


  ToastMessage(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });

    toast.present();
  }

  async login() {

    let formData = new FormData();
    formData.append('username', this.username);
    formData.append('password', this.password);

    let result = await this.api.Post('กำลังลงชื่อเข้า...', this.api.routeLogin, formData);

    if (result.error) {
      this.api.errorAlert(result.error_message);
      return false;
    } else {

      this.auth.login(result.user, ()=>{
        this.auth.secertKey(this.password);
        this.navCtrl.push('HomePage');
      });
      
    }

  }

}
