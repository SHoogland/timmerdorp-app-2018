import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import * as WPAPI from 'wpapi';
import { Storage } from '@ionic/storage';

import { HomePage } from '../home/home';
import { ScanTicketPage } from '../scan-ticket/scan-ticket';
import { LoginPage } from '../login/login';
import { DomSanitizer } from '@angular/platform-browser';
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
	loginError: boolean;
	notLoggedIn: boolean;
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
		public storage: Storage,
		public sanitizer: DomSanitizer
	) {
		this.endpoint = 'https://shop.timmerdorp.com/wp-json';
		this.init();
	}

	init() {
		this.login = {
			username: '',
			password: ''
		}
		this.loading = false;
		this.error = '';
		this.loginError = false;
		this.notLoggedIn = false;
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
			}),
			this.storage.get('staging').then((val) => {
				if (val) {
					this.endpoint = 'https://staging.timmerdorp.com/wp-json';
				} else {
					this.endpoint = 'https://shop.timmerdorp.com/wp-json';
				}
			}, (error) => {
				this.endpoint = 'https://shop.timmerdorp.com/wp-json';
			})
		]).then(() => {
		});
	}

	getWijk(hutNr) {
		if (hutNr[0] == '0') {
			return 'Geel';
		} else if (hutNr[0] == '1') {
			return 'Rood';
		} else if (hutNr[0] == '2') {
			return 'Blauw';
		} else if (hutNr[0] == '3') {
			return 'Groen';
		} else {
			return '';
		}
	}

	search() {
		try {
			clearTimeout(this.typingTimer);
			this.typingTimer = setTimeout(() => {
				this.searchThis();
			}, 200);
		} catch (e) {
			console.log(e);
		}
	}

	filterPhoneNr(num) {
		return (num || [""])[0].replace(/[^0-9+]/g, '');
	}

	searchThis() {
		let self = this;
		self.tickets = [];
		if (this.searchTerm.length < 3) {
			console.log("Cancelling search. Reason: term too short");
			return false;
		}
		this.loginError = false;
		this.notLoggedIn = false;
		self.error = '';
		self.loading = true;
		console.log('searching: ' + this.searchTerm);
		var wp = this.getWpApi('search');
		wp.handler().param('search', this.searchTerm).then((result) => {
			console.log(result);
			if (result.code === 200) {
				if (!isNaN(+self.searchTerm)) {
					result.tickets.sort(function (a, b) { //if the search term is a number
						if ((a.meta.wristband || [])[0] == self.searchTerm) {
							return -1;
						}
						return 1;
					}); //give priority to wristbands over hut numbers
				}
				self.tickets = result.tickets;
				if (self.tickets.length === 0) {
					self.error = 'Geen resultaten';
				}
				self.loading = false;
			} else {
				if (result.message == 'access denied') {
					this.notLoggedIn = true;
				} else {
					self.error = result.message;
					self.loading = false;
				}
			}
		}).catch((error) => {
			if (error.code === 'invalid_username' || error.code === 'incorrect_password') {
				this.loginError = true;
			} else {
				self.error = error.message;
			}
			self.loading = false;
		});
	}

	showModal(child) {
		this.modal.child = child;
		this.modal.showModal = true;
		document.querySelector('#myModal').classList.add('high');
	}

	closeModal() {
		this.modal.showModal = false;
		setTimeout(function () {
			document.querySelector('#myModal').classList.remove('high');
		}, 400);
	}

	toLogin() {
		this.navCtrl.setRoot(LoginPage, {}, { animate: true, direction: 'forward' });
	}

	scanChild(barcode) {
		this.navCtrl.setRoot(ScanTicketPage, { 'barcode': barcode });
	}

	goHome() {
		this.navCtrl.setRoot(HomePage, {}, { animate: true, direction: "back" });
	}

}
