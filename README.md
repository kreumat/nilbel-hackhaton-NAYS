2025 27 Aralık Nilüfer Yapay Zeka Hackathonu Birinci Sıra

Anı olması için public olarak bırakıyorum. Heyt be!
Yusuf Terzi / Metin Torun

Siz bir de sunumu görecektiniz!

# NAYS – Nilüfer Akıllı Yoğunluk Sistemi

Nilüfer Belediyesi için geliştirilmiş **gerçek zamanlı mekan doluluk takip sistemi**.

---

## 🚀 Hızlı Başlangıç (Windows)

1. **Node.js yükleyin**  
   https://nodejs.org adresinden indirip kurun.

2. **Projeyi başlatın**  
   `start.bat` dosyasına çift tıklayın.

3. **Tarayıcıdan erişin**
   - Ana Sayfa: http://localhost:3000/main/
   - NAYS Uygulaması: http://localhost:3000/nays/

---

## 📁 Proje Yapısı

```text
nilbel/
├── main/                   # Ana sayfa
│   ├── index.html
│   └── nilbel-assets/
│
├── nays/                   # NAYS web uygulaması
│   ├── index.html          # Ana arayüz
│   ├── nays.js             # Temel işlevler
│   ├── nays.css            # Stiller
│   ├── ai_config.js        # AI asistan ayarları
│   ├── osrm_service.js     # Rota servisleri
│   └── data.json           # Mekan verileri
│
├── nays-ml/                # ML kişi sayma modülü
│   ├── main.py             # Kamera ile sayım
│   ├── test.py             # Video ile sayım
│   └── requirements.txt
│
└── start.bat               # Windows başlatıcı
```

---

## ⭐ Genel Özellikler

- **Anlık Doluluk:** Gerçek zamanlı ziyaretçi sayıları  
- **AI Asistan:** Sohbet tabanlı mekan önerileri  
- **Rota Hesaplama:** OSRM destekli ulaşım süreleri  
- **ML Sayım:** YOLOv8 tabanlı kişi algılama  

---

## 🧰 Teknoloji Stack’i

### Front End
- HTML
- CSS
- JavaScript
- Leaflet.js

### Back End
- Statik JSON
- OSRM API

### Makine Öğrenmesi (ML)
- Python 3.11.9
- YOLOv8
- OpenCV

---

## 🐍 Python / ML Modülü

### Venv (Virtual Environment) Nedir?
Projeye özel kütüphaneleri sistemden izole şekilde yönetmeni sağlayan sanal çalışma ortamıdır.

---

### 🐧 Linux Kurulum ve Aktivasyon

```bash
cd nays-ml
python3 -m venv venv
source venv/bin/activate
```

---

### 🪟 Windows Kurulum ve Aktivasyon

```powershell
cd nays-ml
python -m venv venv
venv\Scripts\activate
```

---

### ▶️ Çalıştırma Komutları

**Webcam ile kişi sayımı**
```bash
python main.py
```

**Test videosu ile sayım**
```bash
python test.py
```

---

## 🌐 NAYS Web Uygulaması Özellikleri

### 🏢 Mekan Takibi
- Gerçek zamanlı doluluk oranları
- 4 mekan kategorisi: Kütüphane, Kafe, Müze, Lokanta
- Mekan detay sayfası
- Saatlik yoğunluk grafikleri

### 🤖 Yapay Zeka Asistan
- Sohbet tabanlı akıllı öneriler
- Gemini 2.0 Flash API entegrasyonu
- Açık/kapalı durumu ve doluluk bilgisi

### 📍 Konum ve Rota
- Leaflet.js ile harita tabanlı konum seçimi
- OSRM API ile gerçekçi seyahat süresi
- Mesafeye göre otomatik sıralama
- Varış anındaki tahmini doluluk hesabı

### 🎯 Kullanıcı Deneyimi (UX)
- Tam duyarlı (responsive) tasarım
- Kategori, doluluk, mesafe ve isme göre filtreleme
- Akıllı öneri banner’ı
- Google Maps benzeri yol tarifi entegrasyonu

---

## 🔧 Teknik Detaylar

- **Altyapı:** Vanilla JavaScript
- **Veri Yapısı:** JSON tabanlı
- **Hosting:** Statik hosting uyumlu
- **Kod Mimarisi:** Modüler ve sürdürülebilir
