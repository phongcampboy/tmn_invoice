import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PaybillPage } from './paybill';

@NgModule({
  declarations: [
    PaybillPage,
  ],
  imports: [
    IonicPageModule.forChild(PaybillPage),
  ],
})
export class PaybillPageModule {}
