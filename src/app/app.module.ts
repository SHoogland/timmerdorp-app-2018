import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicStorageModule } from '@ionic/storage';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';

import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { SearchPage } from '../pages/search/search';
import { ScanTicketPage } from '../pages/scan-ticket/scan-ticket';
import { ConnectChildToCabinPage } from '../pages/connect-child-to-cabin/connect-child-to-cabin';
import { PresencePage } from '../pages/presence/presence';
import { LoginPage } from '../pages/login/login';
import { StatsPage } from '../pages/stats/stats';
import { SettingsPage } from '../pages/settings/settings';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BirthdaysPage } from '../pages/birthdays/birthdays';
import { FilesPage } from '../pages/files/files';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { GlobalFunctions } from '../providers/global';
import { EmailConfirmationPage } from '../pages/email-confirmation/email-confirmation';
import { ForgotPasswordPage } from '../pages/forgot-password/forgot-password';
import { HutjesMapPage } from '../pages/hutjes-map/hutjes-map';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ScanTicketPage,
    SearchPage,
    ConnectChildToCabinPage,
    PresencePage,
    LoginPage,
    EmailConfirmationPage,
    StatsPage,
    SettingsPage,
    BirthdaysPage,
    FilesPage,
    ForgotPasswordPage,
    HutjesMapPage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, { mode: "md", swipeBackEnabled: true }),
    IonicStorageModule.forRoot(),
    HttpClientModule,
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
    EmailConfirmationPage,
    StatsPage,
    SettingsPage,
    BirthdaysPage,
    FilesPage,
    ForgotPasswordPage,
    HutjesMapPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Deeplinks,
    SocialSharing,
    HttpClient,
    InAppBrowser,
    BarcodeScanner,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    GlobalFunctions,
    Geolocation,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
