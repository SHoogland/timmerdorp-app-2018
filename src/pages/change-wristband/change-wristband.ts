import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as WPAPI from 'wpapi';

import { HttpClient } from '@angular/common/http';

import { HomePage } from '../home/home';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';
import { GlobalFunctions } from '../../providers/global';


@Component({
	selector: 'page-changeWristband',
	templateUrl: 'change-wristband.html'
})
export class ChangeWristbandPage {
	inputField: any;
	history: any;
	ticket: any;

	searchedTerm: string;
	errorHelp: string;
	oldNr: string;
	newNr: string;
	error: string;

	searched: boolean;
	staging: boolean;
	loading: boolean;

	login: {
		username: string,
		password: string
	};

	constructor(
		public navCtrl: NavController,
		public httpClient: HttpClient,
		public storage: Storage,
		public cd: ChangeDetectorRef,
		public g: GlobalFunctions
	) {
	}

	searchTicket() {
		let self = this;
		this.ticket = {};
		if (this.oldNr.length < 3) {
			this.cd.detectChanges();
			console.log("Cancelling search. Reason: term too short");
			return false;
		}
		this.error = '';
		this.ticket = {};
		this.searched = false;
		this.loading = true;
		this.searchedTerm = this.oldNr;
		console.log('searching: ' + this.oldNr);
		var wp = this.g.getWpApi(this.login, this.staging, 'search');
		wp.handler().param('search', this.oldNr).then((result) => {
			let t = result.tickets;
			t = t.filter(function (a) {
				return a.meta.wristband[0] == self.oldNr;
			});
			if (!t.length) {
				self.error = 'Geen resultaten'
				self.errorHelp = 'Je kunt alleen zoeken op (het oude) polsbandnummer.';
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
				self.ticket.hutnr = (self.ticket.meta.hutnr || [])[0];
				self.ticket.birthDate = (self.ticket.meta['fooevents_custom_geboortedatum_(dd-mm-jjjj)'] || [])[0];
				self.loading = false;
				self.searched = true;
				self.cd.detectChanges();
				setTimeout(function () {
					if (document.getElementById("secondInput")) {
						let el = document.getElementById("secondInput").getElementsByTagName("input")[0];
						console.log(el);
						el.focus();
					}
				}, 250);
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

	valueChanged() {
		if (this.searched) {
			this.searched = false;
			this.loading = false;
			this.ticket = {}
		}
	}

	ionViewDidLoad() {
		this.login = {
			username: '',
			password: ''
		}
		this.searched = false;
		this.staging = false;
		this.loading = false;
		this.loading = false;
		this.ticket = {};
		this.error = "";
		this.oldNr = "";
		this.newNr = "";
		Promise.all([
			this.storage.get('editHistory').then((val) => {
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
			let self = this;
			setInterval(function () {
				self.newNr;
			}, 200);
		});
	}

	saveNr() {
		this.error = '';
		this.loading = true;
		let self = this;
		var wp = this.g.getWpApi(this.login, this.staging, 'add-wristband');
		console.log(this.ticket);

		wp.handler().param('barcode', this.ticket.barcode).param('wristband', this.newNr).then((result) => {
			console.log(result);
			if (result.code === 200) {
				let t = self.ticket;
				let m = t.meta;
				self.history.unshift({
					name: m.WooCommerceEventsAttendeeName[0] + " " + m.WooCommerceEventsAttendeeLastName[0],
					oldNr: m.wristband,
					newNr: self.newNr,
					hutnr: m.hutnr
				});
				console.log(self.history);
				self.storage.set("editHistory", self.history);
				self.g.goHome();
			} else {
				if (result.message == 'wristband already exists') {
					self.error = 'Polsbandje bestaat al';
					self.errorHelp = 'Ieder polsbandnummer mag maar één keer voorkomen.';
				} else {
					self.error = result.message;
				}
				console.log(result.message);
				self.loading = false;
			}
		}).catch((error) => {
			console.log(error);
			alert("foutmelding! " + error);
			this.loading = false;
		});
	}
}
