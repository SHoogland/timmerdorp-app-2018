import { Component, ViewChild } from '@angular/core';
import { App, Nav, Platform } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { Storage } from '@ionic/storage';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';

import { HomePage } from '../pages/home/home';
import { GlobalFunctions } from '../providers/global';
import { EmailConfirmationPage } from '../pages/email-confirmation/email-confirmation';
import { SettingsPage } from '../pages/settings/settings';
import { SearchPage } from '../pages/search/search';
import { ForgotPasswordPage } from '../pages/forgot-password/forgot-password';

declare let cordova: any;

@Component({
  templateUrl: 'app.html',
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  @ViewChild(Nav) navChild: Nav;

  rootPage: any = HomePage;
  pages: Array<{ title: string, component: any }>;
  swipeGestureStartX: number;
  swipeGestureStartY: number;
  swipeTimeout: any;
  swipeTimeout2: any;


  constructor(
    private g: GlobalFunctions,
    public platform: Platform,
    public splashScreen: SplashScreen,
    public storage: Storage,
    public app: App,
    private deeplinks: Deeplinks,
  ) {
    this.g.setStatusBar("#2196f3");
    this.initializeApp();
  }


  async initializeApp() {
    this.g.setStatusBar("#2196f3");
    this.platform.ready().then(() => {
      Promise.all([
        this.storage.get("notFirstUse").then((val) => {
          if (!val) {
            this.g.toLogin();
          }
        }, (error) => {
          this.g.toLogin();
        }),
      ]).then(() => {
        if (this.platform.is('cordova')) {
          if (cordova.platformId === 'android') {
            this.platform.registerBackButtonAction(() => {
              let preventBack = ['page-search', 'page-connect-child-to-cabin', 'page-home', 'page-presence', 'page-scan-ticket', 'page-forgot-password', 'page-login', 'email-confirmation']
              if (preventBack.indexOf(this.nav.getActive().pageRef().nativeElement.tagName.toLowerCase()) === -1) {
                this.g.goHome();
              }
            });
          }
        }
      });
    });
  }


  ngAfterViewInit() {
    this.platform.ready().then(() => {
      this.subscribeToDeeplinks()
    });
  }

  subscribeToDeeplinks() {
    let self = this
    this.deeplinks.route({}).subscribe(() => {
      // er komt nooit een match, want dan zouden we in de route functie bepaalde routes moeten doorgeven
      // ik doe het liever hieronder in de nomatch, en dan beslis ik wel handmatig of we iets met die route willen doen
    }, (nomatch) => {
      if (nomatch && self && self.app && self.app.getActiveNavs()) {
        let link = nomatch.$link
        let nav = self.app.getActiveNavs()[0];

        if (link) {
          if (link.path === '/app/verify-email') {
            if (link.queryString.split('code=').length > 0 && link.queryString.split('email=').length > 0) {
              let code = link.queryString.split('code=')[1].split('&')[0]
              let email = link.queryString.split('email=')[1].split('&')[0]
              this.g.navigatedToDeeplink = true
              nav.push(EmailConfirmationPage, { confirmationEmail: email, confirmationCode: code }, { animate: true, animation: "ios-transition", direction: 'forward' });
              this.g.setStatusBar('blue')
            }
          }

          if (link.path === '/app/confirm-admin' && link.queryString) {
            if (link.queryString.split('id=').length > 0) {
              let id = link.queryString.split('id=')[1].split('&')[0]
              this.g.navigatedToDeeplink = true
              nav.push(SettingsPage, { confirmationId: id }, { animate: true, animation: "ios-transition", direction: 'forward' });
              this.g.setStatusBar('blue')
            }
          }

          if (link.path === '/app/kindje' && link.queryString) {
            if (link.queryString.split('id=').length > 0) {
              let id = link.queryString.split('id=')[1].split('&')[0]
              this.g.navigatedToDeeplink = true
              nav.push(SearchPage, { searchId: id }, { animate: true, animation: "ios-transition", direction: 'forward' });
              this.g.setStatusBar('blue')
            }
          }

          if (link.path === '/app/new-password' && link.queryString) {
            if (link.queryString.split('code=').length > 0 && link.queryString.split('email=').length > 0) {
              let code = link.queryString.split('code=')[1].split('&')[0]
              let email = link.queryString.split('email=')[1].split('&')[0]
              this.g.navigatedToDeeplink = true
              nav.push(ForgotPasswordPage, { forgotEmail: email, forgotEmailCode: code }, { animate: true, animation: "ios-transition", direction: 'forward' });
              this.g.setStatusBar('blue')
            }
          }
        }
        self.subscribeToDeeplinks()
      }
    })
  }
}
