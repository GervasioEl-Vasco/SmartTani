#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// KONFIGURASI WIFI & FIREBASE
#define WIFI_SSID "Firdaus Family"
#define WIFI_PASSWORD "Malikha123"
#define API_KEY "KsYAKBj028xvR5gP2kjaPE9SefbtP9RjfGqlN3Jb"
#define DATABASE_URL "https://smarttani-a4a11-default-rtdb.asia-southeast1.firebasedatabase.app" 

// DEFINISI PIN
#define DHT_TYPE DHT22
#define PIN_DHT 4
#define PIN_SOIL 35       // Analog (ADC1)
#define PIN_PH 32         // Analog (ADC1)
#define PIN_DS1820 33     // Digital (OneWire)
#define PIN_TDS 34        // Analog (ADC1)

#define PIN_RELAY_POMPA 5
#define PIN_RELAY_KIPAS 18
#define PIN_RELAY_TIRAI 19

// INISIALISASI OBJEK 
DHT dht(PIN_DHT, DHT_TYPE);
OneWire oneWire(PIN_DS1820);
DallasTemperature sensors(&oneWire);

FirebaseData fbdo;
FirebaseData fbdo_read; // Objek khusus untuk membaca status relay
FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;
bool signupOK = false;

// Variabel Kalibrasi (Sesuaikan dengan hardware Anda)
const int DRY_SOIL = 4095; // Nilai saat kering (di udara)
const int WET_SOIL = 1500; // Nilai saat di air
float calibration_factor_ph = 3.5; // Contoh faktor kalibrasi pH

void setup() {
  Serial.begin(115200);

  // Init Pin Relay (Output)
  pinMode(PIN_RELAY_POMPA, OUTPUT);
  pinMode(PIN_RELAY_KIPAS, OUTPUT);
  pinMode(PIN_RELAY_TIRAI, OUTPUT);
  
  // Matikan Relay saat start (Asumsi Active HIGH, ubah ke HIGH jika Active LOW)
  digitalWrite(PIN_RELAY_POMPA, LOW); 
  digitalWrite(PIN_RELAY_KIPAS, LOW);
  digitalWrite(PIN_RELAY_TIRAI, LOW);

  // Init Sensor
  dht.begin();
  sensors.begin(); // DS18B20

  // Koneksi WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Menghubungkan ke Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println("\nTerhubung IP: " + WiFi.localIP().toString());

  // Config Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  // Sign up
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Firebase Auth Aman");
    signupOK = true;
  } else {
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  // Cek koneksi & Timer (Kirim setiap 2 detik)
  if (Firebase.ready() && signupOK) {
    
    // --- BAGIAN 1: BACA SENSOR & KIRIM (Setiap 3 Detik) ---
    if (millis() - sendDataPrevMillis > 3000 || sendDataPrevMillis == 0) {
      sendDataPrevMillis = millis();

      // 1. Baca DHT22 (Suhu & Lembab Ruang)
      float t_ruang = dht.readTemperature();
      float h_ruang = dht.readHumidity();
      
      // 2. Baca DS18B20 (Suhu Tanah)
      sensors.requestTemperatures(); 
      float t_tanah = sensors.getTempCByIndex(0);

      // 3. Baca Soil Moisture (Persentase)
      int soil_analog = analogRead(PIN_SOIL);
      int soil_percent = map(soil_analog, DRY_SOIL, WET_SOIL, 0, 100);
      soil_percent = constrain(soil_percent, 0, 100); // Batasi 0-100

      // 4. Baca pH (Konversi Sederhana)
      int ph_analog = analogRead(PIN_PH);
      // Rumus pH butuh kalibrasi manual tegangan vs nilai pH
      float voltage_ph = ph_analog * (3.3 / 4095.0); 
      float ph_val = 7.0 + ((2.5 - voltage_ph) * calibration_factor_ph); 

      // 5. Baca TDS (Kualitas Air) - Dummy Calculation based on Analog
      int tds_analog = analogRead(PIN_TDS);
      float tds_val = tds_analog * 0.5; // Perlu rumus library TDS Gravity sesungguhnya

      // Cek Error Pembacaan
      if (isnan(t_ruang)) t_ruang = 0;
      if (isnan(h_ruang)) h_ruang = 0;
      if (t_tanah == -127.00) t_tanah = 0; // Error kabel DS18B20 lepas

      // Siapkan JSON
      FirebaseJson json;
      json.set("suhu_ruangan", t_ruang);
      json.set("kelembaban_ruangan", h_ruang);
      json.set("ph_air", ph_val);
      json.set("suhu_tanah", t_tanah);
      json.set("kelembaban_tanah", soil_percent);
      json.set("kualitas_air", tds_val);

      Serial.print("Kirim Data Sensor... ");
      if (Firebase.RTDB.setJSON(&fbdo, "/sensors", &json)) {
        Serial.println("OK");
      } else {
        Serial.println("Gagal: " + fbdo.errorReason());
      }
    }

    // --- BAGIAN 2: BACA STATUS ALAT (CONTROL DARI REACT) ---
    // React menulis ke path "/devices" (kipas, pompa, atap)
    // ESP32 membaca path tersebut untuk nyalakan Relay
    
    if (Firebase.RTDB.getJSON(&fbdo_read, "/devices")) {
      FirebaseJson &jsonRead = fbdo_read.jsonObject();
      FirebaseJsonData jsonData;

      // 1. KONTROL KIPAS
      jsonRead.get(jsonData, "kipas");
      if (jsonData.success()) {
        bool status = jsonData.to<bool>();
        digitalWrite(PIN_RELAY_KIPAS, status ? HIGH : LOW);
        // Serial.println(status ? "Kipas ON" : "Kipas OFF");
      }

      // 2. KONTROL POMPA
      jsonRead.get(jsonData, "pompa");
      if (jsonData.success()) {
        bool status = jsonData.to<bool>();
        digitalWrite(PIN_RELAY_POMPA, status ? HIGH : LOW);
      }

      // 3. KONTROL ATAP/TIRAI
      jsonRead.get(jsonData, "atap");
      if (jsonData.success()) {
        bool status = jsonData.to<bool>();
        digitalWrite(PIN_RELAY_TIRAI, status ? HIGH : LOW);
      }
    }
  }
}