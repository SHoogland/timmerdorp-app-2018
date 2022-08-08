import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { GlobalFunctions } from '../../providers/global';
import { Storage } from '@ionic/storage';
import { ConnectChildToCabinPage } from '../connect-child-to-cabin/connect-child-to-cabin';

@Component({
  selector: 'page-hutjes-map',
  templateUrl: 'hutjes-map.html'
})
export class HutjesMapPage {
  showHighlight: boolean;
  preventHome: boolean;
  hutNotFound: boolean;
  loading: boolean;

  defaultSize: number;
  mapHeight: number; // same but from top to bottom
  mapWidth: number; // distance from leftmost to rightmost point on the map, in meters
  hutNr: number;

  title: string;

  locationSubscription: any;
  hutjes: any;
  canvas: any;

  constructor(
    public navCtrl: NavController,
    public httpClient: HttpClient,
    public g: GlobalFunctions,
    public storage: Storage,
    public geolocation: Geolocation
  ) {
    this.loading = true;
    this.preventHome = false
    this.title = "Hutjeskaart"
  }

  ionViewDidEnter() {
    this.init();
  }

  init() {
    let self = this;

    this.g.enableZooming()

    this.g.apiCall('getHutjesMap').then(async function (result) {
      self.loading = false;
      if (!result || result.response !== 'success') {
        return;
      }
      self.hutjes = result.hutjes
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
      self.canvas.drawImage(img, 0, 0, w, h)

      // 52.610468, 4.695963 = bottom right map coordinates
      let coords = self.coordinatesInMetersFromTopLeft(52.610468, 4.695963)
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
        self.updateLocationIndicator(data['coords'].latitude, data['coords'].longitude, self)
      })
      self.startLocationPolling()
    })
    img.src = '/assets/imgs/tdorp-map.png'
  }

  coordinatesInMetersFromTopLeft(lat, lng) {
    // 52.611791, 4.693581 = top left map coordinates
    let baseX = 4.693581
    let baseY = 52.611791
    let earthCircumference = 40075 * 1000;
    let mapWidthInDegrees = lng - baseX
    let x = mapWidthInDegrees * earthCircumference / 360 * Math.cos(52.611 / 180 * Math.PI)
    let mapHeightInDegrees = baseY - lat
    let y = mapHeightInDegrees * earthCircumference / 360;
    return { x, y }
  }

  startLocationPolling() {
    let self = this;
    self.locationSubscription = this.geolocation.watchPosition({ enableHighAccuracy: true }).subscribe(function (data) {
      self.updateLocationIndicator(data['coords'].latitude, data['coords'].longitude, self)
    });
  }

  updateLocationIndicator(lat, lng, ctx, hutHighlight = false, targetSize = null) {
    if (ctx.navCtrl.getActive().pageRef().nativeElement.tagName !== 'PAGE-HUTJES-MAP') return

    let coords = ctx.coordinatesInMetersFromTopLeft(lat, lng)
    let x = coords.x / ctx.mapWidth * ctx.canvas.canvas.getBoundingClientRect().width
    let y = coords.y / ctx.mapHeight * ctx.canvas.canvas.getBoundingClientRect().height

    let indicator = document.getElementById(hutHighlight ? 'hutHighlight' : 'locationIndicator')
    let indicatorSize = 28;
    let left = x - (hutHighlight ? targetSize : 0.5 * indicatorSize)
    let top = (hutHighlight ? indicatorSize : (0.5 * indicatorSize)) + y
    indicator.style.left = left + 'px'
    indicator.style.top = top + 'px'
  }

  searchHut(hutNr) {
    this.hutNotFound = false
    if (hutNr.length != 3) {
      this.showHighlight = false
      return
    }

    let hut = this.hutjes.filter((item) => item.hutNr == hutNr)[0]
    if (!hut) {
      this.hutNotFound = true
      return
    }
    this.updateLocationIndicator(hut.location.latitude, hut.location.longitude, this, true, hut.size || this.defaultSize)
    this.showHighlight = true
  }

  ngOnDestroy() {
    this.g.disableZooming();
    this.locationSubscription.unsubscribe();
  }
}
