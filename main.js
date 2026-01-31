import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAcCn0NGbakHmLEa_G47K8OepGaRqTV02Q",
  authDomain: "duydodeesport.firebaseapp.com",
  projectId: "duydodeesport",
  storageBucket: "duydodeesport.appspot.com",
  messagingSenderId: "435929814225",
  appId: "1:435929814225:web:fcb01803d9e5b77340e1f0",
};

const app = initializeApp(firebaseConfig, 'mainApp');
const db = getFirestore(app);

const moviesGrid = document.getElementById('movies_grid');
const dubbedSeriesGrid = document.getElementById('dubbed_series_grid');
const verticalSeriesGrid = document.getElementById('vertical_series_grid');
const heroBanner = document.getElementById('hero_banner');
const heroTitle = document.getElementById('hero-title');
const heroSubtitle = document.getElementById('hero-subtitle');
const searchInput = document.getElementById('search-input');

let allContent = [];

const createCard = (content) => {
    const card = document.createElement('a');
    card.className = 'movie-card';

    if (content.category === 'chinese_series_vertical') {
        card.href = `vertical-watch.html?id=${content.id}`;
    } else {
        card.href = `watch.html?id=${content.id}`;
    }

    card.innerHTML = `
        <img src="${content.poster}" alt="${content.title} Poster">
        <div class="movie-info">
            <div class="movie-title">${content.title}</div>
        </div>
    `;
    return card;
};

const renderGrid = (gridElement, contentList, emptyMessage) => {
    if (!gridElement) return;
    gridElement.innerHTML = '';
    if (contentList.length > 0) {
        contentList.forEach(content => gridElement.appendChild(createCard(content)));
    } else {
        gridElement.innerHTML = `<p class="empty-grid-message">${emptyMessage}</p>`;
    }
}

async function loadAllContent() {
    try {
        const moviesCollection = collection(db, 'movies');
        const q = query(moviesCollection, orderBy('createdAt', 'desc'));
        const moviesSnapshot = await getDocs(q);
        
        allContent = moviesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (allContent.length > 0) {
            const latestItem = allContent.find(item => item.banner) || allContent[0];
            if (heroBanner && latestItem.banner) {
                heroBanner.style.backgroundImage = `url("${latestItem.banner}")`;
            }
            if (heroTitle) heroTitle.textContent = latestItem.title;
            if (heroSubtitle) heroSubtitle.textContent = latestItem.desc || 'โลกแห่งความบันเทิงคมชัดส่งตรงถึงหน้าจอคุณ';
        } else {
            if (heroTitle) heroTitle.textContent = 'คลังภาพยนตร์และซีรีส์สุดยิ่งใหญ่';
            if (heroSubtitle) heroSubtitle.textContent = 'รับชมฟรี อัปเดตใหม่ทุกวัน ครบทุกรสชาติ';
        }

        filterAndRenderContent();

    } catch (error) {
        console.error("Error loading content:", error);
        const errorMessage = '<p class="empty-grid-message">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
        if(moviesGrid) moviesGrid.innerHTML = errorMessage;
        if(dubbedSeriesGrid) dubbedSeriesGrid.innerHTML = errorMessage;
        if(verticalSeriesGrid) verticalSeriesGrid.innerHTML = errorMessage;
    }
}

function filterAndRenderContent() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredContent = searchTerm
        ? allContent.filter(content => content.title.toLowerCase().includes(searchTerm))
        : allContent;

    const categorized = { movie: [], chinese_series_dubbed: [], chinese_series_vertical: [] };

    filteredContent.forEach(content => {
        if (content.category && categorized[content.category]) {
            categorized[content.category].push(content);
        }
    });
    
    renderGrid(moviesGrid, categorized.movie, 'ไม่พบภาพยนตร์ที่ค้นหา');
    renderGrid(dubbedSeriesGrid, categorized.chinese_series_dubbed, 'ไม่พบซีรีส์พากย์ไทยที่ค้นหา');
    renderGrid(verticalSeriesGrid, categorized.chinese_series_vertical, 'ไม่พบซีรีส์แนวตั้งที่ค้นหา');
}

if(searchInput) {
    searchInput.addEventListener('input', filterAndRenderContent);
}

document.addEventListener('DOMContentLoaded', loadAllContent);
