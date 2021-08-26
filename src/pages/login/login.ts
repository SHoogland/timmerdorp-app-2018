import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { GlobalFunctions } from '../../providers/global';

import Parse from 'parse';
import { EmailConfirmationPage } from '../email-confirmation/email-confirmation';

@Component({
	selector: 'loginpage',
	templateUrl: 'login.html'
})

export class LoginPage {
	errorHelp: string;
	number: string;
	error: string;

	login: {
		username: string,
		password: string
	};

	register: {
		username: string,
		password: string,
    voornaam: string,
    achternaam: string,
    wijk: string
	};

	hideLogin: boolean;
	loading: boolean;
  loginPart: boolean;

	constructor(
		public navCtrl: NavController,
    public navParams: NavParams,
		public storage: Storage,
		public g: GlobalFunctions,
	) {
		this.init();
	}

	init() {
    this.login = {
      username: '',
      password: '',
    }

    this.register = {
      username: '',
      password: '',
      voornaam: '',
      achternaam: '',
      wijk: ''
    }

    this.loginPart = !!this.navParams.get('login')
		this.hideLogin = true;

		this.loading = false;
		this.error = '';

		this.number = '';

		this.storage.get('notFirstUse').then((val) => {
			this.hideLogin = !val;
		}, () => {
			this.hideLogin = true;
		});
	}

	async loginNow(surpressWarnings) {
    if(this.login.username === 'test123' && this.login.password === 'test123') {
      this.g.staging = !this.g.staging;
      alert('Gelukt! Testversie is nu ' + (this.g.staging ? 'ingeschakeld' : 'uitgeschakeld'))
      return;
    }

    let self = this;
    if (!self.login.username || !self.login.password) {
      if(!surpressWarnings) {
        self.error = 'Inloggen mislukt!'
        self.errorHelp = 'Een gebruikersnaam en wachtwoord zijn vereist'
      }
      return
    }
    self.error = ''
    self.errorHelp = ''
    self.loading = true;

    await this.g.fixParseURL();

    await Parse.User.logIn(self.login.username.toLowerCase().replace(' ', ''), self.login.password).catch(
      error => {
        let readableErrors = {
          'Invalid username/password.': 'Verkeerde gebruikersnaam of wachtwoord.',
          'password is required.': 'Om in te loggen is een wachtwoord vereist!',
        }
        self.error = 'Inloggen mislukt'
        self.errorHelp = readableErrors[error.message] || error.message
        self.loading = false
      }
    ).then(function (user) {
      if (user) {
        self.g.goHome();
      }
      self.loading = false
    })
	}

  registerNow(surpressWarnings) {
    if(this.register.username === 'test123' && this.register.password === 'test123') {
      this.g.staging = !this.g.staging;
      alert('Gelukt! Testversie is nu ' + (this.g.staging ? 'ingeschakeld' : 'uitgeschakeld'))
      return;
    }

    let self = this;
    if (!self.register.username || !self.register.password) {
      if(!surpressWarnings) {
        self.error = 'Registreren mislukt!'
        self.errorHelp = 'Een gebruikersnaam en wachtwoord zijn vereist'
      }
      return
    }
    self.loading = true
    this.g.apiCall('registreren', {
      username: this.register.username,
      password: this.register.password,
      email: this.register.username,
      firstName: this.register.voornaam,
      lastName: this.register.achternaam,
      fromApp: true,
      domain: this.g.staging ? 'http://localhost:3000' : 'shop.timmerdorp.com'
    }, true).catch((e) => {
      self.error = 'Registreren mislukt!'
      if(e.message === 'Account already exists for this username.') {
        self.errorHelp = 'Er bestaat al een account met dit e-mailadres! Accounts van vorig jaar zijn nog steeds geldig. Probeer in te loggen.'
      }
      self.loading = false
    })
    .then(async function(result) {
      if(result === 'success') {
        await Parse.User.logIn(self.register.username.toLowerCase().replace(' ', ''), self.register.password)
        self.navCtrl.setRoot(EmailConfirmationPage, { waitingForEmailConfirmation: true, email: self.register.username.toLowerCase().replace(' ', '') }, { animate: true, animation: "ios-transition", direction: 'forward' })
      }
      self.loading = false
    })
  }

  logInInput(event) {
    if(event.code === 'Enter') this.loginNow(true)
  }

  regInput(event) {
    if(event.code === 'Enter') this.registerNow(true)
  }

	showLogin() {
		this.hideLogin = false;
		this.storage.set('notFirstUse', true);
	}
}
