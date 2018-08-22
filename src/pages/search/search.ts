import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { ResultChildrenPage } from '../result-children/result-children';
/**
 * Generated class for the SearchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SearchPage');
  }

  openResults(){
	  this.navCtrl.setRoot(ResultChildrenPage);
  }

}
