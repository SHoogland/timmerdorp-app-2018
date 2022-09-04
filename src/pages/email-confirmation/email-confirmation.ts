import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalFunctions } from '../../providers/global';

import Parse from 'parse';

@Component({
  selector: 'email-confirmation',
  templateUrl: 'email-confirmation.html'
})

export class EmailConfirmationPage {
  emailVerificationResult: string;
  emailadres: string;
  errorHelp: string;
  number: string;
  error: string;

  waitingForEmailConfirmation: boolean;
  isConfirmingEmail: boolean;
  timmerdorpEnded: boolean;
  waitingForAdmin: boolean;
  moreOptions: boolean;
  wentToLogin: boolean;
  wentHome: boolean;
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
    this.g.setStatusBar('blue');
    this.loading = false;
    this.timmerdorpEnded = this.navParams.get('timmerdorpEnded') || false;
    this.waitingForAdmin = this.navParams.get('waitingForAdmin') || false;
    this.waitingForEmailConfirmation = this.navParams.get('waitingForEmailConfirmation') || false;
    this.error = '';
    this.errorHelp = '';
    this.wentToLogin = false;
    this.emailadres = this.navParams.get('email') || '';

    if (this.navParams.get('confirmationEmail') && this.navParams.get('confirmationCode')) {
      this.confirmEmail(this.navParams.get('confirmationEmail'), this.navParams.get('confirmationCode'))
    } else if(!this.timmerdorpEnded) {
      this.startStatusCheckInterval()
    }
  }

  async checkStatus(showLoading?, force?) {
    if (this.navCtrl.getActive().component.name !== 'EmailConfirmationPage') {
      clearInterval(this.statusInterval)
      return
    }
    if (showLoading) this.loading = true;
    if (this.isConfirmingEmail && !force) return
    this.isConfirmingEmail = false
    let logInStatus = await this.g.checkIfStillLoggedIn(true);
    if (!logInStatus || !logInStatus.result) {
      if (!this.wentToLogin) {
        this.g.toLogin();
        this.wentToLogin = true;
      }
    } else {
      this.emailadres = logInStatus.email;

      if (!logInStatus.emailConfirmed) {
        this.loading = false;
        this.waitingForEmailConfirmation = true;
        this.waitingForAdmin = false;
      } else if (!logInStatus.admin) {
        this.loading = false;
        this.waitingForAdmin = true;
        this.waitingForEmailConfirmation = false;
      } else {
        if (!this.wentHome) {
          this.g.goHome();
          this.wentHome = true
        }
      }
    }
  }

  async logOut() {
    await Parse.User.logOut()
    if (!this.wentToLogin) this.g.toLogin();
    this.wentToLogin = true
  }

  async confirmEmail(email, code) {
    this.isConfirmingEmail = true
    this.loading = true
    let realEmail;
    try {
      realEmail = atob(email)
    } catch (e) {
      alert('Ongeldige e-mail verificatie link!')
    }
    let realCode;
    try {
      realCode = atob(code)
    } catch (e) {
      alert('Ongeldige e-mail verificatie link!')
    }

    if (!realCode || !realEmail) {
      this.g.goHome()
      return
    }

    let result = await this.g.apiCall('emailVerificationAttempt', {
      email: realEmail,
      code: realCode
    }, true)

    if (result === 'not_signed_in') {
      this.g.toLogin()
    }

    this.loading = false
    if (result) {
      this.emailVerificationResult = result
      this.startStatusCheckInterval()
    }
  }

  belStan() {
    window.location.href = 'tel:0640516654'
  }

  async startStatusCheckInterval() {
    await this.checkStatus(true, true);
    let self = this
    this.statusInterval = setInterval(function () {
      self.checkStatus()
    }, 2000)
  }

  showMoreOptions() {
    this.moreOptions = true
  }
}
