import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicStorageModule } from '@ionic/storage';

import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

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
import { ChangeWristbandPage } from '../pages/change-wristband/change-wristband';
import { FilesPage } from '../pages/files/files';

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
		SchedulePage,
		ChangeWristbandPage,
		FilesPage
	],
	imports: [
		BrowserModule,
		IonicModule.forRoot(MyApp, { mode: "md" }),
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
		SchedulePage,
		ChangeWristbandPage,
		FilesPage
	],
	providers: [
		StatusBar,
		SplashScreen,
		HttpClient,
		BarcodeScanner,
		{ provide: ErrorHandler, useClass: IonicErrorHandler }
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
