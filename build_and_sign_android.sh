ionic cordova build android --release --aot false --environment prod --output-hashing all --sourcemaps false --extract-css true --named-chunks false --build-optimizer true --minifyjs=true --minifycss=true --optimizejs=true
mv ./platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk android-release-unsigned.apk
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore -storepass timmerdorp2019 android-release-unsigned.apk alias_name
rm -f timmerdorp.apk
./zipalign.exe -v 4 android-release-unsigned.apk timmerdorp.apk
C:/Users/stanv/AppData/Local/Android/Sdk/build-tools/28.0.3/apksigner.bat sign --v2-signing-enabled false  --ks my-release-key.keystore --ks-key-alias alias_name "C:\Users\stanv\Desktop\Timmerdorp\Timmerdorp App\timmerdorp.apk"
C:/Users/stanv/AppData/Local/Android/Sdk/build-tools/28.0.3/apksigner.bat sign --ks my-release-key.keystore --ks-key-alias alias_name "C:\Users\stanv\Desktop\Timmerdorp\Timmerdorp App\timmerdorp.apk"
keytool -printcert -jarfile timmerdorp.apk
C:/Users/stanv/AppData/Local/Android/Sdk/build-tools/28.0.3/apksigner.bat verify -v --print-certs "C:\Users\stanv\Desktop\Timmerdorp\Timmerdorp App\timmerdorp.apk"
C:/Users/stanv/AppData/Local/Android/Sdk/build-tools/28.0.3/apksigner.bat verify -v "C:\Users\stanv\Desktop\Timmerdorp\Timmerdorp App\timmerdorp.apk"
