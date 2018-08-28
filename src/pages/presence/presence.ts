import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import * as WPAPI from 'wpapi';
import { Storage } from '@ionic/storage';

@Component({
	selector: 'page-presence',
	templateUrl: 'presence.html',
})
export class PresencePage {
	error: string;
	endpoint: string;
	loading: boolean;
	login: {
		username: string,
		password: string
	};
	tickets: Array<any>;

	number: string;
	name: string;

	constructor(
		public platform: Platform,
		public storage: Storage
	) {
		if (this.platform.is('cordova')) {
			this.endpoint = 'https://shop.timmerdorp.com/wp-json';
		} else {
			this.endpoint = 'https://timmerdorp.test/wp-json';
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

	ionViewDidLoad() {
		let self = this;

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

	getChild() {
		let self = this;
		if (this.number.length === 3) {
			this.loading = true;
			var wp = this.getWpApi('search');
			wp.handler().param('search', this.number).then((result) => {
				console.log(result);
				if (result.code === 200) {
					self.tickets = result.tickets;
					if (self.tickets.length === 0) {
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
	}

	updatePresence(child) {
		let self = this;
		self.loading = true;
		var wp = this.getWpApi('wed-presence');
		wp.handler().param('wristband', this.number).then((result) => {
			if (result.code === 200) {
				this.init();
				self.loading = false;
			} else {
				self.error = result.message;
				self.loading = false;
			}
		}).catch((error) => {
		});
	}

}
