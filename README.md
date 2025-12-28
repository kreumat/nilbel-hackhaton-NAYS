İşte projenin için en önemli kısımları koruyan, kopyalayıp direkt `README.md` dosyana yapıştırabileceğin derli toplu versiyon:

```markdown
# 🚀 NAYS - Nilüfer Akıllı Yoğunluk Sistemi

**Nilüfer Belediyesi için geliştirilmiş gerçek zamanlı mekan doluluk takip ve yapay zeka destekli öneri sistemi.**

## ⚡ Hızlı Başlangıç (Windows Web)

1. **Node.js Yükleyin**: [nodejs.org](https://nodejs.org)
2. **`start.bat`** dosyasına çift tıklayın.
3. Tarayıcıda açın:
   - **Ana Sayfa:** http://localhost:3000/main/
   - **Uygulama:** http://localhost:3000/nays/

## 📂 Proje Yapısı

```text
nilbel/
├── main/                   # Ana sayfa
├── nays/                   # Web uygulaması (HTML/JS/CSS)
│   ├── ai_config.js        # Gemini AI ayarları
│   └── osrm_service.js     # Rota servisi
├── nays-ml/                # Görüntü işleme (Python/YOLO)
│   ├── main.py             # Webcam sayım
│   └── test.py             # Video sayım
└── start.bat               # Başlatıcı

```

## 🐍 NAYS-ML Kurulumu (Görüntü İşleme)

> **Bilgi (Venv):** Proje bağımlılıklarını sistemden izole tutan sanal çalışma ortamıdır.

### 🐧 Linux / macOS

```bash
cd nays-ml
python3 -m venv venv
source venv/bin/activate
# Çalıştırma:
python main.py  # Webcam
python test.py  # Video

```

### 🪟 Windows

```powershell
cd nays-ml
python -m venv venv
venv\Scripts\activate
# Çalıştırma:
python main.py  # Webcam
python test.py  # Video

```

## ✨ Özellikler ve Teknoloji

### 🏢 Mekan & Rota

* **Anlık Takip:** Kütüphane, Kafe, Müze ve Lokantalar için canlı doluluk.
* **Konum:** `Leaflet.js` harita ve `OSRM API` ile gerçek seyahat süresi.
* **Analiz:** Geçmiş verilere dayalı saatlik yoğunluk grafikleri.

### 🤖 Yapay Zeka (AI)

* **Asistan:** `Gemini 2.0 Flash API` destekli sohbet botu.
* **Dinamik Öneri:** Doluluk ve mesafeye göre akıllı mekan önerileri.

### 🔧 Teknik Stack

* **Front-End:** Saf JavaScript (Vanilla), HTML, CSS.
* **Back-End:** Statik JSON veri yapısı (Sunucusuz).
* **ML:** Python 3.11, YOLOv8, OpenCV.

```

```
