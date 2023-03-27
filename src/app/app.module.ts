import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';

import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { LoginPageModule } from '../pages/login/login.module';
import { HomePage } from '../pages/home/home';
import { HomePageModule } from '../pages/home/home.module';
import { ApiProvider } from '../providers/api/api';
import { AuthProvider } from '../providers/auth/auth';
import { PaybillPage } from '../pages/paybill/paybill';
import { HttpModule } from '@angular/http';
import { Printer } from '@ionic-native/printer';
import { BluetoothLE } from '@ionic-native/bluetooth-le';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';

import { Network } from '@ionic-native/network';
import { PaybillPageModule } from '../pages/paybill/paybill.module';



@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, {
      menuType: 'push'
    }),
    IonicStorageModule.forRoot(),
    HttpModule,
    LoginPageModule,
    HomePageModule,
    PaybillPageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    HomePage,
    PaybillPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ApiProvider,
    Printer,
    BluetoothLE,
    AuthProvider,
    BluetoothSerial,
    Network,
  ]
})
export class AppModule {}
