import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { BarcodeScanner } from '@ionic-native/barcode-scanner';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { SearchPage } from '../pages/search/search';
import { ScanTicketPage } from '../pages/scan-ticket/scan-ticket';
import { ConnectChildToCabinPage } from '../pages/connect-child-to-cabin/connect-child-to-cabin';
import { ConnectChildToCabinStep_2Page } from '../pages/connect-child-to-cabin-step-2/connect-child-to-cabin-step-2';
import { ResultChildrenPage } from '../pages/result-children/result-children';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
	ScanTicketPage,
	SearchPage,
	ConnectChildToCabinStep_2Page,
	ResultChildrenPage,
	ConnectChildToCabinPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
	ScanTicketPage,
	SearchPage,
	ConnectChildToCabinStep_2Page,
	ResultChildrenPage,
	ConnectChildToCabinPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    BarcodeScanner,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
