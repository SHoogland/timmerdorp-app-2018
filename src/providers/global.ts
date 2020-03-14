import { Injectable, Inject, forwardRef } from '@angular/core';
import { Platform, App } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import * as WPAPI from 'wpapi';
import { Storage } from '@ionic/storage';
import { HomePage } from '../pages/home/home';

@Injectable()
export class GlobalFunctions {
	stagingEndpoint: string;
	normalEndpoint: string;
	login: {
		username: string;
		password: string;
	}

	loginPage: any;

	constructor(
		public platform: Platform,
		public storage: Storage,
		public statusBar: StatusBar,
		public app: App,
	) {
		this.loginPage = require('../pages/login/login').LoginPage;
		this.login = {
			username: '',
			password: ''
		}

		this.stagingEndpoint = 'https://staging.timmerdorp.com/wp-json';
		this.normalEndpoint = 'https://shop.timmerdorp.com/wp-json';
	}

	setStatusBar(c) {
		if (this.platform.is('cordova')) {
			let colors = {
				blue: "#2196f3",
				red: "#ee0202",
				yellow: "#ffc800",
				green: "#43a047"
			}

			if (Object.keys(colors).indexOf(c) > -1) {
				c = colors[c];
			}

			if (cordova.platformId === 'android') {
				this.statusBar.backgroundColorByHexString(this.darkenColour(c, -50));
			} else if (cordova.platformId === 'ios') {
				this.statusBar.backgroundColorByHexString(c);
			}
		}
	}


	//geplukt van het internet
	darkenColour(color, amount) {
		return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
	}

	goHome() {
		let nav = this.app.getActiveNav();
		nav.setRoot(HomePage, {}, { animate: true, animation: "ios-transition", direction: "back" });
	}

	toLogin() {
		let nav = this.app.getActiveNav();
		nav.setRoot(this.loginPage, {}, { animate: true, animation: "ios-transition", direction: 'forward' });
	}

	getWpApi(login, staging, route) {
		var wp = new WPAPI({
			endpoint: staging ? this.stagingEndpoint : this.normalEndpoint,
			username: login.username,
			password: login.password
		});
		wp.handler = wp.registerRoute('tickets', route, {});
		return wp;
	}

	getWijkName(kleur) {
		if (kleur == 'blue') return 'Blauw';
		if (kleur == 'yellow') return 'Geel';
		if (kleur == 'red') return 'Rood';
		if (kleur == 'green') return 'Groen';
		return '';
	}

	getWijk(hutNr) {
		if (!hutNr) return '';
		if (typeof (hutNr) == 'object') {
			if (hutNr[0]) {
				hutNr = hutNr[0]
			} else {
				return;
			}
		}

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

	filterHistory(history) {
		let newHistory = [];
		let seenChildren = [];
		for (let i = 0; i < history.length; i++) {
			if (seenChildren.indexOf((history[i].wristband || [])[0]) == -1) {
				seenChildren.push((history[i].wristband || [])[0]);
				newHistory.push(history[i]);
			}
		}
		return newHistory;
	}

	getColor(w) {
		let res = '#222';
		console.log((w + "")[0])
		switch ((w + "")[0]) {
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
				res = '#222';
		}
		return res;
	}

	prependZero(n) {
		if (n < 10 && n > -10) {
			return (n < 0 ? '-' : '') + '0' + Math.abs(n);
		} else {
			return '' + n;
		}
	}
}