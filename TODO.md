# App feedback en aandachtspunten uit 2021 (door Stan)
- Kunnen we misschien geen bandjes bestellen met nummers 1-50, 101-150, 201-250, 301-350? Want dan wordt het erg verwarrend wanneer je zoekt op 201, bedoel je dan kind met bandje 201 of kind met hutje 201?
- Hutjes plattegrond toevoegen met gps en alles
- Meer statistieken/grafieken toevoegen
- Swipe is back op iPhone
- De hele app in wijk thema? Meteen vragen bij startup
- In-app links moeten toegevoegd worden voor de mail aan stan (bevestigen van admins) en de mail aan nieuwe appgebruikers
- Waarschuwings-modal in presence, voor als je na dinsdag nog kinderen aanwezig meldt zonder hutnummer

## Webshop verbeterpunten voor 2022
- De webshop moet standaard landen bij de registreer pagina (na welkom), alleen als er een cookie bestaat van "heeftGeregistreerd" niet. Er hoeft geen cookie-waarschuwing, want het zijn functionele cookies
- Ticket pdf moet louter een QR code zijn, no more user data
- De e-mail bevestigingspagina moet even customized worden voor enkel appgebruikers
- Ticket niet meer kunnen aanpassen in webshop nadat ie een wristband heeft
- Er gebeurt iets heel geks als je een order van één kaartje laat expireren, dan kan je alsnog een tweede toevoegen ofzo


### Twijfel voor 2022
- De statusbar op de statistiekenpagina kleurt niet mee op iPhone...raar. Lastig op te lossen (bug in cordova, misschien iets updaten dan maar?)
- Kijken of alle buttons een beetje schappelijk op de homepagina kunnen passen. ik vrees dat het heel krap wordt...
- De change-wristband pagina eruit halen? Hij is enigszins buggy, ik heb alleen Sjoerd hem zien gebruiken, en je kan een polsbandje ook gewoon wijzigen door een kindje te zoeken en op polsbandje wijzigen te klikken


### Gefixt voor 2022
- Gefixt: “E-mailadres nog niet bevestigd” mist een refresh knop
- Gefixt: Op de “waitingforadmin” pagina verdwijnt de uitloggen knop wanneer “loading”, doe maar niet
- Gefixt: Soms staat er nog voornaam in plaats van Roepnaam, pas op, anders wordt Henrieke boos
- Gefixt: Geboortedatum automatisch opslaan als dd-mm-jjjj, 1-1-2012 is nu wel goed, maar sla die aub op als 01-01-2012
- Gefixt: add-wristband: suggesties toevoegen “wil je nummer x+1 toewijzen?” als je net nummer x toegewezen hebt, want meestal zijn je nummers opeenvolgend. Klein puntje natuurlijk, maar terwijl je 400 bandjes uitdeelt verzin je nog eens iets
- Gefixt: Weerberichtje en wijk-stats op homepage lokaal wél ff cachen
- Gefixt: Admin/registreer procedure moet makkelijker kunnen. Standaard moet je niet bij login, maar bij registreren in de app landen
- Gefixt: Na het registreren in de app kom je meteen in de admin tabel met je naam, maar nog niet met confirmed, dat kunnen Stephan en ik alleen
- Gefixt: Je moet in het admin beheer paneel ook kunnen typen, want sommigen hebben al een account (van buiten de app) dat alleen nog niet in de Admin tabel staat
- Gefixt: Auto-focus de input in de add-child-to-hut modal
- Gefixt (maar iPhone luistert niet): Zoekpagina modal status bar meekleuren (zie screenshot, statusbalk is lelijk)
- Gefixt: “Opslaan” in aanwezigheid wordt “aanwezig”
- Gefixt? Mailgun Hotmail gezeik…
- Gefixt: Je moet emailverified checken in check-if-admin. (en daarna mag je hem cachen in de Admin tabel zelf, mits de admin confirmed is)
- Gefixt: Stuur stan, niet Stephan aub, een mail zodra er een aanmelding voor een admin is geweest
- Gefixt: Het zou leuk zijn als je ook kunt verwijderen uit de admin tabel, en boven die tabel zit nu te veel padding. En boven die headers te weinig
- Gefixt: Status bar op iPhone is gefixt ineens? Behalve bij search child modal. Maar dat komt wss omdat er hutnr staat ipv hutNr met hoofdletter N
- Gefixt: Android build met —prod ipv —release
- Gefixt: iOS scroll overflow op homepagina uitzetten 
- Gefixt: Link in e-mail bevestigen werkt niet op prod
- Gefixt: Inloggen/registreren formulier moet props krijgen voor autofill
- Gefixt: Mailtje over admin aan stan werd niet verstuurd in prod
- Gefixt: Verversen knoppen kan weer weg bij emailverified 
- Gefixt: De “Het is xx•C” wordt afgehakt
- Gefixt: Splashscreendelay waarom 2500? Gewoon weghalen voor snellere launch?
- Gefixt: ShowSplashScreenSpinner mag sowieso uit
- Gefixt: AutoHideSplashScreen??
- Gefixt: Addadmin adhv email gaat niet goed als er geen user gevonden kan worden. Ook niet als er wel een user gevonden wordt. “Cannot read property 'set' of undefined”
- Gefixt: Navigatie naar e-mail-confirmation mag props meegeven waarnaar wordt geluisterd, want ze worden toch wel gecorrigeerd indien onjuist
- Gefixt: Verjaardagen toevoegen
- Gefixt: Statistieken pagina alle wijken in 1x zien
- Gefixt: In zoekpagina modal moet linkerkolom breder
- Gefixt: Verjaardagen: tekst past moeizaam, icoontje verder naar links en tekst ook, “wordt XX” misschien naar beneden, de headers “dinsdag … aug” enzo moeten naar links
- Gefixt: Splashscreendelay omlaag naar 750 ofzo?
- Gefixt: Statistieken pagina refresh knop erbij
- Gefixt: Aan/afwezig melden vanaf zoekpagina


# App feedback en aandachtspunten 2019 (door Stan)
**Het belangrijkste volgens velen: de app goed vooraf testen a.u.b. Iedereen was tevreden over de functionaliteiten, maar het zou leuk zijn als alles dinsdagochtend meteen al werkte natuurlijk ;)**
## Gefixt:
- Week-programma dat leiding-gecentreerd is 
    - is momenteel alleen aan te passen door mijzelf (en evt. Stephan)
- Clear data zodra je wijkkeuze aanpast (Stan)
- Koppel kind aan hut op dinsdag = aanwezig melden op dinsdag
- Scan ticket op dinsdag = aanwezig melden op dinsdag
- Vergemakkelijk polsbandjes wijzigen (Stan)
- Fotogalerij met links naar de albums en bijlagen met links naar bijv. de takenlijst
- Aanwezigheid melden vergemakkelijken zodat je sneller door kan (Twan en Stan)


## Lage prioriteit wijzigingen
- Geschiedenis van hutNr aanpassingen (Twan; ze waren een kind kwijt nadat hij overgeplaatst was) (eigen schuld dikke bult, toch? misschien automatisch een back-upje draaien elk uur anders). Inmiddels toegevoegd, net als zoekgeschiedenis, change-wristband wijzigingsgeschiedenis, etc.


## Nog te doen in 2020 zelf:
- Vast team opstellen van 8-10 mensen zodat ik meer overzicht en controle heb over wie de app gebruikt met welke update en zodat ik makkelijker instructies kan geven en misschien ook een vaste persoon/kraam/plaats waar kinders nieuwe polsbandjes halen (Stan)
- Maandagavond alvast de app installeren op zo veel mogelijk apparaten; op z'n minst de wijkhoofden/-nekken
- Je kunt nu zoeken op voornaam óf achternaam, maar het is natuurlijk wel zo handig als je op beide achter elkaar zou kunnen zoeken (e.g.: nu zoek je "stan", of "van Baarsen", maar als je "Stan van Baarsen" zoekt, vind je niks. is raar). gefixt in 2021
- Hopelijk kan ik in 2020 ook zelf de database beheren vanaf mijn laptop en het liefst ook de Play Store
- De login-check is er nu uit gecomment, maar moet er zeker weer in in de production versie. gefixt in 2021
- Meer reserve polsbandjes kopen (725 in totaal misschien?) want kinderen raken die dingen bizar snel kwijt

## Website feedback:
- Informatie van kinderen aanpassen is ingewikkeld (volgens veel ouders)

## wip fastlane
- https://ionic.zone/fastlane/build-your-project-with-ionic-plugin
- https://medium.com/practo-engineering/build-distribution-automation-with-fastlane-and-travis-ci-ios-f959dff2799f
- https://codesigning.guide/
- https://docs.fastlane.tools/codesigning/getting-started/
- https://zach.codes/ios-builds-using-github-actions-without-fastlane
