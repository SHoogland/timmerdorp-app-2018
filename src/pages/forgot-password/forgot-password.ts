import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalFunctions } from '../../providers/global';

import Parse from 'parse';
import { LoginPage } from '../login/login';

@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html'
})

export class ForgotPasswordPage {
  receivedEmail: string;
  receivedCode: string;
  password: string;
  email: string;

  chooseNewPassword: boolean;
  success: boolean;
  loading: boolean;
  sent: boolean;

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
    this.email = this.navParams.get('email') || '';

    if (this.navParams.get('forgotEmail') && this.navParams.get('forgotEmailCode')) {
      this.chooseNewPassword = true
      this.receivedCode = atob(this.navParams.get('forgotEmailCode'))
      this.receivedEmail = atob(this.navParams.get('forgotEmail'))
    }
  }

  async sendRequest() {
    let email = this.email.replace(' ', '').toLowerCase()
    let emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (!emailRegex.test(email)) {
      alert('E-mailadres ongeldig')
      return
    }

    this.loading = true;

    let response = await Parse.Cloud.run('forgotPassword', {
      email: email,
      domain: 'https://shop.timmerdorp.com/app'
    })

    this.loading = false

    if (response == 'success') {
      this.sent = true
    }
  }

  goBack() {
    this.navCtrl.setRoot(LoginPage, { login: true }, { animate: true, animation: "ios-transition", direction: 'back' })
  }

  async saveNewPassword() {
    if (!this.password) return

    this.loading = true

    let result = await Parse.Cloud.run('changePassword', {
      resetCode: this.receivedCode,
      resetEmail: this.receivedEmail,
      newPass: this.password,
    })

    if (result === 'success') {
      await Parse.User.logIn(this.receivedEmail, this.password)
      this.success = true
    } else alert(result)

    this.loading = false
  }
}
