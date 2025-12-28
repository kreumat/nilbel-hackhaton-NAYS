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

## Özellikler

- **Anlık Doluluk**: Gerçek zamanlı ziyaretçi sayıları
- **AI Asistan**: Sohbet tabanlı mekan önerileri
- **Rota Hesaplama**: OSRM destekli ulaşım süreleri
- **ML Sayım**: YOLOv8 tabanlı kişi algılama

## Teknoloji Yığını

- **Front End**: HTML, CSS, JavaScript, Leaflet.js
- **Back End**: Statik JSON, OSRM API
- **ML**: Python, YOLOv8, OpenCV
