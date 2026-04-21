# 🧭 Haxaplor – Codefest'25 @ IIT BHU

## 🌾 Occamy: Streamlining Rural Field Operations in India

**Team Name:** BROZZZZ  
**Event:** Haxaplor, Codefest'25  
**Institute:** Indian Institute of Technology (BHU) Varanasi

---

## 📌 Problem Statement

Rural field teams in India rely on **unstructured WhatsApp communication** – task assignments, progress reports, geo-tagged photos, and issues all mixed in chaotic chats. This results in:

- Lost information & no audit trail  
- Delayed decision-making  
- Zero accountability for field staff  
- Impossible to scale operations beyond 10–20 people  

**Occamy** transforms this chaos into a **structured, mobile-first tracking system** – bridging the gap between WhatsApp convenience and operational rigour.

---

## 🚀 Our MVP Solution

We built a **lightweight web + WhatsApp-integrated system** that works on low-end phones and spotty networks. The MVP (shown in `1000047663.png`) includes:

- 📨 **WhatsApp message parser** – forward a message to our number, and it auto-creates a task/report  
- 🗂️ **Task board** – assign, update, and track field tasks  
- 📍 **Location + photo capture** (via WhatsApp or web form)  
- 📊 **Manager dashboard** – real-time view of pending/completed tasks  
- 🔌 **Offline-first sync** – uses SQLite (`occamy.db`) for local data persistence  
- 📱 **Responsive UI** – works on any smartphone browser

---

## 🛠️ Tech Stack (as per your codebase)

| Component        | Technology                          |
|-----------------|--------------------------------------|
| Frontend         | HTML5, CSS3, Vanilla JS (`script.js`, `style.css`) |
| Backend          | Node.js + Express (`server.js`)      |
| Database         | SQLite3 (`occamy.db`)                |
| WhatsApp Bridge  | Twilio / WhatsApp Business API (webhook) |
| Deployment       | Local / any Node.js host (Render, Railway) |

---

## 📂 Project Structure (from your files)




---

## 📄 File Details

### `server.js` – Backend Heart
- Sets up **Express.js** server  
- Defines REST API endpoints:  
  - `GET /tasks` – fetch all tasks  
  - `POST /tasks` – create new task  
  - `PUT /tasks/:id` – update task status  
  - `POST /whatsapp-webhook` – receive incoming WhatsApp messages  
- Initializes and interacts with `occamy.db` (SQLite)  
- Serves static files (`index.html`, `style.css`, `script.js`)  

### `occamy.db` – Structured Data Store
- Contains tables like:
  - `tasks` (id, title, description, assignee, status, location, created_at)  
  - `reports` (id, task_id, media_url, text, timestamp)  
  - `field_agents` (phone, name, zone)  
- No external database required – runs locally or on any Node.js host.

### `index.html` – Manager Dashboard
- Responsive, mobile-first HTML  
- Displays task board, pending/completed tasks, and form to add new tasks  
- Embedded JavaScript to call backend APIs via `script.js`

### `script.js` – Frontend Logic
- Fetches tasks from `server.js` and renders them  
- Handles form submissions (new task, status update)  
- Polls or uses WebSocket (optional) for real-time updates  
- Works offline via browser cache (basic PWA features)

### `style.css` – Mobile UI
- CSS Grid / Flexbox for clean layout on small screens  
- Designed for low-bandwidth, touch-friendly buttons  
- Dark/light mode optional (not required for MVP)

### `package.json` – Dependencies
- Key packages: `express`, `sqlite3`, `twilio` (or `@whapi/wa`), `dotenv`  
- Scripts: `npm start` runs `node server.js`

### `.gitattributes`
- Ensures consistent line endings (LF vs CRLF) when collaborating across Windows/Linux/Mac.

---


