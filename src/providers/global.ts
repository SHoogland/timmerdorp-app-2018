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
  wijk: string;

  navigatedToDeeplink: boolean;
  parseInitialized: boolean;
  staging: boolean;

  serverUsernames: any;
  serverPasswords: any;
  serverURLs: any;
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

    this.loginPage = require('../pages/login/login').LoginPage;

    this.storage.get('wijk').then(async (val) => {
      this.wijk = val || "blue";
    })
  }

  setStatusBar(c) {
    let colors = {
      blue: "#2196f3",
      red: "#ee0202",
      yellow: "#fce700",
      green: "#43a047",
      white: "#ffffff"
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
    if (kleur == 'white') return 'Wit/EHBO';
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
      if (seenChildren.indexOf(history[i].id) === -1) {
        seenChildren.push(history[i].id);
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
    this.staging = await this.storage.get('staging')

    let newServerURL = this.serverURLs[this.staging ? 'staging' : 'production']
    if (Parse.serverURL !== newServerURL || !this.parseInitialized) {
      Parse.serverURL = newServerURL
      await Parse.initialize(this.serverUsernames[this.staging ? 'staging' : 'production'], this.serverPasswords[this.staging ? 'staging' : 'production'])
      this.parseInitialized = true
    }
  }

  prependZero(n) {
    if (n < 10 && n > -10) {
      return (n < 0 ? '-' : '') + '0' + Math.abs(n);
    } else {
      return '' + n;
    }
  }

  async checkIfStillLoggedIn(wantsAdmin = false) {
    await this.fixParseURL();
    let result;
    try {
      result = await this.apiCall('checkIfLoggedIn', { wantsToBecomeAdmin: wantsAdmin })
    }
    catch (e) {
      if (e.message == 'Invalid session token') {
        result = {
          result: false
        }
      }
    }

    return result
  }

  async switchEnv() {
    this.staging = !this.staging
    await this.storage.set('staging', this.staging)
  }

  generateGebeurtenisDescription(h, withChildName) {
    let d = h.get('datetime');
    let dateString = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'][d.getDay()] + ' om ' + this.prependZero(d.getHours()) + ':' + this.prependZero(d.getMinutes())

    let result = ''

    if(h.get('eventType') == 'marked-absent') {
      result = '<u>Afwezig</u> gemeld door ' + h.get('adminName') + ' met als reden: <i>' + h.get('reason') + '</i>.'
    }
    if(h.get('eventType') == 'marked-present') {
      result = 'Aanwezig gemeld door ' + h.get('adminName') + '.'
    }
    if(h.get('eventType') == 'set-hutnr') {
      if(!h.get('old')) {
        result = 'Toegevoegd aan hutje met nummer <u>' + h.get('new') + '</u> door ' + h.get('adminName') + '.'
      } else if(!h.get('new')) {
        result = 'Verwijderd uit hutje <u>' + h.get('old') + '</u> door ' + h.get('adminName') + '.'
      } else {
        result = 'Overgeplaatst van hutje <u>' + h.get('old') + '</u> naar hutje <u>' + h.get('new') + '</u> door ' + h.get('adminName') + '.'
      }
    }
    if(h.get('eventType') == 'gave-wristband') {
      if(!h.get('old')) {
        result = 'Polsbandje gegeven met nummer <u>' + h.get('new') + '</u> door ' + h.get('adminName') + '.'
      } else {
        result = 'Nieuw polsbandje gegeven met nummer <u>' + h.get('new') + '</u> (eerst: ' + h.get('old') + ') door ' + h.get('adminName') + '.'
      }
    }

    if(withChildName) {
      return '<b>' + dateString + ':</b> ' + h.get('ticket').get('firstName') + ' ' + h.get('ticket').get('lastName') + ' (bandje ' + h.get('ticket').get('wristband') + ') ' + result.substring(0,1).toLowerCase() + result.substring(1).replace('Afwezig', 'afwezig')
    } else {
      return '<b>' + dateString + ':</b> ' + result
    }
  }
}
