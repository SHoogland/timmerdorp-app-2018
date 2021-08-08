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

	undoingInterval: any;
	selectedChild: any;
	removedChild: any;
	typingTimer: any;
	nieuwHutje: any;
	tempHutNr: any;
	undoItem: any;
	history: any;

	hutTickets: Array<any>;
	tickets: Array<any>;

	allowAutoPresence: boolean;
	undoingIsDone: boolean;
	autoPresence: boolean;
	giveAccent: boolean;
	isUndoing: boolean;
	searched: boolean;
	loading: boolean;
	alreadyHasHutError: boolean;
	noWristbandError: boolean;

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

    this.title = 'Beheer Hutjes';

		this.allowAutoPresence = false;
		this.undoingIsDone = false;
		this.autoPresence = false;
		this.giveAccent = false;
		this.isUndoing = false;
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
		setInterval(function () {
			console.log((this.removeModal || {}).show); //hierdoor werkt de removeModal (ionic gedoe)
		}, 250);
	}

	ionViewDidLoad() {
		this.init();

		Promise.all([
			this.storage.get('cabinAddHistory').then((val) => {
				this.history = val || [];
				console.log(this.history);
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

	undo(i) {
		this.undoItem = i + 1;
		let self = this;
		this.undoingInterval = setInterval(function () {
			if (!self.loading) {
				console.log(self.undoItem);
				if (document.getElementById(self.undoItem)) {
					document.getElementById(self.undoItem).classList.add("done");
				}
				self.undoingIsDone = true;
				clearInterval(self.undoingInterval);

				setTimeout(function () {
					self.undoingIsDone = false;
					if (document.getElementById(self.undoItem)) {
						document.getElementById(self.undoItem).classList.remove("done");
					}
				}, 1500);
			}
		}, 200);
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
		console.log('searching: ' + this.hutNr);
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
      if(!result || result.response !== 'success') {
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

		console.log('searching: ' + this.searchTerm);
    this.g.apiCall('search', { searchTerm: this.searchTerm }).then((result) => {
      if(!result || result.response !== 'success') {
        self.error = (result || {}).error || (result || {}).response
        self.errorHelp = (result || {}).errorMessage || (result || {}).response
        return;
      }
      self.loading = false
      self.tickets = result.tickets.sort(function (a) {
        if (a.wristband == self.searchTerm) {
          return -1;
        }
        return 1;
      }); //give priority to wristbands over hut numbers
    }).catch((e) => {
      self.error = String(e)
    });
	}

	addChildToHut(child) {
		this.selectedChild = child;
		if (child.hutnr) {
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
		this.isUndoing = false;
		this.nieuwHutje = this.hutNr;
		this.closeWarningModal();
		this.closeAddModal();
		console.log(this.selectedChild);
		let self = this;
    this.g.apiCall('setHutNr', { id: this.selectedChild.id, hutNr: this.hutNr }).then((result) => {
      if(!result || result.response !== 'success') {
        alert('daar ging iets goed mis... het hutje is waarschijnlijk niet opgeslagen')
      } else {
        console.log(self.selectedChild.hutnr)
        self.history.unshift({
          name: self.selectedChild.firstName + ' ' + self.selectedChild.lastName,
          wristband: self.selectedChild.wristband,
          oldNr: self.selectedChild.hutnr,
          hutNr: self.nieuwHutje,
          wijk: self.g.getColor(self.nieuwHutje),
          ticket: self.updateT(self.selectedChild)
        });

        self.storage.set("cabinAddHistory", self.history);

        self.giveAccent = true;

        setTimeout(function () {
          self.giveAccent = false;
        }, 1500);
      }
      setTimeout(function () {
        self.search();
      }, 100);
      self.loading = false;
    });
	}


	updateT(ticket) {
		ticket.hutnr = this.nieuwHutje;
		return ticket;
	}

	updateT2(ticket) {
		ticket.hutnr = null;
		return ticket;
	}


	removeChildFromHut(child) {
		let self = this;
    console.log(child)
    this.removedChild = child;
    this.g.apiCall('setHutNr', { id: child.id, hutNr: null, removeFromHut: true }).then((result) => {
      if(!result || result.response !== 'success') {
        alert('daar ging iets goed mis... het hutje is waarschijnlijk niet opgeslagen')
      } else {
        self.history.unshift({
          name: self.removedChild.firstName + ' ' + self.removedChild.lastName,
          wristband: self.removedChild.wristband,
          oldNr: self.removedChild.hutnr,
          hutNr: self.nieuwHutje,
          wijk: self.g.getColor(self.nieuwHutje),
          ticket: self.updateT2(self.removedChild),
          removal: true
        });

        self.storage.set("cabinAddHistory", self.history);

        self.giveAccent = true;

        setTimeout(function () {
          self.giveAccent = false;
        }, 1500);
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
	}

	closeAddModal() {
		let self = this;
		this.addModal.show = false;
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
}
