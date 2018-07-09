import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { ScanTicketPage }from '../pages/scan-ticket/scan-ticket';
import { SearchPage }from '../pages/search/search';
import { ConnectChildToCabinPage } from '../pages/connect-child-to-cabin/connect-child-to-cabin';
import { ConnectChildToCabinStep_2Page } from '../pages/connect-child-to-cabin-step-2/connect-child-to-cabin-step-2';
import { ResultChildrenPage } from '../pages/result-children/result-children';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
	@ViewChild(Nav) nav: Nav;

  rootPage:any = HomePage;
  pages: Array<{title: string, component: any}>;

  constructor(
	  public platform: Platform,
	  public statusBar: StatusBar,
	  public splashScreen: SplashScreen,
) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
	{ title: 'Home', component: HomePage },
	{ title: 'Scan Ticket', component: ScanTicketPage },
	{ title: 'Koppel kind aan hut', component: ConnectChildToCabinPage },
	{ title: 'Zoek kind', component: SearchPage }
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.hide();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
	  console.log(page);
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.push(page.component);
  }
}
