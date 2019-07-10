import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import * as WPAPI from 'wpapi';
import { Storage } from '@ionic/storage';

import { HomePage } from '../home/home';
import { ScanTicketPage } from '../scan-ticket/scan-ticket';
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
	error: string;
	endpoint: string;
	loading: boolean;
	tickets: Array<any>;
	modal: {
		showModal: boolean;
		child: any;
	}
	login: {
		username: string,
		password: string
	};

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public platform: Platform,
		public storage: Storage
	) {
		if (this.platform.is('cordova')) {
			this.endpoint = 'https://shop.timmerdorp.com/wp-json';
		} else {
			// this.endpoint = 'https://timmerdorp.test/wp-json';
			this.endpoint = 'https://staging.timmerdorp.com/wp-json';
		}
		this.init();
	}

	init() {
		this.login = {
			username: '',
			password: ''
		}
		this.loading = false;
		this.error = '';
		this.modal = {
			child: null,
			showModal: false
		}
		this.tickets = [];
	}

	getWpApi(route) {
		var wp = new WPAPI({
			endpoint: this.endpoint,
			username: this.login.username,
			password: this.login.password
		});

		wp.handler = wp.registerRoute('tickets', route, {});

		return wp;
	}

	ionViewDidLoad() {
		// let self = this;

		this.init();

		Promise.all([
			this.storage.get('username').then((val) => {
				this.login.username = val;
			}, (error) => {
				this.login.username = '';
			}),
			this.storage.get('password').then((val) => {
				this.login.password = val;
			}, (error) => {
				this.login.password = '';
			})
		]).then(() => {
		});
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
		let self = this;
		self.tickets = [];
		self.error = '';
		self.loading = true;
		console.log('searching: ' + this.searchTerm);
		var wp = this.getWpApi('search');
		wp.handler().param('search', this.searchTerm).then((result) => {
			console.log(result);
			if (result.code === 200) {
				self.tickets = result.tickets;
				if(self.tickets.length === 0){
					self.error = 'no results';
				}
				self.loading = false;
			} else {
				self.error = result.message;
				self.loading = false;
			}
		}).catch((error) => {
			self.error = error.message;
			self.loading = false;
		});
	}

	goBack() {
		this.navCtrl.setRoot(HomePage);
	}

	showModal(child) {
		this.modal.child = child;
		this.modal.showModal = true;
	}

	scanChild(barcode){
		this.navCtrl.setRoot(ScanTicketPage, { 'barcode': barcode });
	}

}
