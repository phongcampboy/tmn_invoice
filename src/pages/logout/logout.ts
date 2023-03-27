import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';

@IonicPage()
@Component({
  selector: 'page-logout',
  templateUrl: 'logout.html',
})
export class LogoutPage {

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private auth : AuthProvider
  ) {
 
  }

  ionViewDidLoad() {
    this.auth.logout(()=>{
      this.navCtrl.push('LoginPage');
    });
  }

}
