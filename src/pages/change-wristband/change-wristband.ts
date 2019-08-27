import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as WPAPI from 'wpapi';

import { HttpClient } from '@angular/common/http';

import { HomePage } from '../home/home';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';


@Component({
	selector: 'page-changeWristband',
	templateUrl: 'change-wristband.html'
})
export class ChangeWristbandPage {
	ticket: any;
	oldNr: string;
	newNr: string;
	endpoint: string;
	loading: boolean;
	notLoggedIn: boolean;
	loginError: boolean;
	error: string;
	searched: boolean;
	loading2: boolean;
	login: {
		username: string,
		password: string
	};

	constructor(
		public navCtrl: NavController,
		public httpClient: HttpClient,
		public storage: Storage
	) {
	}

	init() {
	}

	searchTicket(nr) {
		let self = this;

		self.ticket = {};
		console.log(this.oldNr);
		if (this.oldNr.length < 3) {
			console.log("Cancelling search. Reason: term too short");
			return false;
		}
		this.loginError = false;
		this.notLoggedIn = false;
		this.error = '';
		this.ticket = {};
		this.searched = false;
		this.loading2 = false;
		this.loading = true;
		console.log('searching: ' + this.oldNr);
		var wp = this.getWpApi('search');
		wp.handler().param('search', this.oldNr).then((result) => {
			console.log(result);
			let t = result.tickets;
			console.log(t, result);
			if(!t.length){
				self.error = 'Geen tickets gevonden :('
				self.loading = false;
				return;
			}
			t.filter(function (a) {
				return (a.meta || {}).wristband === self.oldNr;
			});
			self.ticket = t[0];
			if (result.code == 200) {
				self.ticket.barcode = (self.ticket.meta.WooCommerceEventsTicketID || [])[0];
				self.ticket.firstName = (self.ticket.meta.WooCommerceEventsAttendeeName || [])[0];
				self.ticket.lastName = (self.ticket.meta.WooCommerceEventsAttendeeLastName || [])[0];
				self.ticket.birthDate = (self.ticket.meta['fooevents_custom_geboortedatum_(dd-mm-jjjj)'] || [])[0];
				self.loading = false;
				self.searched = true;
				console.log(self.ticket);
			} else {
				if (result.message == 'access denied') {
					this.notLoggedIn = true;
					self.loading = false;
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

	toLogin() {
		this.navCtrl.setRoot(LoginPage, {}, { animate: true, direction: 'forward' });
	}

	ionViewDidLoad() {
		this.login = {
			username: '',
			password: ''
		}
		this.searched = false;
		this.ticket = {};
		this.loading = false;
		this.error = '';
		this.oldNr = "";
		this.newNr = "";
		this.loading2 = false;
		this.loginError = false;
		this.notLoggedIn = false;
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
			this.init();
		});
	}

	saveNr() {
		this.loading2 = true;
		let self = this;
		var wp = this.getWpApi('add-wristband');
		console.log(this.ticket);
		wp
			.handler()
			.param('barcode', this.ticket.barcode)
			.param('wristband', this.newNr)
			.then((result) => {
				console.log(result);
				if (result.code === 200) {
					self.goHome();
				} else {
					self.error = result.message;
					self.loading2 = false;
				}
			}).catch((error) => {
				console.log(error);
				alert("foutmelding! " + error);
				this.loading2 = false;
			});
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


	goHome() {
		this.navCtrl.setRoot(HomePage, {}, { animate: true, direction: 'back' });
	}
}