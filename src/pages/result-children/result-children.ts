import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SearchPage } from '../search/search';

/**
 * Generated class for the ResultChildrenPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-result-children',
  templateUrl: 'result-children.html',
})
export class ResultChildrenPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ResultChildrenPage');
  }

  openBacktoSearch(){
	 this.navCtrl.setRoot(SearchPage);
  }

}
