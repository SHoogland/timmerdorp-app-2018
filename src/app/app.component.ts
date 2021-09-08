import { Component, ViewChild } from '@angular/core';
import { App, Nav, Platform } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { Storage } from '@ionic/storage';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';

import { HomePage } from '../pages/home/home';
import { GlobalFunctions } from '../providers/global';
import { EmailConfirmationPage } from '../pages/email-confirmation/email-confirmation';
import { AppInfoPage } from '../pages/app-info/app-info';
import { SearchPage } from '../pages/search/search';

declare let cordova: any;

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  @ViewChild(Nav) navChild: Nav;

  rootPage: any = HomePage;
  pages: Array<{ title: string, component: any }>;

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
              let preventBack = ['page-search', 'page-connect-child-to-cabin', 'page-home', 'page-presence', 'page-scan-ticket']
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
    })
  }

  subscribeToDeeplinks() {
    let self = this
    this.deeplinks.route({}).subscribe(() => {
      // er komt nooit een match, want dan zouden we in de route functie bepaalde routes moeten doorgeven
      // ik doe het liever hieronder in de nomatch, en dan beslis ik wel handmatig of we iets met die route willen doen
    }, (nomatch) => {
      let link = nomatch.$link
      let nav = self.app.getActiveNavs()[0];
      if(link && link.$path === '/app/verify-email') {
        let code = link.queryString.split('code=')[1].split('&')[0]
        let email = link.queryString.split('email=')[1].split('&')[0]
        if(code && email) {
          nav.setRoot(EmailConfirmationPage, { confirmationEmail: email, confirmationCode: code }, { animate: true, animation: "ios-transition", direction: 'forward' });
        }
      }

      if(link && link.$path === '/app/confirm-admin') {
        let id = link.queryString.split('id=')[1].split('&')[0]
        nav.setRoot(AppInfoPage, { confirmationId: id }, { animate: true, animation: "ios-transition", direction: 'forward' });
      }

      if(link && link.$path === '/app/kindje') {
        let id = link.queryString.split('id=')[1].split('&')[0]
        nav.setRoot(SearchPage, { searchTerm: id }, { animate: true, animation: "ios-transition", direction: 'forward' });
      }
      self.subscribeToDeeplinks()
    })
  }
}
