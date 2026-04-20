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
