# NAYS - Nilüfer Akıllı Yoğunluk Sistemi

Nilüfer Belediyesi için gerçek zamanlı mekan doluluk takip sistemi.

## Hızlı Başlangıç (Windows)

1. **Node.js yükleyin**: https://nodejs.org adresinden indirin ve kurun
2. **`start.bat`** dosyasına çift tıklayın
3. Tarayıcınızda açın:
   - Ana sayfa: http://localhost:3000/main/
   - NAYS: http://localhost:3000/nays/

## Proje Yapısı

```
nilbel/
├── main/                   # Ana sayfa
│   ├── index.html
│   └── nilbel-assets/
│
├── nays/                   # NAYS web uygulaması
│   ├── index.html          # Ana arayüz
│   ├── nays.js             # Temel işlevler
│   ├── nays.css            # Stiller
│   ├── ai_config.js        # AI asistan ayarları
│   ├── osrm_service.js     # Rota servisleri
│   └── data.json           # Mekan verileri
│
├── nays-ml/                # ML kişi sayma modülü
│   ├── main.py             # Kamera ile sayım
│   ├── test.py             # Video ile sayım
│   └── requirements.txt
│
└── start.bat               # Windows başlatıcı
```

## Özellikler

- **Anlık Doluluk**: Gerçek zamanlı ziyaretçi sayıları
- **AI Asistan**: Sohbet tabanlı mekan önerileri
- **Rota Hesaplama**: OSRM destekli ulaşım süreleri
- **ML Sayım**: YOLOv8 tabanlı kişi algılama

## Stack

- **Front End**: HTML, CSS, JavaScript, Leaflet.js
- **Back End**: Statik JSON, OSRM API
- **ML**: Python 3.11.9, YOLOv8, OpenCV

İstediğin talimatlar aşağıdadır:

**Venv (Virtual Environment) Nedir?**
Projelerin gerektirdiği kütüphaneleri ve bağımlılıkları sistem genelinden ayrı (izole) tutmanı sağlayan sanal bir çalışma ortamıdır.

### Linux için Kurulum ve Aktivasyon Adımları

**1. Proje Klasörüne Git**
Öncelikle terminalde proje dizinine geçiş yap:

```bash
cd nays-ml

```

**2. Sanal Ortamı (venv) Oluştur**
Klasör içerisinde `venv` adında sanal bir ortam yarat:

```bash
python3 -m venv venv

```

**3. Sanal Ortamı Aktifleştir**
Oluşturduğun ortamı aktif hale getir:

```bash
source venv/bin/activate

```

### Çalıştırma Adımları

**Webcam ile görüntü tanıma için:**

```bash
python main.py

```

**Test videosu için:**

```bash
python test.py

```

### Windows için Kurulum ve Aktivasyon

**1. Proje Klasörüne Git**
Terminali aç ve proje dizinine git:

```powershell
cd nays-ml

```

**2. Sanal Ortamı (venv) Oluştur**

```powershell
python -m venv venv

```

**3. Sanal Ortamı Aktifleştir**
Windows'ta `Scripts` klasörü altındaki komutu çalıştır:

```powershell
venv\Scripts\activate

```

*(Satır başında `(venv)` ibaresini görmelisin.)*

---

### Çalıştırma Adımları

**Webcam ile görüntü tanıma için:**

```powershell
python main.py

```

**Test videosu için:**

```powershell
python test.py

```

Harika bir proje taslağı gibi görünüyor. İşte **NAYS Web Uygulaması** özelliklerinin Markdown formatında düzenlenmiş hali:

# 🚀 NAYS Web Uygulaması Özellikleri

## 🏢 Mekan Takibi

* **Gerçek Zamanlı Doluluk Oranları:** Anlık veri akışı ile canlı takip.
* **Kategorilendirme:** 4 farklı mekan kategorisi (Kütüphane, Kafe, Müze, Lokanta).
* **Mekan Detay Sayfası:** Kapasite, çalışma saatleri ve açık adres bilgileri.
* **Saatlik Yoğunluk Grafiği:** Geçmiş verilere dayalı yoğunluk analizi.

## 🤖 Yapay Zeka Asistan

* **Akıllı Sohbet:** Sohbet tabanlı, kişiselleştirilmiş mekan önerileri.
* **API Entegrasyonu:** `Gemini 2.0 Flash API` ile güçlendirilmiş altyapı.
* **Dinamik Durum Bilgisi:** Mekanın açık/kapalı durumu ve doluluk oranı hakkında anlık bilgi.

## 📍 Konum ve Rota

* **Konum Seçimi:** `Leaflet.js` altyapısı ile harita üzerinden kolay konum belirleme.
* **Gerçek Seyahat Süresi:** `OSRM API` kullanılarak hesaplanan gerçekçi varış süreleri.
* **Akıllı Sıralama:** Mesafeye göre otomatik listeleme.
* **Geleceğe Dönük Tahmin:** Varış anındaki tahmini doluluk oranının hesaplanması.

## 🎯 Kullanıcı Deneyimi (UX)

* **Duyarlı Tasarım (Responsive):** Tüm mobil cihazlarla tam uyumlu arayüz.
* **Filtreleme ve Sıralama:**
* Kategori bazlı filtreleme.
* Doluluk, mesafe veya isme göre sıralama seçenekleri.


* **Akıllı Öneri Banner'ı:** Kullanıcıya o anki en az yoğun mekanı öneren dinamik alan.
* **Navigasyon:** Google Maps ile doğrudan yol tarifi entegrasyonu.

## 🔧 Teknik Özellikler

* **Altyapı:** Saf JavaScript (Framework bağımsız/Vanilla JS).
* **Veri Yapısı:** JSON tabanlı hafif ve hızlı veri mimarisi.
* **Hosting:** Sunucu kurulumu gerektirmeyen statik hosting yapısı.
* **Kod Mimarisi:** Geliştirilebilir ve yönetilebilir modüler kod yapısı.

---

**Bununla ne yapmak istersiniz?**
Eğer bu özellikleri bir `README.md` dosyasına dönüştürmemi veya proje sunumu için bir taslak hazırlamamı isterseniz yardımcı olabilirim.
