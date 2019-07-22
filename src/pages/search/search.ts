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
		this.endpoint = 'https://staging.timmerdorp.com/wp-json';
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
			})
		]).then(() => {
		});
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

	searchThis() {
		if (this.searchTerm.length < 3) {
			console.log("Cancelling search. Reason: term too short");
			return false;
		}
		this.loginError = false;
		this.notLoggedIn = false;
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
		this.navCtrl.setRoot(LoginPage, {}, {animate: true, direction: 'forward'});
	}

	scanChild(barcode) {
		this.navCtrl.setRoot(ScanTicketPage, { 'barcode': barcode });
	}

	goHome() {
		this.navCtrl.setRoot(HomePage, {}, {animate: true, direction: "back"});
	}

}
