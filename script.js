// --- State Management ---
const API_URL = ''; // Relative for same origin
let currentUser = null;
let userLocation = { lat: null, lng: null };
let activityDrafts = [];

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    
    // Check for existing session
    const token = localStorage.getItem('occamy_token');
    if (token) {
        // In a real app, verify token. Here we just route based on saved role.
        const role = localStorage.getItem('occamy_role');
        const username = localStorage.getItem('occamy_user');
        currentUser = { role, username };
        routeUser(role);
    }

    // Login Handler
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.innerHTML = 'Logging in...';
        
        try {
            const res = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: document.getElementById('username').value,
                    password: document.getElementById('password').value
                })
            });
            
            const data = await res.json();
            if (data.auth) {
                localStorage.setItem('occamy_token', data.token);
                localStorage.setItem('occamy_role', data.role);
                localStorage.setItem('occamy_user', data.username);
                currentUser = data;
                routeUser(data.role);
            } else {
                document.getElementById('login-error').innerText = data.error || 'Login failed';
            }
        } catch (err) {
            document.getElementById('login-error').innerText = 'Network Error';
        } finally {
            btn.innerHTML = 'Login to System';
        }
    });

    // Activity Form Handler
    document.getElementById('activity-form').addEventListener('submit', submitActivity);
});

// --- Routing ---
function routeUser(role) {
    document.getElementById('login-view').classList.remove('active');
    document.getElementById('admin-view').classList.remove('active');
    document.getElementById('distributor-view').classList.remove('active');

    if (role === 'admin') {
        document.getElementById('admin-view').classList.add('active');
        loadAdminStats();
    } else {
        document.getElementById('distributor-view').classList.add('active');
        document.getElementById('user-greeting').innerText = currentUser.username;
        initGeolocation();
        loadMyLogs();
    }
}

function logout() {
    localStorage.clear();
    location.reload();
}

// --- Admin Dashboard Logic ---
async function loadAdminStats() {
    const token = localStorage.getItem('occamy_token');
    
    // Show skeleton
    document.getElementById('skeleton-loader').classList.remove('hidden');
    document.getElementById('dashboard-content').classList.add('hidden');

    try {
        const res = await fetch(`${API_URL}/api/stats`, {
            headers: { 'Authorization': token }
        });
        const data = await res.json();

        // Populate Data
        document.getElementById('stat-users').innerText = data.users;
        document.getElementById('stat-meetings').innerText = data.meetings;
        document.getElementById('stat-sales').innerText = data.sales;
        document.getElementById('stat-samples').innerText = data.samples;
        document.getElementById('map-officer-count').innerText = data.users;

        // Populate Activity List
        const list = document.getElementById('activity-list');
        list.innerHTML = '';
        data.recent.forEach(act => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${act.username}</strong> logged a ${act.type}
                <small>${new Date(act.timestamp).toLocaleTimeString()} • ${act.lat ? 'GPS Tracked' : 'No Location'}</small>
            `;
            list.appendChild(li);
        });

    } catch (err) {
        console.error("Failed to load stats", err);
    } finally {
        // Hide skeleton, show content
        setTimeout(() => {
            document.getElementById('skeleton-loader').classList.add('hidden');
            document.getElementById('dashboard-content').classList.remove('hidden');
        }, 800); // Artificial delay for effect
    }
}

// --- Distributor Logic ---
function initGeolocation() {
    const statusEl = document.getElementById('gps-status');
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation.lat = position.coords.latitude;
                userLocation.lng = position.coords.longitude;
                
                statusEl.innerHTML = `
                    <div class="gps-pulse"></div>
                    <span>GPS Active: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}</span>
                `;
                statusEl.classList.add('active');
                
                // Update modal inputs
                document.getElementById('display-lat').innerText = userLocation.lat.toFixed(4);
                document.getElementById('display-lng').innerText = userLocation.lng.toFixed(4);
            },
            (error) => {
                statusEl.innerHTML = `<span style="color:red">GPS Error: ${error.message}</span>`;
            },
            { enableHighAccuracy: true }
        );
    } else {
        statusEl.innerHTML = `<span style="color:red">GPS Not Supported</span>`;
    }
}

function openModal(type) {
    document.getElementById('modal').classList.add('active');
    document.getElementById('modal-title').innerText = `Log ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    document.getElementById('activity-type').value = type;
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    document.getElementById('activity-form').reset();
}

async function submitActivity(e) {
    e.preventDefault();
    const token = localStorage.getItem('occamy_token');
    const type = document.getElementById('activity-type').value;
    
    const payload = {
        type: type,
        data: {
            name: document.getElementById('contact-name').value,
            notes: document.getElementById('contact-notes').value
        },
        lat: userLocation.lat,
        lng: userLocation.lng
    };

    try {
        const res = await fetch(`${API_URL}/api/log`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            showToast("Log Saved Successfully");
            closeModal();
            loadMyLogs(); // Refresh list
        } else {
            showToast("Error saving log");
        }
    } catch (err) {
        showToast("Network Error - Saved Locally (Sync pending)");
        // Fallback to local storage for "Offline Mode" hackathon demo
        activityDrafts.push(payload);
        localStorage.setItem('occamy_drafts', JSON.stringify(activityDrafts));
        closeModal();
    }
}

async function loadMyLogs() {
    const token = localStorage.getItem('occamy_token');
    const list = document.getElementById('my-logs-list');
    
    try {
        const res = await fetch(`${API_URL}/api/mylogs`, {
            headers: { 'Authorization': token }
        });
        const logs = await res.json();
        
        if (logs.length === 0) {
            list.innerHTML = '<p class="empty-state">No logs recorded yet.</p>';
            return;
        }

        list.innerHTML = '';
        logs.forEach(log => {
            const div = document.createElement('div');
            div.className = 'log-item';
            div.innerHTML = `
                <div>
                    <div class="log-type">${log.type.toUpperCase()}</div>
                    <div style="font-size:0.8rem; color:#666">${log.data.name}</div>
                </div>
                <div class="log-time">${new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            `;
            list.appendChild(div);
        });
    } catch (err) {
        list.innerHTML = '<p class="empty-state">Offline Mode - Showing Drafts</p>';
    }
}

// --- Carousel Logic ---
function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dotsContainer = document.querySelector('.carousel-dots');
    let currentSlide = 0;

    slides.forEach((_, idx) => {
        const dot = document.createElement('span');
        dot.className = `dot ${idx === 0 ? 'active' : ''}`;
        dot.onclick = () => goToSlide(idx);
        dotsContainer.appendChild(dot);
    });

    function goToSlide(n) {
        slides[currentSlide].classList.remove('active');
        dotsContainer.children[currentSlide].classList.remove('active');
        currentSlide = (n + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        dotsContainer.children[currentSlide].classList.add('active');
        document.querySelector('.carousel-track').style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    setInterval(() => goToSlide(currentSlide + 1), 4000);
}

// --- UI Utilities ---
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}