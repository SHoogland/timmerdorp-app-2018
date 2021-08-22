import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalFunctions } from '../../providers/global';

import Parse from 'parse';

@Component({
	selector: 'email-confirmation',
	templateUrl: 'email-confirmation.html'
})

export class EmailConfirmationPage {
  emailadres: string;
	errorHelp: string;
	number: string;
	error: string;

  waitingForEmailConfirmation: boolean;
  isConfirmingEmail: boolean;
  waitingForAdmin: boolean;
	loading: boolean;

	constructor(
		public navCtrl: NavController,
    public navParams: NavParams,
		public g: GlobalFunctions,
	) {
		this.init();
	}

	async init() {
		this.loading = false;
    this.waitingForAdmin = false;
    this.waitingForEmailConfirmation = false;
		this.error = '';
    this.errorHelp = '';
    this.emailadres = '';
    this.isConfirmingEmail = false;

    await this.checkStatus();
	}

  async checkStatus() {
    this.loading = true;
    let logInStatus = await this.g.checkIfStillLoggedIn();
    if (!logInStatus.result) {
      this.g.toLogin();
    } else {
      this.emailadres = logInStatus.email;

      if(!logInStatus.emailConfirmed) {
        if(this.navParams.get('emailConfirmationCode')) {
          this.isConfirmingEmail = true;
        } else {
          this.loading = false;
          this.waitingForEmailConfirmation = true;
        }
      } else if (!logInStatus.admin) {
        this.loading = false;
        this.waitingForAdmin = true;
      } else {
        this.g.goHome();
      }
    }
  }

  async logOut() {
    let self = this
    await Parse.User.logOut()
    self.g.toLogin()
  }

	belStan() {
		window.location.href = 'tel:0640516654'
	}
}
