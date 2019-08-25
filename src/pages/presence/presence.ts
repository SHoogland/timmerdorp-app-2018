import { Component, ChangeDetectorRef } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';
import * as WPAPI from 'wpapi';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';
import { HomePage } from '../home/home';

@Component({
	selector: 'page-presence',
	templateUrl: 'presence.html'
})
export class PresencePage {
	error: string;
	endpoint: string;
	loading: boolean;
	greenBtn: boolean;
	day: string;
	loginError: boolean;
	notLoggedIn: boolean;
	login: {
		username: string,
		password: string
	};
	modalShown: boolean;
	tickets: Array<any>;

	number: string;
	name: string;

	constructor(
		public navCtrl: NavController,
		public platform: Platform,
		public storage: Storage,
		private cd: ChangeDetectorRef
	) {
		this.endpoint = 'https://shop.timmerdorp.com/wp-json';
		this.init();
	}

	init() {
		switch (new Date().getDay()) {
			case 2:
				this.day = "tue";
				break;
			case 3:
				this.day = 'wed';
				break;
			case 4:
				this.day = 'thu';
				break;
			case 5:
				this.day = 'fri';
				break;
			default:
				this.day = 'thu'; //sample day
		}
		this.modalShown = false;
		this.greenBtn = false;
		this.loginError = false;
		this.notLoggedIn = false;

		this.login = {
			username: '',
			password: ''
		}
		this.loading = false;
		this.error = '';
		this.tickets = [];

		this.number = '';
		this.name = '';
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

	getDayName(d) {
		if (d == 'tue') return "Dinsdag"
		if (d == 'wed') return "Woensdag"
		if (d == 'thu') return "Donderdag"
		if (d == 'fri') return "Vrijdag"
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

	getChild() {
		this.error = '';
		this.loginError = false;
		this.notLoggedIn = false;
		let self = this;
		if (this.number.length === 3) {
			this.loading = true;
			var wp = this.getWpApi('search');
			wp.handler().param('search', this.number).param('withouthut', '').then((result) => {
				console.log(result);
				if (result.code === 200) {
					self.error = '';
					result.tickets.filter(function (a) {
						if ((a.meta.wristband || [])[0] == self.number) {
							return false;
						}
						return true;
					});
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
		} else {
			this.loading = false;
			this.tickets = [];
		}
	}

	makeAbsent() {
		this.closeModal();
		if (this.number.length < 3) return;
		if (!this.tickets[0]) {
			this.error = 'Geen kind gevonden!';
			return;
		}

		let self = this;
		var wp = this.getWpApi('presence');
		wp.handler().param('wristband', this.number).param('day', this.day).param('presence', false).then((result) => {
			if (result.code === 200) {
				this.markDone();
				console.log("Child absence update successful for " + self.day, result)
				this.loading = false;
				this.error = '';
				self.loading = false;
			} else {
				self.error = result.message;
				self.loading = false;
			}
		}).catch((error) => {
			self.loading = false;
			console.log(error);
		});

	}

	togglePresence() {
		this.hideKeyboard();
		if (this.number.length < 3) return;
		if (!this.tickets[0]) {
			this.error = 'Geen kind gevonden!';
			return;
		}
		let self = this;
		self.loading = true;
		if (this.tickets[0].meta['present_' + this.day] + '' == 'undefined') {
			this.tickets[0].meta['present_' + this.day] = [false]
		}
		var pres = !(this.tickets[0].meta['present_' + this.day] || [])[0];
		console.log(pres);
		if (!pres) {
			console.log("warning user that child is already present");
			this.showModal();
			return;
		}
		var wp = this.getWpApi('presence');
		wp.handler().param('wristband', this.number).param('day', this.day).param('presence', pres).then((result) => {
			if (result.code === 200) {
				this.markDone();
				console.log("Child presence update successful for " + self.day, result)
				this.loading = false;
				this.error = '';
				self.loading = false;
			} else {
				self.error = result.message;
				self.loading = false;
			}
		}).catch((error) => {
			self.loading = false;
			console.log(error);
		});
	}

	showModal() {
		this.modalShown = true;
		document.querySelector('#myModal').classList.add('high');
	}

	closeModal() {
		this.modalShown = false;
		setTimeout(function () {
			document.querySelector('#myModal').classList.remove('high');
		}, 400);
	}


	markDone() {
		this.greenBtn = true;
		let self = this;
		document.getElementById("btnLabel").innerHTML = "Opgeslagen!";
		(<HTMLScriptElement>document.querySelector("#numberInput > input")).focus();
		self.number = '';
		setTimeout(function () {
			self.greenBtn = false;
			(<HTMLScriptElement>document.querySelector("#numberInput > input")).focus();
			document.getElementById("btnLabel").innerHTML = "Opslaan";
			self.cd.detectChanges();
		}, 1000);
	}

	hideKeyboard() {
		var field = document.createElement('input');
		field.setAttribute('type', 'text');
		document.body.appendChild(field);

		setTimeout(function () {
			field.focus();
			setTimeout(function () {
				field.setAttribute('style', 'display:none;');
				field.parentNode.removeChild(field);
			}, 50);
		}, 50);
	}

	toLogin() {
		this.navCtrl.setRoot(LoginPage, {}, { animate: true, direction: 'forward' });
	}

	goHome() {
		this.navCtrl.setRoot(HomePage, {}, { animate: true, direction: "back" });
	}
}
