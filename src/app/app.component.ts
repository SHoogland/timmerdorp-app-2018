import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { Storage } from '@ionic/storage';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';

import { HomePage } from '../pages/home/home';
import { GlobalFunctions } from '../providers/global';

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
      this.deeplinks.route({}).subscribe((match) => {
        alert('match')
        alert(JSON.stringify(match))
        // Handle the route manually
      }, (nomatch) => {
        alert('nomatch')
        alert(JSON.stringify(nomatch))
        // No match
      })
      /*
      IonicDeeplink.route({
        '/about-us': AboutPage,
        '/universal-links-test': AboutPage,
        '/products/:productId': ProductPage
      }, function(match) {
        // Handle the route manually
      }, function(nomatch) {
        // No match
      })
      */

      // Convenience to route with a given nav
      //   Deeplinks.routeWithNavController(this.navChild, {
      //     '/about-us': AboutPage,
      //     '/universal-links-test': AboutPage,
      //     '/products/:productId': ProductPage
      //   }).subscribe((match) => {
      //     console.log('Successfully routed', match);
      //   }, (nomatch) => {
      //     console.warn('Unmatched Route', nomatch);
      //   });
      // })
    })
  }
}
