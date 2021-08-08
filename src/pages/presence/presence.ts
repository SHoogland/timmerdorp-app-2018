import { Component, ChangeDetectorRef } from '@angular/core';
import { Platform, NavController, Keyboard } from 'ionic-angular';
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
	loading: boolean;

	ticket: any;
	history: any;

	constructor(
		public navCtrl: NavController,
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

		this.loading = false;
		this.error = '';
		this.ticket = {};

		this.number = '';
		this.name = '';

    this.storage.get('presHistory').then((val) => {
      this.history = val || [];
      this.history = this.g.filterHistory(this.history);
      console.log(this.history);
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
    if (this.number.length === 3) {
      this.loading = true;
      this.foundTicket = false;

      let self = this;
      this.g.apiCall('findChildByWristband', { wristband: this.number }).then((result) => {
        if(result.response !== 'success') {
          self.error = result.errorMessage || result.response
          return
        } else {
          self.ticket = result.ticket
          self.foundTicket = true
          self.loading = false
          self.history.unshift({
            firstName: self.ticket.firstName,
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
      }
      self.ticket['aanwezig_' + self.day] = result.newPresence
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
			console.log("warning user that child is already present");
			this.showModal();
			return;
    }

    let self = this;

    this.g.apiCall('togglePresence', { ticket: this.ticket, day: this.day }).then((result) => {
      if(!result || !(result || {}).response || result.response != "success") {
        self.error = (result || {}).error || 'Foutmelding!';
        self.errorHelp = (result || {}).errorMessage || (result || {}).response;
        self.loading = false
      }
      self.ticket['aanwezig_' + self.day] = result.newPresence
      self.loading = false
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


	markDone() {
		this.ticket = null;
    this.foundTicket = false;
		this.greenBtn = true;
		let self = this;
		document.getElementById("btnLabel").innerHTML = "Opgeslagen!";
		(<HTMLScriptElement>document.querySelector("#numberInput input")).focus();
		self.number = '';
		setTimeout(function () {
			self.greenBtn = false;
			(<HTMLScriptElement>document.querySelector("#numberInput input")).focus();
			document.getElementById("btnLabel").innerHTML = "Opslaan";
			self.cd.detectChanges();
		}, 1000);
	}

	alert() {
		alert("Om fouten te voorkomen is het niet mogelijk aanwezigheid te veranderen voor andere dagen. Vragen, of alsnog een wijziging aanvragen? Zoek Stan uit wijk blauw of Stephan uit wijk geel");
	}
}
