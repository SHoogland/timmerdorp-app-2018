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
	typingTimer: any;
	searchTerm: string;

	constructor(public navCtrl: NavController, public navParams: NavParams) {
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad SearchPage');
	}

	openResults() {
		this.navCtrl.setRoot(ResultChildrenPage);
	}

	search() {
		try {
			clearTimeout(this.typingTimer);
			this.typingTimer = setTimeout(() => {
				this.searchThis();
			}, 500);
		} catch (e) {
			console.log(e);
		}
	}

	searchThis() {
		console.log('searching' + this.searchTerm);
		// Parse.Cloud.run('searchChild', {
		// 	'search': this.searchTerm,
		// 	'apiKey': this.apiKey
		// }).then((response) => {
		// 	this.children = response;
		// }, (error) => {
		// 	console.log(JSON.stringify(error));
		// });
	}


}
