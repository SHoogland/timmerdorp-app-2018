# App feedback en aandachtspunten uit 2021 (door Stan)
- Registreer/inlog formuliertje mag ff wat netter, statusbalk kleuren daar ook
- De hele app in wijk thema? Meteen vragen bij startup
- Deeplinks werken nog niet op Android
- Wachtwoord vergeten pagina in app

## Webshop verbeterpunten voor 2022
- Ticket niet meer kunnen aanpassen in webshop nadat ie een wristband heeft
- Er gebeurt iets heel geks als je een order van één kaartje laat expireren, dan kan je alsnog een tweede toevoegen ofzo
- Corona-maatregelen (leeftijd t/m 12, ID-kaart mee, roepnaam vs volledige voornaam, etc.) weghalen? hopelijk?
- Even kijken of de checkboxes wat netter kunnen in het ticketformulier
- Webshop ticket qr code misschien niet per pdf sturen maar per base64 img gewoon in de e-mail body? maakt emails verzenden waarschijnlijk een stuk sneller


## Twijfel voor 2022
- Hutjes plattegrond toevoegen met gps
- Kunnen we misschien geen bandjes bestellen met nummers 1-50, 101-150, 201-250, 301-350? Want dan wordt het erg verwarrend wanneer je zoekt op 201, bedoel je dan kind met bandje 201 of kind met hutje 201?


## Gefixt voor 2022
- Bij het confirmen van je e-mail vanuit de app kom je nog niet in de admin tabel? erg raar
- Als je al een account hebt gemaakt in de webshop, en vervolgens inlogt via de app, dan kom je alsnog niet helemaal lekker in de Admin table
- De webshop moet standaard landen bij de registreer pagina (na welkom), alleen als er een cookie bestaat van "heeftGeregistreerd" niet
- De change-wristband pagina eruit halen? Hij is enigszins buggy, ik heb alleen Sjoerd hem zien gebruiken, en je kan een polsbandje ook gewoon wijzigen door een kindje te zoeken en op polsbandje wijzigen te klikken
- Kijken of alle buttons een beetje schappelijk op de homepagina kunnen passen. ik vrees dat het heel krap wordt...
- Swipe is back op iPhone
- Meer statistieken/grafieken toevoegen
  - Hierbij misschien ook iets meer navigatie tovoegen, dus knoppen om in de grafiek alleen de totalen te laten zien, of uitgesplitst per wijk, of alleen alles tussen 8:30 en 11:30, etc
- “E-mailadres nog niet bevestigd” mist een refresh knop
- Op de “waitingforadmin” pagina verdwijnt de uitloggen knop wanneer “loading”, doe maar niet
- Soms staat er nog voornaam in plaats van Roepnaam, pas op, anders wordt Henrieke boos
- Geboortedatum automatisch opslaan als dd-mm-jjjj, 1-1-2012 is nu wel goed, maar sla die aub op als 01-01-2012
- add-wristband: suggesties toevoegen “wil je nummer x+1 toewijzen?” als je net nummer x toegewezen hebt, want meestal zijn je nummers opeenvolgend. Klein puntje natuurlijk, maar terwijl je 400 bandjes uitdeelt verzin je nog eens iets
- Weerberichtje en wijk-stats op homepage lokaal wél ff cachen
- Admin/registreer procedure moet makkelijker kunnen. Standaard moet je niet bij login, maar bij registreren in de app landen
- Na het registreren in de app kom je meteen in de admin tabel met je naam, maar nog niet met confirmed, dat kunnen Stephan en ik alleen
- Je moet in het admin beheer paneel ook kunnen typen, want sommigen hebben al een account (van buiten de app) dat alleen nog niet in de Admin tabel staat
- Auto-focus de input in de add-child-to-hut modal
- Gefixt (maar iPhone luistert niet): Zoekpagina modal status bar meekleuren (zie screenshot, statusbalk is lelijk)
- “Opslaan” in aanwezigheid wordt “aanwezig”
- Gefixt? Mailgun Hotmail gezeik…
- Je moet emailverified checken in check-if-admin. (en daarna mag je hem cachen in de Admin tabel zelf, mits de admin confirmed is)
- Stuur stan, niet Stephan aub, een mail zodra er een aanmelding voor een admin is geweest
- Het zou leuk zijn als je ook kunt verwijderen uit de admin tabel, en boven die tabel zit nu te veel padding. En boven die headers te weinig
- Status bar op iPhone is gefixt ineens? Behalve bij search child modal. Maar dat komt wss omdat er hutnr staat ipv hutNr met hoofdletter N
- Android build met —prod ipv —release
- iOS scroll overflow op homepagina uitzetten 
- Link in e-mail bevestigen werkt niet op prod
- Inloggen/registreren formulier moet props krijgen voor autofill
- Mailtje over admin aan stan werd niet verstuurd in prod
- Verversen knoppen kan weer weg bij emailverified 
- De “Het is xx•C” wordt afgehakt
- Splashscreendelay waarom 2500? Gewoon weghalen voor snellere launch?
- ShowSplashScreenSpinner mag sowieso uit
- AutoHideSplashScreen??
- Addadmin adhv email gaat niet goed als er geen user gevonden kan worden. Ook niet als er wel een user gevonden wordt. “Cannot read property 'set' of undefined”
- Navigatie naar e-mail-confirmation mag props meegeven waarnaar wordt geluisterd, want ze worden toch wel gecorrigeerd indien onjuist
- Verjaardagen toevoegen
- Statistieken pagina alle wijken in 1x zien
- In zoekpagina modal moet linkerkolom breder
- Verjaardagen: tekst past moeizaam, icoontje verder naar links en tekst ook, “wordt XX” misschien naar beneden, de headers “dinsdag … aug” enzo moeten naar links
- Splashscreendelay omlaag naar 750 ofzo?
- Statistieken pagina refresh knop erbij
- Aan/afwezig melden vanaf zoekpagina
- In statistieken ook weeskinderen laten zien, zonder hutje 
- Suggesties in scan ticket zoals “bandje 2” moet bandje 002 zijn
- scan-ticket “already has wristband” pop-up heeft te lage z-index? Ik zie hem alleen als ik weg navigeer
- Connect child to hut modal “geen zoekresultaten” toevoegen
- Statistieken loading spinner hidden property moet ook ff luisteren naar refreshing 
- In statistieken, linkerkolom misschien fixed houden? En bij badmeesterbattle dan de bovenste kolom fixed houden
- Vanuit zoekpagina modal wegklikken hoort ook de statusbar anders te kleuren
- E-mail verifiëren voor app gaat toch niet goed
- E-mailadres bij app info?
- Als checkifadmin gebeurt en stan heeft nog geen melding ervan, stuur melding
- cleanTable is nu #fff maar hoort een soort crème kleur te hebben zoals de achtergrond
- In-app links moeten toegevoegd worden voor de mail aan stan (bevestigen van admins) en de mail aan nieuwe appgebruikers
- Waarschuwings-modal in presence, voor als je na dinsdag nog kinderen aanwezig meldt zonder hutnummer
- Registratieverzoek e-mail link aan stan moet nog werken, zet daar ook ff een e-mailadresje in van van wie het account is
- Het zou wel nice zijn als Stephan en ik ook gegevens konden wijzigen van kindjes
- Niet alle weer icoontjes werken
- Search modal werkt net niet helemaal goed wat z-indices betreft op de zoekpagina als je op een zoek link klikt terwijl ie al open staat
- “Sluiten & aanwezig melden” moet soms “Sluiten & afwezig melden” zijn


### Gefixt in Webshop
- Ticket pdf moet alleen een QR code zijn, no more user data





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
- Vast team opstellen van 8-10 mensen zodat ik meer overzicht en controle heb over wie de app gebruikt met welke update en zodat ik makkelijker instructies kan geven (Stan)
- Maandagavond alvast de app installeren op zo veel mogelijk apparaten; op z'n minst de wijkhoofden/-nekken
- Je kunt nu zoeken op voornaam óf achternaam, maar het is natuurlijk wel zo handig als je op beide achter elkaar zou kunnen zoeken (e.g.: nu zoek je "stan", of "van Baarsen", maar als je "Stan van Baarsen" zoekt, vind je niks. is raar). gefixt in 2021
- Hopelijk kan ik in 2020 ook zelf de server-code beheren vanaf mijn laptop en het liefst ook de Play Store
- De login-check is er nu uit gecomment, maar moet er zeker weer in in de production versie.
- Meer reserve polsbandjes kopen (725 in totaal misschien?) want kinderen raken die dingen bizar snel kwijt

## Website feedback:
- Informatie van kinderen aanpassen is ingewikkeld (volgens veel ouders)

## wip fastlane
- https://ionic.zone/fastlane/build-your-project-with-ionic-plugin
- https://medium.com/practo-engineering/build-distribution-automation-with-fastlane-and-travis-ci-ios-f959dff2799f
- https://codesigning.guide/
- https://docs.fastlane.tools/codesigning/getting-started/
- https://zach.codes/ios-builds-using-github-actions-without-fastlane
