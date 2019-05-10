import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { Geolocation } from '@ionic-native/geolocation';

declare var google;


@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

// variáveis usadas no login/cadastro
  nome: string;
  private PATH = 'usuarios';
  uid: string;

// variável utilizada no mapa
  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer();
  map: any;
  startPosition: any;
  originPosition: string;
  destinationPosition: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afAuth: AngularFireAuth,
    private toast: ToastController,
    private db: AngularFireDatabase,
    private geolocation: Geolocation
    ){}

    ionViewDidLoad(){
      this.exibeUser();
      this.initializeMap();
    }

    initializeMap(){
      this.geolocation.getCurrentPosition()
      .then((res) => {
        this.startPosition = new google.maps.LatLng(res.coords.latitude, res.coords.longitude);

        const mapOptions = {
          zoom: 18,
          center: this.startPosition,
          disableDefaultUI: true
        }

        this.map = new google.maps.Map(document.getElementById('map'), mapOptions);
        this.directionsDisplay.setMap(this.map);

        const Marker = new google.maps.Marker({
          position: this.startPosition,
          map: this.map
        });

      }).catch((err) => {
        console.log('Vish mano, deu ruim', err);
      });
    }

    calculateRoute(){
      if(this.destinationPosition && this.startPosition){
        const request = {
          origin: this.startPosition,
          destination: this.destinationPosition,
          travelMode: 'DRIVING'
        };
        this.traceRoute(this.directionsService, this.directionsDisplay, request);
      }
    }

    traceRoute(service: any, display: any, request: any){
      service.route(request, function(result, status){
        if(status == 'OK'){
          display.setDirections(result);
        }
      });
    }

  // ionViewDidLoad() {
  //   this.exibeUser();
  //   this.geolocation.getCurrentPosition()
  //     .then((res) => {
  //       const position = new google.maps.LatLng(res.coords.latitude, res.coords.longitude);

  //       const mapOpcoes = {
  //         zoom: 16,
  //         center: position,
  //         disableDefaultUI: true
  //       }

  //       this.map = new google.maps.Map(document.getElementById('map'), mapOpcoes);

  //       const marker = new google.maps.Marker({
  //         position: position,
  //         map: this.map
  //       });

  //     }) .catch((err) => {
  //       this.toast.create({
  //         message: 'Puts parça, infelizmente não conseguimos pegar a sua localização',
  //         duration: 6000
  //       }).present();
  //     });
  // }

  exibeUser(){
    this.afAuth.authState.subscribe(data => {
      if (data && data.email && data.uid) {
        this.uid = data.uid;

        let listDB = this.db.database.ref('/tasks').child(this.uid);
        listDB.on('value', (snapshot) => {
          const items = snapshot.val();
          console.log(items);
        })

        this.toast.create({
          message: `Boas vindas ${data.email}`,
          duration: 3000
        }).present();
      } else {
        this.toast.create({
          message: 'Não foi possível autenticar.',
          duration: 3000
        }).present();
      }
    });
  }

}
