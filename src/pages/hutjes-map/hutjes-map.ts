import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { GlobalFunctions } from '../../providers/global';
import { Storage } from '@ionic/storage';
import Parse from 'parse';

@Component({
  selector: 'page-hutjes-map',
  templateUrl: 'hutjes-map.html'
})
export class HutjesMapPage {
  zoomedInFromHutHighlight: boolean;
  hasZoomedInToLocation: boolean;
  hasSelectedLocation: boolean;
  isSavingLocation: boolean;
  savingFromButton: boolean;
  foundLocation: boolean;
  stanOfStephan: boolean;
  showHighlight: boolean;
  showModalHigh: boolean;
  preventHome: boolean;
  hutNotFound: boolean;
  showModal: boolean;
  zoomedIn: boolean;
  loading: boolean;

  selectionHighlightLeft: string;
  selectionHighlightTop: string;
  hutIndicatorLeft: string;
  hutIndicatorTop: string;
  locIndicatorLeft: string;
  locIndicatorTop: string;
  zoomBottom: string;
  zoomRight: string;
  zoomLeft: string;
  zoomTop: string;
  title: string;
  hutNr: string;

  bottomRightLat: number;
  bottomRightLng: number;
  currentZoomX: number;
  currentZoomY: number;
  pageOpenTime: number;
  defaultSize: number;
  topLeftLat: number;
  topLeftLng: number;
  zoomFactor: number;
  mapHeight: number; // distance from topmost to bottommost point on the map, in meters
  mapWidth: number; // same but from left to right

  locationSubscription: any;
  selectedLocation: any;
  highlightedHut: any;
  mapSize: any;
  hutjes: any;
  canvas: any;

  constructor(
    public navCtrl: NavController,
    public httpClient: HttpClient,
    public g: GlobalFunctions,
    public storage: Storage,
    public geolocation: Geolocation,
    public navParams: NavParams,
  ) {
    this.zoomFactor = 3.5
    this.loading = true;
    this.preventHome = false
    this.title = "Hutjeskaart"


    if (this.navParams.get('saveLocation')) {
      this.isSavingLocation = true
      this.hutNr = this.navParams.get('hutNr')
      let self = this
      this.storage.get('dontShowLocationModalAgain').then((dontShowModal) => {
        if (!dontShowModal) {
          self.showModal = true
          self.showModalHigh = true;
        }
      })
    }
  }

  ionViewDidEnter() {
    this.init();
  }

  init() {
    this.pageOpenTime = +new Date()
    let self = this;

    this.g.apiCall('getHutjesMap').then(async function (result) {
      self.loading = false;
      if (!result || result.response !== 'success') {
        return;
      }
      self.hutjes = result.hutjes
      self.stanOfStephan = result.stanOfStephan
      setTimeout(self.drawCanvas, 250, self)
    })
  }

  drawCanvas(ctx) {
    let c = (document.getElementsByTagName('canvas') || [])[0]
    if (!c) return
    let self = ctx
    self.canvas = c.getContext('2d');
    var img = new window.Image();
    img.addEventListener('load', function () {
      let proportion = img.width / img.height
      let w = self.canvas.canvas.width
      let h = w / proportion
      self.canvas.canvas.height = h
      self.mapSize = { w, h }
      self.canvas.drawImage(img, 0, 0, w, h)

      self.topLeftLat = 52.611791
      self.topLeftLng = 4.693581
      self.bottomRightLat = 52.610468
      self.bottomRightLng = 4.695963
      let coords = self.coordinatesInMetersFromTopLeft(self.bottomRightLat, self.bottomRightLng)
      self.mapWidth = coords.x
      self.mapHeight = coords.y

      self.canvas.textAlign = "center";
      self.defaultSize = 36
      for (let i = 0; i < self.hutjes.length; i++) {
        self.canvas.beginPath()
        let hutje = self.hutjes[i]
        let loc = hutje.location
        coords = self.coordinatesInMetersFromTopLeft(loc.latitude, loc.longitude)
        let x = coords.x / self.mapWidth * self.canvas.canvas.width
        let y = coords.y / self.mapHeight * self.canvas.canvas.height
        let size = hutje.size || self.defaultSize
        let fontSize = Math.round(size / 2)
        self.canvas.font = fontSize + "px Arial";
        self.canvas.rect(x, y, size, size);
        self.canvas.fillStyle = hutje.color || self.g.getColor(hutje.hutNr);
        self.canvas.fill();
        self.canvas.fillStyle = "black"
        self.canvas.fillText(hutje.hutNr || '', x + size / 2, y + size / 2 + fontSize / 2)
      }

      self.geolocation.getCurrentPosition().then((data) => {
        self.updateLocIndicator(data, self)
      })
      self.locationSubscription = self.geolocation.watchPosition({ enableHighAccuracy: true }).subscribe((data) => {
        self.updateLocIndicator(data, self)
      })

      if (self.navParams.get('hutNr') && !self.isSavingLocation) {
        self.hutNr = self.navParams.get('hutNr')
        self.searchHut(self.hutNr)
      }
    })
    img.src = '/assets/imgs/tdorp-map.png'
  }

  coordinatesInMetersFromTopLeft(lat, lng) {
    let earthCircumference = 40075 * 1000;
    let mapWidthInDegrees = lng - this.topLeftLng
    let x = mapWidthInDegrees * earthCircumference / 360 * Math.cos(this.topLeftLat / 180 * Math.PI)
    let mapHeightInDegrees = this.topLeftLat - lat
    let y = mapHeightInDegrees * earthCircumference / 360;
    return { x, y }
  }

  searchHut(hutNr) {
    this.hutNotFound = false
    if (hutNr.length != 3 || isNaN(hutNr)) {
      if (this.zoomedInFromHutHighlight) this.zoomOut()
      this.zoomedInFromHutHighlight = false
      this.showHighlight = false
      return
    }

    this.highlightedHut = this.hutjes.filter((item) => item.hutNr == hutNr)[0]
    if (!this.highlightedHut) {
      this.hutNotFound = true
      return
    }
    this.showHighlight = true
    let coords = this.coordinatesInMetersFromTopLeft(this.highlightedHut.location.latitude, this.highlightedHut.location.longitude)
    let rect = this.canvas.canvas.getBoundingClientRect()
    this.zoomIn(coords.x / this.mapWidth * rect.width / (this.zoomedIn ? this.zoomFactor : 1), coords.y / this.mapHeight * rect.height / (this.zoomedIn ? this.zoomFactor : 1))
    this.zoomedInFromHutHighlight = true
    this.updateHighlightIndicator()
  }

  updateHighlightIndicator() {
    if (!this.showHighlight || !this.highlightedHut) return;
    let hutSize = this.highlightedHut.size || this.defaultSize
    let coords = this.coordinatesInMetersFromTopLeft(this.highlightedHut.location.latitude, this.highlightedHut.location.longitude)
    let x = (this.zoomedIn ? 0 : hutSize / (2 * this.mapSize.w)) + coords.x / this.mapWidth
    let y = (this.zoomedIn ? 0 : hutSize / (2 * this.mapSize.h)) + coords.y / this.mapHeight
    this.hutIndicatorLeft = 'calc(' + (100 * x).toFixed(2) + '% - ' + (this.zoomedIn ? 5 : 14) + 'px)'
    this.hutIndicatorTop = 'calc(' + (100 * y).toFixed(2) + '% -  ' + (this.zoomedIn ? 5 : 14) + 'px)'
  }

  updateLocIndicator(data, self) {
    this.foundLocation = true
    let coords = self.coordinatesInMetersFromTopLeft(data['coords'].latitude, data['coords'].longitude)
    self.locIndicatorLeft = 'calc(' + (100 * coords.x / self.mapWidth).toFixed(2) + '% - 14px)'
    self.locIndicatorTop = 'calc(' + (100 * coords.y / self.mapHeight).toFixed(2) + '% - 14px)'
    if (self.isSavingLocation && !self.hasZoomedInToLocation && !self.zoomedIn && +new Date() < self.pageOpenTime + 1000) {
      let rect = self.canvas.canvas.getBoundingClientRect()
      self.zoomIn(coords.x / this.mapWidth * rect.width, coords.y / this.mapHeight * rect.height)
      self.hasZoomedInToLocation = true
    }
  }

  zoomClick(event) {
    this.zoomedInFromHutHighlight = false
    let rect = document.getElementById("zoomable").getBoundingClientRect()
    let x = event.pageX - rect.left
    let y = event.pageY - rect.top
    if (this.zoomedIn) {
      let cvw = this.canvas.canvas.getBoundingClientRect().width / (this.zoomFactor ** 2)
      let cvh = this.canvas.canvas.getBoundingClientRect().height / (this.zoomFactor ** 2)
      x /= this.zoomFactor
      x += this.currentZoomX - cvw / 2
      y /= this.zoomFactor
      y += this.currentZoomY - cvh / 2
    }
    if (this.zoomedIn && !this.isSavingLocation) this.zoomOut()
    else {
      if (this.isSavingLocation) {
        this.hasSelectedLocation = true
        let lat = this.topLeftLat - y / rect.height * (this.topLeftLat - this.bottomRightLat)
        let lng = this.topLeftLng + x / rect.width * (this.bottomRightLng - this.topLeftLng)
        this.selectedLocation = new Parse.GeoPoint(lat, lng)
        this.selectionHighlightLeft = 'calc(' + (100 * x / rect.width) + '% - 8px)'
        this.selectionHighlightTop = 'calc(' + (100 * y / rect.height) + '% - 16px)'
      }
      this.zoomIn(x, y)
    }
  }

  zoomOut() {
    this.zoomedIn = false
    this.zoomLeft = '0px'
    this.zoomTop = '0px'
    this.updateHighlightIndicator()
  }

  zoomIn(zoomX, zoomY) {
    let canvasWidth = this.canvas.canvas.getBoundingClientRect().width / (this.zoomedIn ? this.zoomFactor : 1)
    let canvasHeight = this.canvas.canvas.getBoundingClientRect().height / (this.zoomedIn ? this.zoomFactor : 1)
    if (zoomX > canvasWidth || zoomY > canvasHeight || zoomX < 0 || zoomY < 0) return
    this.zoomLeft = this.zoomFactor * (canvasWidth / 2 - zoomX) + 'px'
    this.zoomTop = this.zoomFactor * (canvasHeight / 2 - zoomY) + 'px'
    this.zoomedIn = true
    this.currentZoomX = zoomX
    this.currentZoomY = zoomY
    this.updateHighlightIndicator()
  }

  closeModal() {
    this.showModal = false;
    let self = this
    setTimeout(function () {
      self.showModalHigh = false
    }, 400);
  }

  async dontShowAgain() {
    await this.storage.set('dontShowLocationModalAgain', true)
    this.closeModal()
  }

  ngOnDestroy() {
    this.locationSubscription.unsubscribe();
  }

  async saveLocation() {
    let result = await this.g.apiCall('saveHutLocation', {
      hutNr: this.hutNr,
      lat: this.selectedLocation.latitude,
      lng: this.selectedLocation.longitude
    })

    if (result.response == 'success') {
      if (this.savingFromButton) {
        this.hutNr = ''
        this.isSavingLocation = false
        this.savingFromButton = false
        this.hasSelectedLocation = false
        this.zoomOut()
      } else {
        this.g.hutLocationChangeStatus = 'success'
        this.navCtrl.pop({ animate: true, animation: "ios-transition", direction: 'back' })
        let self = this;
        setTimeout(function () {
          self.g.hutLocationChangeStatus = 'done'
        }, 2000)
      }
    } else {
      alert(result.response)
    }
  }

  startEditing() {
    if (!this.hutNr || this.hutNr.length < 3) return
    this.isSavingLocation = true
    this.savingFromButton = true
  }
}
