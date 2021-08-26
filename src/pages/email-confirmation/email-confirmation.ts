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
  wentToLogin: boolean;
  loading: boolean;

  statusInterval: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public g: GlobalFunctions,
  ) {
    this.init();
  }

  async init() {
    this.loading = false;
    this.waitingForAdmin = this.navParams.get('waitingForAdmin') || false;
    this.waitingForEmailConfirmation = this.navParams.get('waitingForEmailConfirmation') || false;
    this.error = '';
    this.errorHelp = '';
    this.wentToLogin = false;
    this.emailadres = this.navParams.get('email') || '';
    this.isConfirmingEmail = false;

    await this.checkStatus(true);

    let self = this
    this.statusInterval = setInterval(function () {
      self.checkStatus()
    }, 1000)
  }

  async checkStatus(showLoading?) {
    if (this.navCtrl.getActive().component.name !== 'EmailConfirmationPage') {
      clearInterval(this.statusInterval)
      return
    }
    if (showLoading) this.loading = true;
    let logInStatus = await this.g.checkIfStillLoggedIn();
    if (!logInStatus.result) {
      if(!this.wentToLogin) {
        this.g.toLogin();
        this.wentToLogin = true;
      }
    } else {
      this.emailadres = logInStatus.email;

      if (!logInStatus.emailConfirmed) {
        if (this.navParams.get('emailConfirmationCode')) {
          this.isConfirmingEmail = true;
        } else {
          this.loading = false;
          this.waitingForEmailConfirmation = true;
          this.waitingForAdmin = false;
        }
      } else if (!logInStatus.admin) {
        this.loading = false;
        this.waitingForAdmin = true;
        this.waitingForEmailConfirmation = false;
      } else {
        this.g.goHome();
      }
    }
  }

  async logOut() {
    await Parse.User.logOut()
    if(!this.wentToLogin) this.g.toLogin();
    this.wentToLogin = true
  }

  belStan() {
    window.location.href = 'tel:0640516654'
  }
}