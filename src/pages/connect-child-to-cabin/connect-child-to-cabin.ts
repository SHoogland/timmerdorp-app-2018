import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import * as WPAPI from 'wpapi';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';
import { HomePage } from '../home/home';

// import { ConnectChildToCabinStep_2Page } from '../connect-child-to-cabin-step-2/connect-child-to-cabin-step-2';
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
	typingTimer: any;
	hutNr: string;
	searchTerm: string;
	error: string;
	loginError: boolean;
	notLoggedIn: boolean;
	searchError: string;
	endpoint: string;
	loading: boolean;
	tickets: Array<any>;
	hutTickets: Array<any>;
	addModal: {
		show: boolean;
	}
	removeModal: {
		show: boolean;
	}
	login: {
		username: string,
		password: string
	};
	removeChild: any;

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public platform: Platform,
		public storage: Storage,
	) {
		this.endpoint = 'https://staging.timmerdorp.com/wp-json';
		this.init();
	}

	init() {
		this.login = {
			username: '',
			password: ''
		}
		this.loginError = false;
		this.notLoggedIn = false;
		this.loading = false;
		this.error = '';
		this.searchError = '';
		this.addModal = {
			show: false
		}
		this.removeModal = {
			show: false
		}
		this.tickets = [];
		this.hutTickets = [];
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
		this.hutTickets = [];
		if (this.hutNr.length === 3) {
			try {
				clearTimeout(this.typingTimer);
				this.typingTimer = setTimeout(() => {
					this.searchHut();
				}, 500);
			} catch (e) {
				console.log(e);
			}
		}
	}

	searchHut() {
		this.loginError = false;
		this.notLoggedIn = false;
		let self = this;
		self.error = '';
		self.loading = true;
		console.log('searching: ' + this.hutNr);
		var wp = this.getWpApi('hut');
		wp.handler().param('hutnr', this.hutNr).then((result) => {
			console.log(result);
			if (result.code === 200) {
				self.hutTickets = result.tickets;
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

	searchChild() {
		try {
			clearTimeout(this.typingTimer);
			this.typingTimer = setTimeout(() => {
				this.searchThisChild();
			}, 500);
		} catch (e) {
			console.log(e);
		}
	}

	searchThisChild() {
		let self = this;
		self.tickets = [];
		self.searchError = '';
		self.loading = true;
		console.log('searching: ' + this.searchTerm);
		var wp = this.getWpApi('search');
		wp.handler().param('search', this.searchTerm).then((result) => {
			console.log(result);
			if (result.code === 200) {
				self.tickets = result.tickets;
				if (self.tickets.length === 0) {
					self.searchError = 'Geen resultaten';
				}
				self.loading = false;
			} else {
				self.searchError = result.message;
				self.loading = false;
			}
		}).catch((error) => {
			self.searchError = error.message;
			self.loading = false;
		});
	}

	toLogin() {
		this.navCtrl.setRoot(LoginPage);
	}

	addChildToHut(child) {
		let self = this;
		var wp = this.getWpApi('hut-add');
		wp.handler().param('hutnr', this.hutNr).param('wristband', child.meta.wristband).then((result) => {
			console.log(result);
			if (result.code === 200) {
				setTimeout(function () {
					self.search();
				}, 250);
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

	removeChildFromHut(child) {
		let self = this;
		var wp = this.getWpApi('hut-remove');
		wp.handler().param('hutnr', this.hutNr).param('wristband', child.meta.wristband).then((result) => {
			console.log(result);
			if (result.code === 200) {
				this.closeRemoveModal();
				setTimeout(function () {
					self.search();
				}, 250);
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

	closeAddModal() {
		this.addModal.show = false;
		setTimeout(function () {
			document.querySelector('#myModal').classList.remove('high');
		}, 400);
	}

	showAddModal() {
		this.tickets = [];
		this.addModal.show = true;
		this.searchTerm = '';
		document.querySelector('#myModal').classList.add('high');
	}

	showRemoveModal() {
		console.log(this.removeChild);
		this.removeModal.show = true;
		this.searchTerm = '';
		document.querySelector('#removeModal').classList.add('high');
	}

	closeRemoveModal() {
		this.removeModal.show = false;
		setTimeout(function () {
			document.querySelector('#removeModal').classList.remove('high');
		}, 400);
	}

	goHome() {
		this.navCtrl.setRoot(HomePage);
	}
}
