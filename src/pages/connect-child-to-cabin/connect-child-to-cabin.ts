import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { ConnectChildToCabinStep_2Page } from '../connect-child-to-cabin-step-2/connect-child-to-cabin-step-2';
/**
 * Generated class for the ConnectChildToCabinPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-connect-child-to-cabin',
  templateUrl: 'connect-child-to-cabin.html',
})
export class ConnectChildToCabinPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ConnectChildToCabinPage');
  }
  openCabinStep2(){
	  this.navCtrl.setRoot(ConnectChildToCabinStep_2Page);
  }

}
