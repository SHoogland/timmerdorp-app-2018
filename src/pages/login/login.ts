import { Component, ChangeDetectorRef } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { HomePage } from '../home/home';
import { GlobalFunctions } from '../../providers/global';

@Component({
	selector: 'loginpage',
	templateUrl: 'login.html'
})

export class LoginPage {
	errorHelp: string;
	number: string;
	error: string;
	title: string;
	name: string;
	day: string;

	login: {
		username: string,
		password: string
	};

	hideLogin: boolean;
	success: boolean;
	loading: boolean;

	result: string;

	clickedOnce = false;
	clickedTwice = false;
	staging = false;

	constructor(
		public navCtrl: NavController,
		public platform: Platform,
		public storage: Storage,
		public g: GlobalFunctions,
		private cd: ChangeDetectorRef
	) {
		this.init();
	}

	init() {
		let parse = this.g.parse;
		let user = parse.User.current()

		this.title = 'Login';
		this.hideLogin = true;
		this.success = false;

		this.login = {
			username: '',
			password: ''
		}
		this.loading = false;
		this.error = '';

		this.number = '';
		this.name = '';

		this.storage.get('notFirstUse').then((val) => {
			this.hideLogin = !val;
		}, () => {
			this.hideLogin = true;
		});

		this.storage.get('staging').then((val) => {
			this.staging = val;
		}, () => {
			this.staging = false;
		});
	}

	loginNow() {
		let parse = this.g.parse;
		parse.User.logIn(this.login.username, this.login.password).then((e) => {
			console.log(e, 'result')
			this.toHome()
		}).catch(e => {
			this.error = e.message;
			this.cd.detectChanges();
		});
	}

	toHome() {
		this.navCtrl.setRoot(HomePage, {}, this.g.backwardsNavigationSettings);
	}

	switchEnv() {
		const _this = this;
		setTimeout(function () {
			_this.clickedOnce = false;
			_this.clickedTwice = false;
		}, 1000)
		if (this.clickedTwice) {
			if (!this.staging) {
				this.storage.set('staging', true);
				this.staging = true;
			} else {
				this.storage.set('staging', false);
				this.staging = false;
			}
			this.clickedOnce = false;
			this.clickedTwice = false;
		}
		if (this.clickedOnce) {
			this.clickedTwice = true;
		}
		this.clickedOnce = true;
		this.cd.detectChanges();
	}

	showLogin() {
		this.hideLogin = false;
		this.storage.set('notFirstUse', true);
	}

	belStan() {
		window.location.href = 'tel:0640516654'
	}
}
