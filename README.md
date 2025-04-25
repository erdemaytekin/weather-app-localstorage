# 🌤️ Hava Durumu Uygulaması

Kullanıcının şehir ismi girerek anlık hava durumunu görebildiği, **OpenWeatherMap API** destekli, **animasyonlu** ve **responsive** bir web uygulamasıdır.

---

## 🚀 Özellikler

- 🔍 Şehir ismi ile anlık sorgulama
- 🌈 Canlı arka planlar: Güneş, bulutlar, yağmur
- ☁️ Hava durumuna özel efektler (örneğin yağmur yağınca damlalar)
- 🌙 Gece Modu (19:00 – 06:00 arasında otomatik)
- 🌐 Türkçe açıklamalar (API'den gelen açıklamalar otomatik çevrilir)
- 📦 localStorage ile son sorgulanan şehri hatırlama
- 📱 Mobil uyumlu tasarım



## 🧠 Nasıl Çalışır?

1. Kullanıcı şehir ismi girer ve sorgular.
2. `getWeather()` fonksiyonu çalışır, API'den veri alınır.
3. Gelen veri `displayWeatherData()` ile sayfaya yazılır.
4. Hava durumuna göre `.rainy`, `.sunny` gibi sınıflar atanır.
5. Yağmurluysa `createRaindrops()` ile damlalar oluşturulur.
6. Saat gece ise `updateTimeBasedEffects()` ile `night-mode` sınıfı eklenir.
7. Son sorgulanan şehir `localStorage`'a kaydedilir, sayfa yeniden açıldığında otomatik getirilir.

---

## 💻 Kullanılan Teknolojiler

- **HTML5** – Yapı iskeleti
- **CSS3** – Görsel tasarım ve animasyon
- **JavaScript** – API iletişimi ve dinamik içerik
- **OpenWeatherMap API** – Hava durumu verisi
- **Font Awesome** – İkonlar
- **Google Fonts** – Yazı tipi (Poppins)

---


