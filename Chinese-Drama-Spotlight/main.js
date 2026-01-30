 
    const firebaseConfig = {
      apiKey: "AIzaSyAcCn0NGbakHmLEa_G47K8OepGaRqTV02Q",
      authDomain: "duydodeesport.firebaseapp.com",
      projectId: "duydodeesport",
      storageBucket: "duydodeesport.appspot.com",
      messagingSenderId: "435929814225",
      appId: "1:435929814225:web:fcb01803d9e5b77340e1f0",
      measurementId: "G-JD1MFCNLY0"
    };
    
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    
    const moviesGrid = document.getElementById('movies_grid');
    const dubbedSeriesGrid = document.getElementById('dubbed_series_grid');
    const verticalSeriesGrid = document.getElementById('vertical_series_grid');
    const heroBanner = document.getElementById('hero_banner');

    const createCard = (content) => {
        const card = document.createElement('a');
        card.className = 'movie-card';
        card.href = `movie-detail.html?id=${content.id}`;
        card.innerHTML = `
            <img src="${content.poster}" alt="${content.title} Poster">
            <div class="movie-title">${content.title}</div>
        `;
        return card;
    };

    const renderGrid = (gridElement, contentList, emptyMessage) => {
        gridElement.innerHTML = '';
        if (contentList.length > 0) {
            contentList.forEach(content => gridElement.appendChild(createCard(content)));
        } else {
            gridElement.innerHTML = `<p class="empty-grid-message">${emptyMessage}</p>`;
        }
    }

    async function loadAllContent() {
        try {
            const moviesSnapshot = await db.collection('movies').orderBy('createdAt', 'desc').get();
            const allContent = [];
            moviesSnapshot.forEach(doc => {
                allContent.push({ id: doc.id, ...doc.data() });
            });

            // Set Hero Banner with the latest content's banner
            if (allContent.length > 0 && allContent[0].banner) {
                heroBanner.style.backgroundImage = `linear-gradient(to top, rgba(13,13,13,1), rgba(13,13,13,0.3)), url("${allContent[0].banner}")`;
            }

            const categorized = { movie: [], chinese_series_dubbed: [], chinese_series_vertical: [] };

            allContent.forEach(content => {
                if (categorized[content.category]) {
                    categorized[content.category].push(content);
                } else {
                    categorized.movie.push(content); // Fallback
                }
            });

            renderGrid(moviesGrid, categorized.movie, 'ยังไม่มีภาพยนตร์แนะนำ');
            renderGrid(dubbedSeriesGrid, categorized.chinese_series_dubbed, 'ยังไม่มีซีรีส์พากย์ไทย');
            renderGrid(verticalSeriesGrid, categorized.chinese_series_vertical, 'ยังไม่มีซีรีส์แนวตั้ง');

        } catch (error) {
            console.error("Error loading content:", error);
            const errorMessage = '<p class="empty-grid-message">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
            moviesGrid.innerHTML = errorMessage;
            dubbedSeriesGrid.innerHTML = errorMessage;
            verticalSeriesGrid.innerHTML = errorMessage;
        }
    }

    loadAllContent();

