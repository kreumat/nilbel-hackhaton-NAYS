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
