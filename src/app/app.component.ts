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
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  @ViewChild(Nav) navChild: Nav;

  rootPage: any = HomePage;
  pages: Array<{ title: string, component: any }>;
  swipeGestureStartX: number;
  swipeGestureStartY: number;
  swipeTimeout: any;


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

      if (this.platform.is('cordova')) {
        if (cordova.platformId === 'ios') {
          let b = document.body
          let self = this
          b.addEventListener('touchstart', function (event) {
            self.touchStart(event)
          });

          b.addEventListener('touchend', function (event) {
            self.touchEnd(event)
          });

          b.addEventListener('touchmove', function (event) {
            self.touchMove(event)
          })
        }
      }
    });
  }

  computeScrollX(event) {
    return (event.pageX) || (event.clientX + (document.body.scrollLeft || 0) - (document.body.clientLeft || 0))
  }

  computeScrollY(event) {
    return (event.pageY) || (event.clientY + (document.body.scrollTop || 0) - (document.body.clientTop || 0))
  }

  touchStart(event) {
    let page = this.nav.getActive().pageRef().nativeElement.tagName.toLowerCase()
    if (page === 'page-home' || page === 'page-login' || 'email-confirmation' || 'page-forgot-password') return;

    let x = this.computeScrollX(event)
    let y = this.computeScrollY(event)

    let windowHeight = document.body.getBoundingClientRect().height
    let notBottomSwipe = windowHeight ? y < (windowHeight - 50) : true

    if (x < 25 && y > 80 && notBottomSwipe) {
      this.swipeGestureStartX = x
      this.swipeGestureStartY = y
      document.getElementById('backBtnHint').style.top = (this.swipeGestureStartY - (56 / 2)) + 'px'
    }
  }

  touchEnd(event) {
    if (!this.swipeGestureStartX) return

    let backBtnHint = document.getElementById('backBtnHint')
    let xMovement = this.computeScrollX(event) - this.swipeGestureStartX
    if (xMovement > 80) {
      backBtnHint.style.background = '#b0d0ff'
      backBtnHint.style.transitionProperty = 'background, opacity'
      this.g.goHome();
      this.swipeTimeout = setTimeout(function () {
        backBtnHint.style.background = '#ffffff'
        backBtnHint.style.opacity = '0'
      }, 300)
    } else {
      backBtnHint.style.opacity = '0'
      setTimeout(function () {
        backBtnHint.style.top = '-100px'
      }, 400)
    }
    this.swipeGestureStartX = null;
    this.swipeGestureStartY = null;
  }

  touchMove(event) {
    if (!this.swipeGestureStartX) return

    let backBtnHint = document.getElementById('backBtnHint')
    let xMovement = this.computeScrollX(event) - this.swipeGestureStartX
    if (xMovement > 25) {
      clearTimeout(this.swipeTimeout)
      backBtnHint.style.transitionProperty = ''
      backBtnHint.style.background = '#ffffff'
      backBtnHint.style.opacity = '0'

      if (xMovement > 80) {
        document.getElementById('backBtnHint').style.opacity = '1'
      } else {
        document.getElementById('backBtnHint').style.opacity = '' + ((xMovement - 25) / (80 - 25))
      }
    } else {
      document.getElementById('backBtnHint').style.opacity = '0'
    }
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
              nav.setRoot(EmailConfirmationPage, { confirmationEmail: email, confirmationCode: code }, { animate: true, animation: "ios-transition", direction: 'forward' });
              this.g.setStatusBar('blue')
            }
          }

          if (link.path === '/app/confirm-admin' && link.queryString) {
            if (link.queryString.split('id=').length > 0) {
              let id = link.queryString.split('id=')[1].split('&')[0]
              this.g.navigatedToDeeplink = true
              nav.setRoot(SettingsPage, { confirmationId: id }, { animate: true, animation: "ios-transition", direction: 'forward' });
              this.g.setStatusBar('blue')
            }
          }

          if (link.path === '/app/kindje' && link.queryString) {
            if (link.queryString.split('id=').length > 0) {
              let id = link.queryString.split('id=')[1].split('&')[0]
              this.g.navigatedToDeeplink = true
              nav.setRoot(SearchPage, { searchId: id }, { animate: true, animation: "ios-transition", direction: 'forward' });
              this.g.setStatusBar('blue')
            }
          }

          if (link.path === '/app/new-password' && link.queryString) {
            if (link.queryString.split('code=').length > 0 && link.queryString.split('email=').length > 0) {
              let code = link.queryString.split('code=')[1].split('&')[0]
              let email = link.queryString.split('email=')[1].split('&')[0]
              this.g.navigatedToDeeplink = true
              nav.setRoot(ForgotPasswordPage, { forgotEmail: email, forgotEmailCode: code }, { animate: true, animation: "ios-transition", direction: 'forward' });
              this.g.setStatusBar('blue')
            }
          }
        }
        self.subscribeToDeeplinks()
      }
    })
  }
}
