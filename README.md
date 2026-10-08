# 🏫 Little Explorers Montessori Academy Website

A full-stack Montessori school web application built with **HTML5, CSS3, Vanilla JavaScript**, **Python Flask**, **Flask-SQLAlchemy**, and **Flask-JWT-Extended**.

---

## 🎨 Features & Design Highlights

* **Colorful Montessori Theme**:
  * English Alphabet showcase: **A B C D** in large, vibrant typography.
  * Devanagari Script cards: **क ख ग घ** displayed prominently throughout the site.
  * Number Tiles: **1 2 3 4** presented as colorful counting blocks.
* **Child-Friendly Aesthetics**:
  * Rounded cards, soft shadows, pill buttons, floating cloud/star/balloon micro-animations.
  * Google Fonts: **Baloo 2**, **Nunito**, **Poppins**.
* **Public Website Pages**:
  1. **Home Page (`index.html`)**: Hero section, Montessori philosophy, age-group program overview, latest events, gallery preview, learning resources, contact quick info.
  2. **About Us (`about.html`)**: School story, Mission, Vision, Montessori approach, Core values, Why Choose Us.
  3. **Programs (`programs.html`)**: Toddler Program (1.5-3 yrs), Primary Program (3-6 yrs), and Elementary Program (6-12 yrs) with age groups, objectives, activities, and highlights.
  4. **Gallery (`gallery.html`)**: Photo & video gallery with category filter tabs (Learning, Activities, Events, Art) and lightbox popup.
  5. **Resources (`resources.html`)**: Downloadable materials (PDF worksheets for Devanagari script tracing, English phonics alphabet cards, math counting blocks, parent handbooks).
  6. **Events & News (`events.html`)**: School bulletins, announcements, dates, featured images, notice badges.
  7. **Contact Us (`contact.html`)**: Interactive contact form sending inquiries to backend database, address, phone, email, Google Maps iframe embed, social links.
* **Secure Admin Portal (`admin.html`)**:
  * JWT-authenticated Admin login (`Flask-JWT-Extended`, password hashing with Werkzeug).
  * Auto session expiration and inactivity timeout after 15 minutes.
  * Responsive Admin Dashboard tabs for CRUD management:
    * **Programs Management**: Add, edit, delete age-group programs.
    * **Resources Management**: Upload PDF/document files or URLs, manage categories, delete.
    * **Gallery Management**: Upload photos/videos, assign categories, add captions, delete.
    * **Events & News Management**: Create & publish events with featured image uploads, date picker, important notice flag, and **Rich Text Editor**.
    * **Contact Submissions**: View parent inquiry messages, email, phone number, date, mark as read, delete.

---

## 🛠 Project Structure

```text
montessori-school/
│
├── client/
│   ├── index.html
│   ├── about.html
│   ├── programs.html
│   ├── gallery.html
│   ├── resources.html
│   ├── events.html
│   ├── contact.html
│   ├── admin.html
│   │
│   ├── css/
│   │   ├── style.css
│   │   ├── responsive.css
│   │   └── admin.css
│   │
│   ├── js/
│   │   ├── main.js
│   │   ├── api.js
│   │   ├── auth.js
│   │   └── admin.js
│   │
│   └── assets/
│
├── server/
│   ├── app.py
│   ├── config.py
│   ├── models.py
│   ├── database.py
│   ├── init_db.py
│   │
│   ├── routes/
│   │   ├── auth.py
│   │   ├── resources.py
│   │   ├── gallery.py
│   │   ├── events.py
│   │   ├── programs.py
│   │   └── contact.py
│   │
│   ├── utils/
│   │   ├── auth.py
│   │   └── file_upload.py
│   │
│   └── requirements.txt
│
├── uploads/
│   ├── resources/
│   ├── gallery/
│   └── events/
│
├── .env
├── .env.example
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Activate Python Virtual Environment
Navigate to the project root directory and activate the virtual environment:

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Linux/macOS:**
```bash
source venv/bin/activate
```

### 2. Install Requirements (if needed)
```bash
pip install -r server/requirements.txt
```

### 3. Run the Flask Web Application
Run `server/app.py`:

```bash
python -m server.app
```

The app will start on: **`http://127.0.0.1:5000`**

On initial startup, the backend automatically initializes SQLite database `server/montessori.db` and seeds initial programs, gallery items, resources, events, and the default administrator account.

---

## 🔑 Admin Credentials

* **Username / Email**: `admin` or `admin@montessori.edu`
* **Password**: `admin123`

Access the Admin Portal at: **`http://127.0.0.1:5000/admin.html`**

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/login` | Admin JWT login | No |
| `GET` | `/api/auth/me` | Fetch logged-in admin profile | Yes |
| `GET` | `/api/programs` | Get all programs | No |
| `POST` | `/api/programs` | Add new program | Yes |
| `PUT` | `/api/programs/<id>` | Update program | Yes |
| `DELETE` | `/api/programs/<id>` | Delete program | Yes |
| `GET` | `/api/resources` | List downloadable resources | No |
| `POST` | `/api/resources` | Upload new resource | Yes |
| `DELETE` | `/api/resources/<id>` | Delete resource | Yes |
| `GET` | `/api/gallery` | List gallery items | No |
| `POST` | `/api/gallery` | Upload photo/video to gallery | Yes |
| `DELETE` | `/api/gallery/<id>` | Delete gallery item | Yes |
| `GET` | `/api/events` | List events & news | No |
| `POST` | `/api/events` | Publish event/announcement | Yes |
| `PUT` | `/api/events/<id>` | Update event | Yes |
| `DELETE` | `/api/events/<id>` | Delete event | Yes |
| `POST` | `/api/contact` | Submit contact form | No |
| `GET` | `/api/contact` | List contact form submissions | Yes |
| `DELETE` | `/api/contact/<id>` | Delete contact submission | Yes |

---

## 📝 License
This project is open-source under the MIT License.
