import { Component, ChangeDetectorRef } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
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
	loading: boolean;

	result: string;

	clickedOnce = false;
	clickedTwice = false;

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
    this.login = {
      username: '',
      password: '',
    }
		this.title = 'Login';
		this.hideLogin = true;

		this.loading = false;
		this.error = '';

		this.number = '';
		this.name = '';

		this.storage.get('notFirstUse').then((val) => {
			this.hideLogin = !val;
		}, () => {
			this.hideLogin = true;
		});
	}

	async loginNow() {
    let self = this;
    self.loading = true;
    if (!self.login.username || !self.login.password) {
      self.error = 'Inloggen mislukt!'
      self.errorHelp= 'Een gebruikersnaam en wachtwoord is vereist'
      return
    }

    await this.g.fixParseURL();

    await Parse.User.logIn(self.login.username.toLowerCase().replace(' ', ''), self.login.password).catch(
      error => {
        let readableErrors = {
          'Invalid username/password.': 'Verkeerde gebruikersnaam of wachtwoord.',
          'password is required.': 'Om in te loggen is een wachtwoord vereist!',
        }
        self.error = readableErrors[error.message] || error.message
        console.log(error)
      }
    ).then(function (user) {
      if (user) {
        self.g.goHome();
      }
      self.loading = false
    })
	}

	switchEnv() {
		const _this = this;
		setTimeout(function () {
			_this.clickedOnce = false;
			_this.clickedTwice = false;
		}, 1000)
		if (this.clickedTwice) {
      this.g.switchEnv()
			this.clickedOnce = false;
			this.clickedTwice = false;
		}
		if (this.clickedOnce) {
			this.clickedTwice = true;
		}
		this.clickedOnce = true;
		this.cd.detectChanges();
	}

  pwInput(event) {
    if(event.code === 'Enter') this.loginNow()
  }

	showLogin() {
		this.hideLogin = false;
		this.storage.set('notFirstUse', true);
	}

	belStan() {
		window.location.href = 'tel:0640516654'
	}
}
