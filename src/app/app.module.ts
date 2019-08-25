import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';

import { BarcodeScanner } from '@ionic-native/barcode-scanner';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { SearchPage } from '../pages/search/search';
import { ScanTicketPage } from '../pages/scan-ticket/scan-ticket';
import { ConnectChildToCabinPage } from '../pages/connect-child-to-cabin/connect-child-to-cabin';
import { PresencePage } from '../pages/presence/presence';
import { LoginPage } from '../pages/login/login';
import { WijkPage } from '../pages/wijk/wijk';
import { AppInfoPage } from '../pages/app-info/app-info';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SchedulePage } from '../pages/schedule/schedule';

@NgModule({
	declarations: [
		MyApp,
		HomePage,
		ScanTicketPage,
		SearchPage,
		ConnectChildToCabinPage,
		PresencePage,
		LoginPage,
		WijkPage,
		AppInfoPage,
		SchedulePage
	],
	imports: [
		BrowserModule,
		IonicModule.forRoot(MyApp),
		IonicStorageModule.forRoot(),
		HttpClientModule
	],
	bootstrap: [IonicApp],
	entryComponents: [
		MyApp,
		HomePage,
		ScanTicketPage,
		SearchPage,
		ConnectChildToCabinPage,
		PresencePage,
		LoginPage,
		WijkPage,
		AppInfoPage,
		SchedulePage
	],
	providers: [
		StatusBar,
		SplashScreen,
		HttpClient,
		BarcodeScanner,
		{ provide: ErrorHandler, useClass: IonicErrorHandler }
	]
})
export class AppModule { }
