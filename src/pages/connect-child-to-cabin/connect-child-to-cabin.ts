import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import * as WPAPI from 'wpapi';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';
import { HomePage } from '../home/home';
import { GlobalFunctions } from '../../providers/global';

declare let cordova: any;

@Component({
	selector: 'page-connect-child-to-cabin',
	templateUrl: 'connect-child-to-cabin.html',
})
export class ConnectChildToCabinPage {
	searchError: string;
	searchTerm: string;
	errorHelp: string;
	title: string;
	hutNr: string;
	error: string;

	undoingInterval: any;
	selectedChild: any;
	removedChild: any;
	typingTimer: any;
	nieuwHutje: any;
	tempHutNr: any;
	undoItem: any;
	history: any;

	hutTickets: Array<any>;
	tickets: Array<any>;

	allowAutoPresence: boolean;
	undoingIsDone: boolean;
	autoPresence: boolean;
	notLoggedIn: boolean;
	giveAccent: boolean;
	isUndoing: boolean;
	searched: boolean;
	loading: boolean;
	staging: boolean;
	error1: boolean;
	error2: boolean;
	isTue: boolean; //if it's tuesday, show the auto-presence toggle

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
		private cd: ChangeDetectorRef,
		public g: GlobalFunctions
	) {
		if (this.platform.is('cordova') && cordova.platformId === 'android') {
			this.platform.registerBackButtonAction(() => {
				if (this.addModal.show) {
					this.addModal.show = false;
				} else if (this.removeModal.show) {
					this.removeModal.show = false;
				} else if (this.warningModal.show) {
					this.warningModal.show = false;
				} else {
					this.navCtrl.setRoot(HomePage, {}, { animate: true, animation: "ios-transition", direction: "back" });
				}
			});
		}
		this.init();
	}

	init() {
		this.login = {
			username: '',
			password: ''
		}
		this.title = 'Beheer Hutjes';
		this.isTue = (new Date().getDay() == 2);


		this.allowAutoPresence = false;
		this.undoingIsDone = false;
		this.autoPresence = false;
		this.notLoggedIn = false;
		this.giveAccent = false;
		this.isUndoing = false;
		this.searched = false;
		this.staging = false;
		this.loading = false;
		this.error1 = false;
		this.error2 = false;

		this.searchError = '';
		this.error = '';
		this.errorHelp = '';

		this.warningModal = {
			show: false
		}
		this.removeModal = {
			show: false
		}
		this.addModal = {
			show: false
		}

		this.hutTickets = [];
		this.tickets = [];

		setInterval(function () {
			console.log((this.removeModal || {}).show); //hierdoor werkt de removeModal (ionic gedoe)
		}, 250);
	}

	ionViewDidLoad() {
		this.init();

		Promise.all([
			this.storage.get('cabinAddHistory').then((val) => {
				this.history = val || [];
				console.log(this.history);
			}, (error) => {
				this.history = [];
			}),
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
				this.staging = val;
			}, (error) => {
				this.staging = false;
			})
		]).then(() => {
		});
	}

	getBg(hutnr) {
		let res = '#000';
		let a = (hutnr + "")[0];

		switch (a) {
			case '0':
				res = '#ffc800';
				break;
			case '1':
				res = '#f44336';
				break;
			case '2':
				res = '#2196F3';
				break;
			case '3':
				res = '#9ae263';
				break;
			default:
				res = '#000';
		}
		return res;
	}

	undo(i) {
		this.undoItem = i + 1;
		let self = this;
		this.undoingInterval = setInterval(function () {
			if (!self.loading) {
				console.log(self.undoItem);
				if (document.getElementById(self.undoItem)) {
					document.getElementById(self.undoItem).classList.add("done");
				}
				self.undoingIsDone = true;
				clearInterval(self.undoingInterval);

				setTimeout(function () {
					self.undoingIsDone = false;
					if (document.getElementById(self.undoItem)) {
						document.getElementById(self.undoItem).classList.remove("done");
					}
				}, 1500);
			}
		}, 200);
	}

	search() {
		this.searched = false;
		this.hutTickets = [];
		if (this.hutNr && this.hutNr.length === 3) {
			try {
				clearTimeout(this.typingTimer);
				this.typingTimer = setTimeout(() => {
					this.searchHut();
				}, 200);
			} catch (e) {
				console.log(e);
			}
		} else {
			this.error = '';
		}
	}

	searchHut() {
		console.log('searching: ' + this.hutNr);
		if (isNaN(+this.hutNr) || +this.hutNr >= 400 || +this.hutNr < 0) {
			this.error = 'Foutmelding';
			this.errorHelp = 'Hutnummer moet tussen 0 en 399 zijn.';
			this.cd.detectChanges();
			return;
		}
		this.loading = true;
		this.error = '';
		this.cd.detectChanges();
		let self = this;
		var wp = this.g.getWpApi(this.login, this.staging, 'hut');
		wp.handler().param('hutnr', this.hutNr).then((result) => {
			console.log(result);
			if (result.code === 200) {
				result.tickets.sort(function (a, b) {
					let nra = ((a || {}).meta || {}).wristband || Infinity;
					let nrb = ((b || {}).meta || {}).wristband || Infinity;
					return nra - nrb;
				})
				self.hutTickets = result.tickets;
				self.loading = false;
				self.cd.detectChanges();
				self.searched = true;
			} else {
				if (result.message == 'access denied') {
					this.error = 'Niet ingelogd';
					this.errorHelp = 'Je moet eerst <a (click)="g.toLogin()">inloggen</a>.';
				} else {
					self.error = result.message;
					self.loading = false;
				}
			}
		}).catch((error) => {
			if (error.code === 'invalid_username' || error.code === 'incorrect_password') {
				this.error = 'Inloggegevens onjuist';
				this.errorHelp = 'Wijzig eerst je inloggegevens <a (click)="g.toLogin()">hier</a>.';
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
		if (this.searchTerm.length < 3) {
			return;
		}
		self.loading = true;
		console.log('searching: ' + this.searchTerm);
		var wp = this.g.getWpApi(this.login, this.staging, 'search');
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

	addChildToHut(child) {
		this.selectedChild = child;
		if ((child.meta.hutnr || [])[0]) {
			this.error1 = true;
			this.error2 = false;
			this.showWarningModal();
		} else if (!(child.meta.wristband || [])[0]) {
			this.error1 = false;
			this.error2 = true;
			this.showWarningModal();
		} else {
			this.reallyAddChildNow();
		}
	}

	reallyAddChildNow() {
		let child = this.selectedChild;
		console.log(child);
		let self = this;
		this.loading = true;
		this.nieuwHutje = this.hutNr;
		this.tempHutNr = typeof this.tempHutNr === 'object' && this.tempHutNr !== null ? this.tempHutNr[0] : this.tempHutNr;
		if (typeof this.tempHutNr == 'string') this.nieuwHutje = this.tempHutNr;
		this.nieuwHutje = typeof this.nieuwHutje === 'object' ? this.nieuwHutje[0] : this.nieuwHutje;
		this.closeWarningModal();
		console.log(this.nieuwHutje);
		this.closeAddModal();
		this.isUndoing = false;
		this.tempHutNr = null;
		if (this.autoPresence && !this.isUndoing && new Date().getDay() == 2) {
			var wp = this.g.getWpApi(this.login, this.staging, 'presence');
			wp.handler().param('wristband', child.meta.wristband).param('day', "tue").param("presence", true).then((result) => {
				console.log("kind aanwezig gemeld vandaag");
				this.addChildPart2(child);
			}).catch((error) => {
				self.error = error.message;
				self.loading = false;
				console.log(error);
				console.log("at least we tried");
				this.addChildPart2(child);
			});
		} else {
			this.addChildPart2(child);
		}
	}


	addChildPart2(child) {
		let self = this;
		var wp = this.g.getWpApi(this.login, this.staging, 'hut-add');
		console.log(this.nieuwHutje);
		if (!this.nieuwHutje) {
			this.removeChildFromHut(child);
			return;
		}
		wp.handler().param('hutnr', this.nieuwHutje).param('wristband', child.meta.wristband).then((result) => {
			console.log(result);
			let t = self.selectedChild;
			let m = t.meta;
			self.history.unshift({
				name: m.WooCommerceEventsAttendeeName[0] + " " + m.WooCommerceEventsAttendeeLastName[0],
				wristband: m.wristband,
				oldNr: m.hutnr,
				hutnr: self.nieuwHutje,
				wijk: self.g.getColor(self.nieuwHutje),
				ticket: self.updateT(t)
			});

			self.storage.set("cabinAddHistory", self.history);

			self.giveAccent = true;

			setTimeout(function () {
				self.giveAccent = false;
			}, 1500);

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

	updateT(ticket) {
		ticket.meta.hutnr = ["" + this.nieuwHutje];
		return ticket;
	}

	updateT2(t) {
		t.meta.hutnr = [""];
		return t;
	}


	removeChildFromHut(child) {
		let self = this;
		var wp = this.g.getWpApi(this.login, this.staging, 'hut-remove');
		this.removedChild = child;
		wp.handler().param('hutnr', child.meta.hutnr).param('wristband', child.meta.wristband).then((result) => {
			console.log(result);
			if (result.code === 200) {
				self.closeRemoveModal();
				let t = self.removedChild;
				let m = t.meta;

				let newItem = {
					name: m.WooCommerceEventsAttendeeName[0] + " " + m.WooCommerceEventsAttendeeLastName[0],
					wristband: m.wristband,
					oldNr: m.hutnr,
					ticket: self.updateT2(t),
					removal: true
				};
				self.history.unshift(newItem);


				self.storage.set("cabinAddHistory", self.history);

				setTimeout(function () {
					self.search();
				}, 250);
				self.loading = false;
				self.removedChild = null;
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
}
