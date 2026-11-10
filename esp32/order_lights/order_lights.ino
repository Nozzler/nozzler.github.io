// 3D Print Desk order lights. Polls Supabase every 5 minutes and drives 3 LEDs (+ optional buzzer).
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>

const char* WIFI_SSID    = "Ziggo3879023";
const char* WIFI_PASS    = "7zpfxnuaJneewbee";
const char* SUPABASE_URL = "https://sfjsyybuwiycgceyfvmc.supabase.co";
const char* ANON_KEY     = "sb_publishable_B8e-sIyrP5tqV0jyrxhJEQ_ZpEMl9Oy";
const char* DEVICE_KEY   = "a18eea7971684cadaf426f5adc482282";   // select value from app_secrets where key='device_key';
const int   SOON_DAYS    = 2;                    // "due soon" window
const unsigned long POLL_MS = 5UL * 60UL * 1000UL;
const unsigned long RETRY_MS = 30UL * 1000UL;

const int LED_NEW = 25, LED_PAID = 26, LED_URGENT = 27;
const int BUZZER = -1;                           // set a pin number to enable beeps

int nNew = 0, nPaid = 0, nSoon = 0, nLate = 0, fails = 0, lastNewTotal = -1;
unsigned long lastPoll = 0, waitMs = 0;

int field(const String& s, const char* k) {
  String key = String("\"") + k + "\":";
  int i = s.indexOf(key);
  return i < 0 ? 0 : s.substring(i + key.length()).toInt();
}

void beep(int n) {
  if (BUZZER < 0) return;
  for (int i = 0; i < n; i++) { digitalWrite(BUZZER, HIGH); delay(150); digitalWrite(BUZZER, LOW); delay(150); }
}

bool connectWifi() {
  if (WiFi.status() == WL_CONNECTED) return true;
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  for (int i = 0; i < 40 && WiFi.status() != WL_CONNECTED; i++) delay(500);
  return WiFi.status() == WL_CONNECTED;
}

bool poll() {
  if (!connectWifi()) return false;
  WiFiClientSecure client;
  client.setInsecure();   // only counts are sent; for strict TLS pin the root CA here instead
  HTTPClient http;
  http.setTimeout(15000);
  if (!http.begin(client, String(SUPABASE_URL) + "/rest/v1/rpc/device_status")) return false;
  http.addHeader("apikey", ANON_KEY);
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(String("{\"k\":\"") + DEVICE_KEY + "\",\"soon_days\":" + SOON_DAYS + "}");
  if (code != 200) { Serial.printf("HTTP %d\n", code); http.end(); return false; }
  String body = http.getString();
  http.end();
  Serial.println(body);
  nNew = field(body, "new_orders") + field(body, "accepted");
  nPaid = field(body, "paid_open");
  nSoon = field(body, "due_soon");
  nLate = field(body, "overdue");
  if (lastNewTotal >= 0 && nNew > lastNewTotal) beep(3);
  lastNewTotal = nNew;
  return true;
}

void setup() {
  Serial.begin(115200);
  int pins[] = {LED_NEW, LED_PAID, LED_URGENT};
  for (int p : pins) { pinMode(p, OUTPUT); digitalWrite(p, HIGH); }
  if (BUZZER >= 0) pinMode(BUZZER, OUTPUT);
  delay(600);
  for (int p : pins) digitalWrite(p, LOW);
  lastPoll = millis();
  if (poll()) waitMs = POLL_MS; else { fails = 1; waitMs = RETRY_MS; }
}

void loop() {
  if (millis() - lastPoll >= waitMs) {
    lastPoll = millis();
    if (poll()) { fails = 0; waitMs = POLL_MS; } else { fails++; waitMs = RETRY_MS; }
  }
  bool blink = (millis() / 500) % 2;
  if (fails >= 3) {                                  // offline: all three blink together
    digitalWrite(LED_NEW, blink); digitalWrite(LED_PAID, blink); digitalWrite(LED_URGENT, blink);
    delay(50); return;
  }
  digitalWrite(LED_NEW, nNew > 0);
  digitalWrite(LED_PAID, nPaid > 0);
  digitalWrite(LED_URGENT, nLate > 0 ? HIGH : (nSoon > 0 ? blink : LOW));
  delay(50);
}
