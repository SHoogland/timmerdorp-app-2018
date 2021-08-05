import { Component, ChangeDetectorRef } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HomePage } from '../home/home';
import { GlobalFunctions } from '../../providers/global';

import Parse from 'parse';

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
		// let install = new Parse.Installation();

		// install.save({deviceType: 'ionic'}, {
		// 	success: (install) => {
		// 		// Execute any logic that should take place after the object is saved.
		// 		this.result = 'New object created with objectId: ' + install.id;
		// 	},
		// 	error: (install, error) => {
		// 		// Execute any logic that should take place if the save fails.
		// 		// error is a Parse.Error with an error code and message.
		// 		this.result = ('Failed to create new object, with error code:' + error.message.toString());
		// 	}
		// });

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

		this.storage.get('username').then((val) => {
			this.login.username = val;
		}, () => {
			this.login.username = '';
		});

		this.storage.get('password').then((val) => {
			this.login.password = val;
		}, () => {
			this.login.password = '';
		});

		this.storage.get('staging').then((val) => {
			this.staging = val;
		}, () => {
			this.staging = false;
		});
	}

	loginNow() {
		this.storage.set('username', this.login.username);
		this.storage.set('password', this.login.password);

		this.g.checkLogin(this);
	}

	toHome() {
		this.navCtrl.setRoot(HomePage, {}, { animate: true, animation: 'ios-transition', direction: 'back' });
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
        this.g.staging = true;
			} else {
				this.storage.set('staging', false);
				this.staging = false;
        this.g.staging = false;
			}
			this.clickedOnce = false;
			this.clickedTwice = false;
      this.g.initParse();
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
