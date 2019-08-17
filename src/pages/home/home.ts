import { Component } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';

import { BarcodeScanner } from '@ionic-native/barcode-scanner';

import { SearchPage } from '../search/search';
import { ConnectChildToCabinPage } from '../connect-child-to-cabin/connect-child-to-cabin';
import { Storage } from '@ionic/storage';
import { PresencePage } from '../presence/presence';
import { LoginPage } from '../login/login';
import { ScanTicketPage } from '../scan-ticket/scan-ticket';

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
	clickedOnce = false;
	clickedTwice = false;
	staging = false;

	constructor(
		public navCtrl: NavController,
		private barcodeScanner: BarcodeScanner,
		public platform: Platform,
		public storage: Storage
	) {
		this.init();
	}

	init() {
		console.log('init');

		this.pages = [
			{
				title: 'Koppel kind aan hut',
				component: ConnectChildToCabinPage,
				class: 'bg-blue'
			},
			{
				title: 'Zoek kind',
				component: SearchPage,
				class: 'bg-blue'
			},
			{
				title: 'Aanwezigheid',
				component: PresencePage,
				class: 'bg-blue'
			},
			{
				title: 'Log uit',
				component: LoginPage,
				class: 'bg-red'
			}
		];
	}

	ionViewDidLoad() {
		this.init();
		this.storage.get('staging').then((val) => {
			this.staging = val;
		}, (error) => {
			this.staging = false;
		})
	}

	openPage(page) {
		// Reset the content nav to have just this page
		// we wouldn't want the back button to show in this scenario

		this.navCtrl.setRoot(page.component, {}, { animate: true, direction: 'forward' });
	}

	scanCode() {
		if (this.platform.is('cordova')) {
			this.barcodeScanner.scan().then((barcodeData) => {
				this.navCtrl.setRoot(ScanTicketPage, { 'barcode': barcodeData.text });
			}, (error) => {
				console.log(error);
				this.error = error.message;
			});
		} else {
			this.navCtrl.setRoot(ScanTicketPage, { 'barcode': 420 });
		}
	}

	switchEnv(){
		const _this = this;
		setTimeout(function(){
			_this.clickedOnce = false;
			_this.clickedTwice = false;
		}, 1000)
		if(this.clickedTwice){
			if(!this.staging){
				this.storage.set('staging', true);
				this.staging = true;
			} else {
				this.storage.set('staging', false);
				this.staging = false;
			}
			this.clickedOnce = false;
			this.clickedTwice = false;
		}
		if(this.clickedOnce){
			this.clickedTwice = true;
		}
		this.clickedOnce = true;
	}

	goHome() {
		return;
	}
}
