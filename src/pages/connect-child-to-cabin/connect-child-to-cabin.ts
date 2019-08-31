import { Component, ChangeDetectorRef } from '@angular/core';
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
	isTue: boolean;//if it's tuesday, show the auto-presence toggle
	hutNr: string;
	searchTerm: string;
	error: string;
	selectedChild: any;
	loginError: boolean;
	notLoggedIn: boolean;
	searchError: string;
	endpoint: string;
	loading: boolean;
	tickets: Array<any>;
	hutTickets: Array<any>;
	autoPresence: boolean;
	removeChild: any;
	searched: boolean;
	addModal: {
		show: boolean;
	}
	warningModal: {
		show: boolean;
	}
	removeModal: {
		show: boolean;
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
		private cd: ChangeDetectorRef
	) {
		this.endpoint = 'https://shop.timmerdorp.com/wp-json';
		this.init();
	}

	init() {
		this.login = {
			username: '',
			password: ''
		}
		this.autoPresence = true;
		this.loginError = false;
		this.notLoggedIn = false;
		this.loading = false;
		this.error = '';
		this.isTue = new Date().getDay() == 2;
		this.searchError = '';
		this.addModal = {
			show: false
		}
		this.warningModal = {
			show: false
		}
		this.removeModal = {
			show: false
		}
		this.tickets = [];
		this.hutTickets = [];
		this.searched = false;

		//ik heb oprecht geen idee waarom dit werkt,
		//maar zonder deze drie regels hieronder werkt
		//de 'removeModal' niet.
		//??????
		setInterval(function () {
			console.log((this.removeModal || {}).show);
		}, 250);
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

	search() {
		this.searched = false;
		this.hutTickets = [];
		if (this.hutNr.length === 3) {
			try {
				clearTimeout(this.typingTimer);
				this.typingTimer = setTimeout(() => {
					this.searchHut();
				}, 200);
			} catch (e) {
				console.log(e);
			}
		}
	}

	searchHut() {
		console.log('searching: ' + this.hutNr);
		this.loginError = false;
		this.notLoggedIn = false;
		this.loading = true;
		this.error = '';
		this.cd.detectChanges();
		let self = this;
		var wp = this.getWpApi('hut');
		wp.handler().param('hutnr', this.hutNr).then((result) => {
			console.log(result);
			if (result.code === 200) {
				self.hutTickets = result.tickets;
				self.loading = false;
				self.cd.detectChanges();
				self.searched = true;
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
			}, 200);
		} catch (e) {
			console.log(e);
		}
	}

	searchThisChild() {
		let self = this;
		self.tickets = [];
		self.searchError = '';
		if (this.searchTerm.length < 3) return;
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
		this.navCtrl.setRoot(LoginPage, {}, { animate: true, direction: 'forward' });
	}

	addChildToHut(child) {
		this.selectedChild = child;
		console.log(child.meta.hutnr);
		if (child.meta.hutnr) {
			this.showWarningModal();
		} else {
			this.reallyAddChildNow();
		}
	}

	reallyAddChildNow() {
		let child = this.selectedChild;
		let self = this;
		this.closeWarningModal();
		this.closeAddModal();
		if (this.autoPresence && new Date().getDay() == 0) {
			var wp = this.getWpApi('presence');
			wp.handler().param('wristband', child.meta.wristband).param('day', "tue").param("presence", true).then((result) => {
				console.log("kind aanwezig gemeld vandaag");
			}).catch((error) => {
				self.error = error.message;
				self.loading = false;
				console.log(error);
				console.log("at least we tried");
			});
		} else {
			this.addChildPart2(child);
		}
	}

	addChildPart2(child) {
		let self = this;
		var wp = this.getWpApi('hut-add');
		wp.handler().param('hutnr', this.hutNr).param('wristband', child.meta.wristband).then((result) => {
			console.log(result);
			if (result.code === 200) {
				setTimeout(function () {
					self.search();
				}, 500);
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

	showAddModal() {
		this.tickets = [];
		this.loading = false;
		this.addModal.show = true;
		this.searchTerm = '';
		document.querySelector('#myModal').classList.add('high');
	}
	
	closeAddModal() {
		console.log("what?");
		let self = this;
		this.addModal.show = false;
		setTimeout(function () {
			document.querySelector('#myModal').classList.remove('high');
			self.searchError = '';
			self.error = '';
		}, 400);
	}

	showRemoveModal() {
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
	
	showWarningModal() {
		this.warningModal.show = true;
		this.searchTerm = '';
		document.querySelector('#warningModal').classList.add('high');
	}
	
	closeWarningModal() {
		this.warningModal.show = false;
		setTimeout(function () {
			document.querySelector('#warningModal').classList.remove('high');
		}, 400);
	}

	goHome() {
		this.navCtrl.setRoot(HomePage, {}, { animate: true, direction: 'back' });
	}
}
