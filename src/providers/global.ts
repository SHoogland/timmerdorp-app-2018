import { Injectable } from '@angular/core';
import { Platform, App } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Storage } from '@ionic/storage';
import { HomePage } from '../pages/home/home';
import Parse from 'parse';

declare let cordova: any;

@Injectable()
export class GlobalFunctions {
  stagingEndpoint: string;
  normalEndpoint: string;
  staging: boolean;
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
    console.log(this.staging)
    this.storage.get('staging').then((val) => {
      this.staging = val;
      this.initParse()
    }, (error) => {
      this.staging = false;
      this.initParse()
    })

    this.loginPage = require('../pages/login/login').LoginPage;
    this.login = {
      username: '',
      password: ''
    }

    // this.stagingEndpoint = 'https://staging.timmerdorp.com/wp-json';
    // this.normalEndpoint = 'https://api.timmerdorp.com/';
  }

  initParse() {
    if (!this.staging) {
      Parse.serverURL = 'https://api.timmerdorp.com/1/'
      Parse.initialize('knDC2JAquVJZ1jSPwARj53IhQCfpOPIDNKcgRMsD', 'xnFIbFCrE1vjzWbRVehMO4QzPpNMCIdDgORKNlRI')
    } else {
      Parse.serverURL = 'http://localhost:1337/1/'
      Parse.initialize('myAppId', 'jsKey')
    }
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

  apiCall(func, data) {
    console.log(func, data)
    return Parse.Cloud.run('app-' + func, data)
  }

  prependZero(n) {
    if (n < 10 && n > -10) {
      return (n < 0 ? '-' : '') + '0' + Math.abs(n);
    } else {
      return '' + n;
    }
  }

  async checkLogin(self) {
    self.loading = true;
    self.success = false;
    if (!self.login.username || !self.login.password) {
      self.error = 'Een gebruikersnaam en wachtwoord is vereist'
      return
    }
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
        self.loading = false;
        // self.$store.dispatch('user/login', user)
        // console.log(user)
        self.g.goHome();
      }
      // self.loginLoading = false
    })


    // console.log("Determining whether login is correct by searching for random child '000'...")

    //Try searching for random term: '000'. If it fails, login details probably are incorrect
    // var wp = this.g.getWpApi(this.login, this.staging, 'search');
    // wp.handler().param('search', '000').then((result) => {
    // 	this.loading = false;
    // 	if (result.code === 200) {
    // 		this.success = true;
    // 		this.error = null;
    // 		console.log('Succesvol ingelogd!');
    // 		setTimeout(() => { this.g.goHome() }, 800);
    // 	} else if (result.message === 'access denied') { // user probably didn't fill in username & password at all.
    // 		this.success = false;
    // 		this.error = 'Inloggen mislukt';
    // 		this.errorHelp = 'Het inloggen is mislukt; je hebt niet het juiste wachtwoord ingevoerd.';
    // 	} else {
    // 		console.log(result);
    // 	}
    // 	this.cd.detectChanges();
    // }).catch((error) => {
    // 	console.log(error)
    // 	this.loading = false;
    // 	if (error.code === 'invalid_username') {
    // 		this.success = false;
    // 		this.error = 'Inloggen mislukt';
    // 		this.errorHelp = 'Het inloggen is mislukt; je hebt niet de juiste gebruikersnaam ingevoerd.';
    // 		console.log('Verkeerde gebruikersnaam!');
    // 	} else if (error.code === 'incorrect_password') {
    // 		this.success = false;
    // 		this.error = 'Inloggen mislukt';
    // 		this.errorHelp = 'Het inloggen is mislukt; je hebt niet het juiste wachtwoord ingevoerd.';
    // 		console.log('Verkeerd wachtwoord!');
    // 	} else {
    // 		console.log(error);//user is offline (probably)
    // 	}
    // 	this.cd.detectChanges();
    // });
  }
}
