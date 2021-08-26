import { Component, ChangeDetectorRef } from '@angular/core';
import { Platform, NavController, Keyboard, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { GlobalFunctions } from '../../providers/global';

declare let cordova: any;

@Component({
	selector: 'page-presence',
	templateUrl: 'presence.html'
})
export class PresencePage {
	errorHelp: string;
	number: string;
	title: string;
	error: string;
	name: string;
	day: string;

  foundTicket: boolean;
	modalShown: boolean;
	greenBtn: boolean;
	searched: boolean;
	loading: boolean;

	ticket: any;
	history: any;

	constructor(
		public navCtrl: NavController,
    public navParams: NavParams,
		public platform: Platform,
		public storage: Storage,
		public cd: ChangeDetectorRef,
		public keyboard: Keyboard,
		public g: GlobalFunctions
	) {
    this.title = 'Aanwezigheid';
		if (this.platform.is('cordova')) {
      if (cordova.platformId === 'android') {
        this.platform.registerBackButtonAction(() => {
          if (this.modalShown) {
            this.modalShown = false;
					} else {
            this.g.goHome();
					}
				});
			}
		}
    this.foundTicket = false;
	}

	init() {
		switch (new Date().getDay()) {
			case 2:
				this.day = "di";
				break;
			case 3:
				this.day = 'wo';
				break;
			case 4:
				this.day = 'do';
				break;
			case 5:
				this.day = 'vr';
				break;
			default:
				this.day = 'di'
				alert("Nog even wachten tot Timmerdorp!");
				this.g.goHome();
		}

		this.modalShown = false;
		this.greenBtn = false;

		this.searched = false;
		this.loading = false;
		this.error = '';
		this.ticket = {};

		this.number = this.navParams.get('wristband') || '';
    if(this.number) this.getChild()
		this.name = '';

    this.storage.get('presHistory').then((val) => {
      this.history = val || [];
      this.history = this.g.filterHistory(this.history);
    }, (error) => {
      this.history = [];
    });
	}

	getDayName(d) {
		if (d == 'di') return "Dinsdag"
		if (d == 'wo') return "Woensdag"
		if (d == 'do') return "Donderdag"
		if (d == 'vr') return "Vrijdag"
    return 'onbekend'
	}

	ionViewDidLoad() {
		this.init();
	}

	hideKeyboard() {
		this.keyboard.close();
	}

	getChild() {
    this.error = '';
    this.searched = false;
    this.foundTicket = false;
    if (this.number.length === 3) {
      this.loading = true;

      let self = this;
      this.g.apiCall('findChildByWristband', { wristband: this.number }).then((result) => {
        self.loading = false;
        self.searched = true;
        if(result.response !== 'success') {
          self.error = result.errorMessage || result.response;
          return
        } else {
          self.ticket = result.ticket;
          self.foundTicket = true;
          self.history.unshift({
            firstName: self.ticket.nickName || self.ticket.firstName,
            lastName: self.ticket.lastName,
            wristband: self.ticket.wristband,
            hutNr: self.ticket.hutNr,
            wijk: self.g.getColor(self.ticket.hutNr)
          });
          self.history = this.g.filterHistory(this.history);
          self.storage.set("presHistory", self.history);
        }
      })
		} else {
			this.loading = false;
			this.ticket = null;
      this.foundTicket = false;
		}
	}

	makeAbsent() {
		if (this.number.length < 3) return;
		if (!this.foundTicket || !this.ticket) {
			this.error = 'Geen kind gevonden!';
			return;
		}
		if (this.number.length != 3) return;

    if (!this.ticket || !this.foundTicket) {
			this.error = 'Geen kind gevonden!';
			return;
		}

    let self = this;

    this.g.apiCall('togglePresence', { ticket: this.ticket, day: this.day, forcePresence: true, presence: false }).then((result) => {
      if(!result || !(result || {}).response || result.response != "success") {
        alert('Absent melden niet gelukt! Vraag na bij Stan of Stephan wat er mis ging...')
      } else {
        self.ticket['aanwezig_' + self.day] = result.newPresence
        self.markDone()
      }
      self.closeModal()
    });
	}

	togglePresence() {
		this.hideKeyboard();
    this.error = ''
    this.errorHelp = ''
		if (this.number.length != 3) return;
    this.loading = true;
		if (!this.ticket || !this.foundTicket) {
			this.error = 'Geen kind gevonden!';
			return;
		}

    if(this.ticket['aanwezig_' + this.day]) {
			this.showModal();
			return;
    }

    let self = this;

    this.g.apiCall('togglePresence', { ticket: this.ticket, day: this.day }).then((result) => {
      self.loading = false
      if(!result || !(result || {}).response || result.response != "success") {
        self.error = (result || {}).error || 'Foutmelding!';
        self.errorHelp = (result || {}).errorMessage || (result || {}).response;
      } else {
        self.ticket['aanwezig_' + self.day] = result.newPresence
        self.markDone()
      }
    });
	}

	showModal() {
		this.modalShown = true;
		document.querySelector('#myModal').classList.add('high');
	}

	closeModal() {
		this.loading = false;
		this.modalShown = false;
		setTimeout(function () {
			document.querySelector('#myModal').classList.remove('high');
		}, 400);
	}

  childNumberInput(event) {
    if(event.key === 'Enter') {
      this.togglePresence();
      return;
    }
  }


	markDone() {
		this.ticket = null;
    this.foundTicket = false;
    this.searched = false;
		this.greenBtn = true;
		let self = this;
		(<HTMLScriptElement>document.querySelector("#numberInput input")).focus();
		self.number = '';
		setTimeout(function () {
			self.greenBtn = false;
			(<HTMLScriptElement>document.querySelector("#numberInput input")).focus();
			self.cd.detectChanges();
		}, 1000);
	}

	alert() {
		alert("Om fouten te voorkomen is het niet mogelijk aanwezigheid te veranderen voor andere dagen. Vragen, of alsnog een wijziging aanvragen? Zoek Stan uit wijk blauw of Stephan uit wijk geel");
	}
}
