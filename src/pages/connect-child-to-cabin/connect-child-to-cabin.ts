import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { GlobalFunctions } from '../../providers/global';

declare let cordova: any;

@Component({
  selector: 'page-connect-child-to-cabin',
  templateUrl: 'connect-child-to-cabin.html',
})
export class ConnectChildToCabinPage {
  searchError: string;
  searchTerm: string;
  errorHelp: string;
  title: string;
  hutNr: string;
  error: string;

  selectedChild: any;
  removedChild: any;
  typingTimer: any;
  nieuwHutje: any;
  tempHutNr: any;
  history: any;

  hutTickets: Array<any>;
  tickets: Array<any>;

  alreadyHasHutError: boolean;
  noWristbandError: boolean;
  searchedChild: boolean;
  searched: boolean;
  loading: boolean;

  interval: any;

  addModal: {
    show: boolean;
  }
  warningModal: {
    show: boolean;
  }
  removeModal: {
    show: boolean;
  }

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform,
    public storage: Storage,
    private cd: ChangeDetectorRef,
    public g: GlobalFunctions
  ) {
    if (this.platform.is('cordova') && cordova.platformId === 'android') {
      this.platform.registerBackButtonAction(() => {
        if (this.addModal.show) {
          this.addModal.show = false;
        } else if (this.removeModal.show) {
          this.removeModal.show = false;
        } else if (this.warningModal.show) {
          this.warningModal.show = false;
        } else {
          this.g.goHome();
        }
      });
    }

    let hnr = this.navParams.get('hutNr')
    if(hnr) {
      this.hutNr = hnr;
      this.search();
    }

    this.title = 'Beheer Hutjes';

    this.searchedChild = false;
    this.searched = false;
    this.loading = false;
    this.alreadyHasHutError = false;
    this.noWristbandError = false;

    this.searchError = '';
    this.error = '';
    this.errorHelp = '';

    this.warningModal = {
      show: false
    }
    this.removeModal = {
      show: false
    }
    this.addModal = {
      show: false
    }

    this.hutTickets = [];
    this.tickets = [];
  }

  init() {
    this.interval = setInterval(function () {
      (this.removeModal || {}).show; //hierdoor werkt de removeModal (ionic gedoe)
    }, 250);
  }

  ionViewDidLoad() {
    this.init();

    Promise.all([
      this.storage.get('cabinAddHistory').then((val) => {
        this.history = val || [];
      }, (error) => {
        this.history = [];
      }),
    ]).then(() => {
    });
  }

  getBg(hutNr) {
    let res = '#000';
    let a = (hutNr + "")[0];

    switch (a) {
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
        res = '#000';
    }
    return res;
  }

  search() {
    this.searched = false;
    this.hutTickets = [];
    if (this.hutNr && this.hutNr.length === 3) {
      try {
        clearTimeout(this.typingTimer);
        this.typingTimer = setTimeout(() => {
          this.searchHut();
        }, 200);
      } catch (e) {
        console.log(e);
      }
    } else {
      this.error = '';
    }
  }

  searchHut() {
    if (isNaN(+this.hutNr) || +this.hutNr >= 400 || +this.hutNr < 0) {
      this.error = 'Foutmelding';
      this.errorHelp = 'Hutnummer moet tussen 0 en 399 zijn.';
      this.cd.detectChanges();
      return;
    }
    this.loading = true;
    this.error = '';
    this.cd.detectChanges();
    let self = this;
    this.g.apiCall('searchHut', { hutNr: this.hutNr }).then((result) => {
      if (!result || result.response !== 'success') {
        self.error = (result || {}).error || (result || {}).response
        self.errorHelp = (result || {}).errorMessage || (result || {}).response
        return;
      }
      self.hutTickets = result.tickets;
      self.loading = false;
      self.cd.detectChanges();
      self.searched = true;
    }, (error) => {
      self.error = error
    })
  }

  searchChild() {
    try {
      clearTimeout(this.typingTimer);
      this.typingTimer = setTimeout(() => {
        this.searchedChild = false
        this.searchThisChild();
      }, 200);
    } catch (e) {
      console.log(e);
    }
  }

  searchThisChild() {
    let self = this;
    self.tickets = [];
    self.searchError = '';
    if (this.searchTerm.length < 3) {
      return;
    }
    self.loading = true;

    this.g.apiCall('search', { searchTerm: this.searchTerm }).then((result) => {
      if (!result || result.response !== 'success') {
        self.error = (result || {}).error || (result || {}).response
        self.errorHelp = (result || {}).errorMessage || (result || {}).response
        return;
      }
      self.searchedChild = true
      self.loading = false
      self.tickets = result.tickets.sort(function (a, b) {
        return a.firstName > b.firstName ? 1 : -1
      }); //give priority to wristbands over hut numbers
    }).catch((e) => {
      self.searchedChild = true
      self.error = String(e)
    });
  }

  addChildToHut(child) {
    this.selectedChild = child;
    if (child.hutNr) {
      this.alreadyHasHutError = true;
      this.noWristbandError = false;
      this.showWarningModal();
    } else if (!child.wristband) {
      this.alreadyHasHutError = false;
      this.noWristbandError = true;
      this.showWarningModal();
    } else {
      this.reallyAddChildNow();
    }
  }

  reallyAddChildNow() {
    this.loading = true;
    this.nieuwHutje = this.hutNr;
    this.closeWarningModal();
    this.closeAddModal();
    let self = this;
    this.g.apiCall('setHutNr', { id: this.selectedChild.id, hutNr: this.hutNr }).then((result) => {
      if (!result || result.response !== 'success') {
        alert('daar ging iets goed mis... het hutje is waarschijnlijk niet opgeslagen')
      } else {
        self.history.unshift({
          name: (self.selectedChild.firstName) + ' ' + self.selectedChild.lastName,
          wristband: self.selectedChild.wristband,
          oldNr: self.selectedChild.hutNr,
          hutNr: self.nieuwHutje,
          wijk: self.g.getColor(self.nieuwHutje),
          ticket: self.updateT(self.selectedChild),
          id: self.selectedChild.id,
        });
        self.searchedChild = false

        self.storage.set("cabinAddHistory", self.history);
      }
      setTimeout(function () {
        self.search();
      }, 100);
      self.loading = false;
    });
  }


  updateT(ticket) {
    ticket.hutNr = this.nieuwHutje;
    return ticket;
  }

  updateT2(ticket) {
    ticket.hutNr = null;
    return ticket;
  }


  removeChildFromHut(child) {
    let self = this;
    this.removedChild = child;
    this.g.apiCall('setHutNr', { id: child.id, hutNr: null, removeFromHut: true }).then((result) => {
      if (!result || result.response !== 'success') {
        alert('daar ging iets goed mis... het hutje is waarschijnlijk niet opgeslagen')
      } else {
        self.history.unshift({
          name: (self.removedChild.firstName) + ' ' + self.removedChild.lastName,
          wristband: self.removedChild.wristband,
          oldNr: self.removedChild.hutNr,
          hutNr: self.nieuwHutje,
          wijk: self.g.getColor(self.nieuwHutje),
          ticket: self.updateT2(self.removedChild),
          id: self.removedChild.id,
          removal: true,
        });

        self.storage.set("cabinAddHistory", self.history);

      }
      self.closeRemoveModal();
      setTimeout(function () {
        self.search();
      }, 100);
      self.loading = false;
    });
  }

  showAddModal() {
    this.tickets = [];
    this.loading = false;
    this.addModal.show = true;
    this.searchTerm = '';
    document.querySelector('#myModal').classList.add('high');

    setTimeout(function () {
      if (document && document.getElementById("addModalInput")) {
        let el = document.getElementById("addModalInput").getElementsByTagName("input")[0];
        el.focus();
      }
    }, 200);
  }

  closeAddModal() {
    let self = this;
    this.addModal.show = false;
    self.searchedChild = false;
    setTimeout(function () {
      document.querySelector('#myModal').classList.remove('high');
      self.searchError = '';
      self.error = '';
    }, 400);
  }

  showRemoveModal() {
    this.removeModal.show = true;
    this.searchTerm = '';
    document.querySelector('#removeModal').classList.add('high');
  }

  closeRemoveModal() {
    this.removeModal.show = false;
    setTimeout(function () {
      document.querySelector('#removeModal').classList.remove('high');
    }, 400);
  }

  showWarningModal() {
    this.warningModal.show = true;
    this.searchTerm = '';
    document.querySelector('#warningModal').classList.add('high');
  }

  closeWarningModal() {
    this.warningModal.show = false;
    setTimeout(function () {
      document.querySelector('#warningModal').classList.remove('high');
    }, 400);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }
}
