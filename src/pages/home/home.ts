import { Component } from '@angular/core';
import { Platform, NavController, NavParams } from 'ionic-angular';

import { BarcodeScanner } from '@ionic-native/barcode-scanner';

import { ScanTicketPage } from '../scan-ticket/scan-ticket';
import { SearchPage } from '../search/search';
import { ConnectChildToCabinPage } from '../connect-child-to-cabin/connect-child-to-cabin';
import { Storage } from '@ionic/storage';

@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})
export class HomePage {
	error: string;
	pages: Array<{
		title: string,
		component: any,
		class: string
	}>;
	login: {
		username: '',
		password: ''
	};

	constructor(
		public navCtrl: NavController,
		private barcodeScanner: BarcodeScanner,
		public platform: Platform,
		public storage: Storage
	) {

		this.login = {
			username: '',
			password: ''
		}

		storage.get('username').then((val) => {
			this.login.username = val;
			// console.log('Your username is:' + val);
		}, (error) => {
			console.log('no username found');
			this.login.username = '';
		});

		storage.get('password').then((val) => {
			this.login.password = val;
			// console.log('Your password is:' + val);
		}, (error) => {
			console.log('no password found');
			this.login.password = '';
		});

		this.pages = [
			{
				title: 'Koppel kind aan hut',
				component: ConnectChildToCabinPage,
				class: 'bg-blue'
			},
			{
				title: 'Zoek kind',
				component: SearchPage,
				class: 'bg-green'
			}
		];

	}

	scanCode() {
		console.log('scan the shizzle');

		if (this.platform.is('cordova')) {
			this.barcodeScanner.scan().then((barcodeData) => {
				this.navCtrl.setRoot(ScanTicketPage, { 'barcode': barcodeData.text });
			}, (error) => {
				console.log(error);
				this.error = error.message;
			});
		} else {
			this.navCtrl.setRoot(ScanTicketPage, { 'barcode': 791621437 });
		}

	}

	openPage(page) {
		// Reset the content nav to have just this page
		// we wouldn't want the back button to show in this scenario

		this.navCtrl.setRoot(page.component);
	}

	loginNow() {
		// console.log(this.login);
		this.storage.set('username', this.login.username);
		this.storage.set('password', this.login.password);
	}
}
