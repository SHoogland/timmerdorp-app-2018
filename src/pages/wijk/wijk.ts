import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as WPAPI from 'wpapi';

import { Storage } from '@ionic/storage';
import { HomePage } from '../home/home';
import { LoginPage } from '../login/login';

@Component({
	selector: 'page-wijk',
	templateUrl: 'wijk.html'
})
export class WijkPage {
	showSelection: boolean;

	statistieken: object;
	wijkstats: object;

	endpoint: string;
	error: string;
	wijk: string;

	notLoggedIn: boolean;
	loginError: boolean;
	loading: boolean;
	staging: boolean;

	login: {
		username: string;
		password: string;
	}

	constructor(
		public navCtrl: NavController,
		public storage: Storage
	) {
		this.showSelection = false;
		this.init();
		this.notLoggedIn = false;
		this.error = '';
		this.loading = false;
	}

	init() {
		this.login = {
			username: '',
			password: ''
		}

		this.endpoint = 'https://shop.timmerdorp.com/wp-json';
		this.wijk = '';
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
			this.storage.get('wijk').then((val) => {
				if (!val) {
					this.showSelection = true;
				} else {
					this.wijk = val;
				}
			}),

			this.storage.get('staging').then((val) => {
				this.staging = val;
				if (val) {
					this.endpoint = 'https://staging.timmerdorp.com/wp-json';
				} else {
					this.endpoint = 'https://shop.timmerdorp.com/wp-json';
				}
			}, (error) => {
				this.staging = false;
				this.endpoint = 'https://shop.timmerdorp.com/wp-json';
			})
		]).then(() => {
			this.updateData();
		});
	}

	updateData() {
		this.loading = true;
		console.log(this.wijk);
		var wp = this.getWpApi('stats');
		wp.handler().then((result) => {
			console.log(result);
			if (result.code === 200) {
				this.loading = false;
				this.statistieken = result;
				console.log(result.quarters[this.wijk])
				this.wijkstats = result.quarters[this.wijk];

			} else {
				if (result.message == 'access denied') {
					this.notLoggedIn = true;
				} else {
					this.error = result.message;
					this.loading = false;
				}
			}
		}).catch((error) => {
			if (error.code === 'invalid_username' || error.code === 'incorrect_password') {
				this.loginError = true;
			} else {
				this.error = error.message;
			}
			this.loading = false;
		});
	}


	toLogin() {
		this.navCtrl.setRoot(LoginPage, {}, { animate: true, animation: "ios-transition", direction: 'forward' });
	}

	goHome() {
		this.navCtrl.setRoot(HomePage, {}, { animate: true, animation: "ios-transition", direction: "back" });
	}


	kiesWijk(kleur) {
		this.storage.set("wijk", kleur).then((val) => {
			this.showSelection = false;
			this.wijk = val;
			this.updateData();
		});
	}

	clearWijkSelection() {
		this.wijkstats = {};
		this.storage.set("wijk", undefined).then((val) => {
			this.showSelection = true;
			this.wijk = undefined;
		});
	}

	getName(kleur) {
		if (kleur == 'blue') return 'Blauw';
		if (kleur == 'yellow') return 'Geel';
		if (kleur == 'red') return 'Rood';
		if (kleur == 'green') return 'Groen';
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
}
