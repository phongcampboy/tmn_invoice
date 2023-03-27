
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class AuthProvider {
  isLoggedIn: Boolean = false;
  user: any = null;
  constructor(
    public storage: Storage
    ) {

      storage.get('user').then((user) => {
        if(user && user.EmployeeID){
          this.user = user;
          this.isLoggedIn = true;
          
        }
      });
    
  }

  login(user, cb) {

    return this.storage.set('user', user).then(() => {
      this.isLoggedIn = true;
      this.user = user;
      
      cb();
    });

  }

  logout(cb) {

    this.storage.remove('user').then(() => {
      this.isLoggedIn = false;
      this.user = null;
      cb();
    });
  }

  secertKey(key){
    this.storage.set('secert', key);
  }

  isAuthenticated() {
    return this.isLoggedIn;
  }

  getUser(key='') {

    if(key){
      return this.user[key];
    }
    return this.user;
  }

}
