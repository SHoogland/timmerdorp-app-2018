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
  loadedStagingStatus: boolean;

  serverURLs: any;
  serverUsernames: any;
  serverPasswords: any;
  loginPage: any;

  constructor(
    public platform: Platform,
    public storage: Storage,
    public statusBar: StatusBar,
    public app: App,
  ) {
    this.serverURLs = {
      staging: 'http://localhost:1337/1/',
      production: 'https://api.timmerdorp.com/1/'
    }

    this.serverUsernames = {
      staging: 'myAppId',
      production: 'knDC2JAquVJZ1jSPwARj53IhQCfpOPIDNKcgRMsD'
    }

    this.serverPasswords = {
      staging: 'jsKey',
      production: 'xnFIbFCrE1vjzWbRVehMO4QzPpNMCIdDgORKNlRI'
    }

    this.storage.get('staging').then((val) => {
      this.staging = val;
      this.loadedStagingStatus = true
    }, (error) => {
      this.staging = false;
      this.loadedStagingStatus = true
    })

    this.loginPage = require('../pages/login/login').LoginPage;
  }

  setStatusBar(c) {
    let colors = {
      blue: "#2196f3",
      red: "#ee0202",
      yellow: "#fce700",
      green: "#43a047"
    }

    if (Object.keys(colors).indexOf(c) > -1) {
      c = colors[c];
    }

    if (this.platform.is('cordova')) {
      this.statusBar.styleDefault();
      if (cordova.platformId === 'android') {
        this.statusBar.backgroundColorByHexString(this.darkenColour(c, -50));
      } else if (cordova.platformId === 'ios') {
        // this.statusBar.overlaysWebView(true);
        this.statusBar.backgroundColorByHexString(c);
      }
    }
  }


  //geplukt van het internet
  darkenColour(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
  }

  goHome() {
    let nav = this.app.getActiveNavs()[0];
    nav.setRoot(HomePage, {}, { animate: true, animation: "ios-transition", direction: "back" });
  }

  toLogin() {
    let nav = this.app.getActiveNavs()[0];
    nav.setRoot(this.loginPage, { login: true }, { animate: true, animation: "ios-transition", direction: 'forward' });
  }

  getWijkName(kleur) {
    if (kleur == 'blue') return 'Blauw';
    if (kleur == 'yellow') return 'Geel';
    if (kleur == 'red') return 'Rood';
    if (kleur == 'green') return 'Groen';
    if (kleur == 'hutlozen') return 'Hutlozen';
    return '';
  }

  getWijk(hutNr) {
    if (!hutNr) return '';
    hutNr = '' + hutNr;

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
      if (seenChildren.indexOf(history[i].wristband) === -1) {
        seenChildren.push(history[i].wristband);
        newHistory.push(history[i]);
      }
    }
    return newHistory;
  }

  getColor(w) {
    let res = '#222';
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

  async apiCall(func, data?, notApp?) {
    await this.fixParseURL()
    return Parse.Cloud.run((notApp ? '' : 'app-') + func, data)
  }

  async fixParseURL() {
    if (!this.loadedStagingStatus) {
      await this.storage.get('staging').then((val) => {
        this.staging = val;
        this.loadedStagingStatus = true
      }, (error) => {
        this.staging = false;
        this.loadedStagingStatus = true
      })
    }

    let newServerURL = this.serverURLs[this.staging ? 'staging' : 'production']
    if (Parse.serverURL !== newServerURL) {
      Parse.serverURL = newServerURL
      await Parse.initialize(this.serverUsernames[this.staging ? 'staging' : 'production'], this.serverPasswords[this.staging ? 'staging' : 'production'])
    }
  }

  prependZero(n) {
    if (n < 10 && n > -10) {
      return (n < 0 ? '-' : '') + '0' + Math.abs(n);
    } else {
      return '' + n;
    }
  }

  async checkIfStillLoggedIn() {
    await this.fixParseURL();
    return await this.apiCall('checkIfLoggedIn', {})
  }

  async switchEnv() {
    this.staging = !this.staging
    this.storage.set('staging', this.staging);
  }
}
