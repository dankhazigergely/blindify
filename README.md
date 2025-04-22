# Blindify

Ez a Blindify alkalmazás fejlesztői környezetének indításához és beállításához készült útmutató.

## Fejlesztői környezet indítása

A projekt két fő részből áll: `backend` (FastAPI) és `frontend` (Vue 3 + Vite).

### 1. Backend (FastAPI)

#### Virtuális környezet létrehozása (ajánlott)
A backend fejlesztéséhez javasolt egy Python virtuális környezet használata:

```bash
python3 -m venv venv
source venv/bin/activate
```

#### Függőségek telepítése
A backend Python 3.11+ verziót igényel. A szükséges csomagokat a `backend/requirements.txt` alapján telepítheted:

```bash
cd backend
pip install -r requirements.txt
```

#### Környezeti változók
A `backend/.env` fájlban add meg a Spotify API adataidat:

```
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:8000/callback
TOKEN_ENCRYPTION_KEY=  # hagyd üresen, ha automatikus kulcsgenerálást szeretnél
```

#### Indítás
```bash
python main.py
```
A backend alapértelmezetten a `localhost:8000` címen fog futni.

### 2. Frontend (Vue 3 + Vite)

#### Függőségek telepítése
A frontend mappában telepítsd a szükséges node modulokat:

```bash
cd frontend
npm install
```

#### Indítás
```bash
npm run dev
```
A frontend alapértelmezetten a `localhost:5000` címen lesz elérhető.

## Összefoglalás
1. Állítsd be a szükséges környezeti változókat a `backend/.env` fájlban.
2. (Ajánlott) Hozz létre egy virtuális környezetet a backend-hez, és aktiváld.
3. Telepítsd a backend függőségeit a requirements.txt alapján.
4. Indítsd el a backend-et Pythonból.
5. Indítsd el a frontend-et npm-mel.

Ha kérdésed van vagy hibába ütközöl, ellenőrizd a konzolban megjelenő üzeneteket, vagy keresd fel a fejlesztőt.
