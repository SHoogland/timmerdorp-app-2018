import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Storage } from '@ionic/storage';
import { HomePage } from '../home/home';
import { LoginPage } from '../login/login';
import { GlobalFunctions } from '../../providers/global';

@Component({
	selector: 'page-wijk',
	templateUrl: 'wijk.html'
})
export class WijkPage {
	statistieken: object;
	wijkstats: object;

	title: string;
	error: string;
	wijk: string;

	showSelection: boolean;
	notLoggedIn: boolean;
	loginError: boolean;
	loading: boolean;
	staging: boolean;

	wijkprops: any;
	allprops: any;

	login: {
		username: string;
		password: string;
	}

	constructor(
		public navCtrl: NavController,
		public storage: Storage,
		public g: GlobalFunctions
	) {
		this.init();
		this.showSelection = false;
		this.notLoggedIn = false;
		this.loading = false;
		this.error = '';

		this.wijkprops = [
			{
				title: "Totaal aantal kinderen in wijk",
				prop: "count"
			},
			{
				title: "Aanwezig dinsdag",
				prop: "presentTue"
			},
			{
				title: "Aanwezig woensdag",
				prop: "presentWed"
			},
			{
				title: "Aanwezig donderdag",
				prop: "presentThu"
			},
			{
				title: "Aanwezig vrijdag",
				prop: "presentFri"
			}
		];

		this.allprops = [
			{
				title: "Totaal aantal kinderen",
				prop: "count"
			},
			{
				title: "Aantal kinderen met hutnummer",
				prop: "haveHutnr"
			},
			{
				title: "Aantal kinderen met armbandje",
				prop: "haveWristband"
			},
			{
				title: "Aanwezig dinsdag",
				prop: "presentTue"
			},
			{
				title: "Aanwezig woensdag",
				prop: "presentWed"
			},
			{
				title: "Aanwezig donderdag",
				prop: "presentThu"
			},
			{
				title: "Aanwezig vrijdag",
				prop: "presentFri"
			}
		]
	}

	init() {
		this.login = {
			username: '',
			password: ''
		}

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
					this.g.setStatusBar(this.wijk);
				}
			}),

			this.storage.get('staging').then((val) => {
				this.staging = val;
			}, (error) => {
				this.staging = false;
			})
		]).then(() => {
			this.title = 'Wijkoverzicht ' + this.g.getWijkName(this.wijk);
			this.updateData();
		});
	}

	updateData() {
		this.loading = true;
		console.log(this.wijk);
		// var wp = this.g.getWpApi(this.login, this.staging, 'stats');
		// wp.handler().then((result) => {
		// 	console.log(result);
		// 	if (result.code === 200) {
		// 		this.loading = false;
		// 		this.statistieken = result;
		// 		console.log(result.quarters[this.wijk])
		// 		this.wijkstats = result.quarters[this.wijk];

		// 	} else {
		// 		if (result.message == 'access denied') {
		// 			this.notLoggedIn = true;
		// 		} else {
		// 			this.error = result.message;
		// 			this.loading = false;
		// 		}
		// 	}
		// }).catch((error) => {
		// 	if (error.code === 'invalid_username' || error.code === 'incorrect_password') {
		// 		this.loginError = true;
		// 	} else {
		// 		this.error = error.message;
		// 	}
		// 	this.loading = false;
		// });
	}

	kiesWijk(kleur) {
		this.g.setStatusBar(kleur);
		this.storage.set("wijk", kleur).then((val) => {
			this.showSelection = false;
			this.wijk = val;
			this.title = 'Wijkoverzicht ' + this.g.getWijkName(this.wijk);
			this.updateData();
		});
	}

	clearWijkSelection() {
		this.g.setStatusBar("#cccccc");
		this.wijkstats = {};
		this.storage.set("wijk", undefined).then((val) => {
			this.showSelection = true;
			this.wijk = undefined;
		});
	}
}
