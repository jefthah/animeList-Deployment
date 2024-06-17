document.addEventListener("DOMContentLoaded", function() {
    // Memuat navbar dari komponen HTML eksternal
    fetch('/html/layout/NavbarLogin.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;

            // Initialize menu button for mobile menu
            document.getElementById('menu-button').addEventListener('click', function() {
                var menu = document.getElementById('mobile-menu');
                if (menu.classList.contains('hidden')) {
                    menu.classList.remove('hidden');
                    menu.style.maxHeight = menu.scrollHeight + 'px';
                } else {
                    menu.style.maxHeight = '0';
                    menu.addEventListener('transitionend', function() {
                        menu.classList.add('hidden');
                    }, { once: true });
                }
            });

            // Initialize search input for desktop
            document.getElementById('search-input').addEventListener('input', function() {
                const query = this.value.trim();
                if (query.length > 2) {
                    performSearch(query, 'search-results');
                } else {
                    clearSearchResults('search-results');
                }
            });

            // Initialize search input for mobile
            document.getElementById('mobile-search-input').addEventListener('input', function() {
                const query = this.value.trim();
                if (query.length > 2) {
                    performSearch(query, 'mobile-search-results');
                } else {
                    clearSearchResults('mobile-search-results');
                }
            });

            // Function to perform search
            function performSearch(query, resultContainerId) {
                fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=10`)
                    .then(response => response.json())
                    .then(data => {
                        const searchResults = document.getElementById(resultContainerId);
                        searchResults.innerHTML = ''; // Clear previous results

                        data.data.forEach(anime => {
                            const resultItem = document.createElement('a');
                            resultItem.href = `/html/detailAnime.html?id=${anime.mal_id}&username=${localStorage.getItem('username')}`;
                            resultItem.classList.add('p-2', 'hover:bg-gray-200', 'cursor-pointer', 'flex', 'items-center');
                            resultItem.innerHTML = `
                                <img src="${anime.images.webp.image_url}" alt="${anime.title}" class="w-12 h-12 object-cover inline-block mr-2">
                                <span>${anime.title}</span>
                            `;
                            searchResults.appendChild(resultItem);
                        });

                        searchResults.classList.remove('hidden');
                    })
                    .catch(error => {
                        console.error('Error fetching search results:', error);
                    });
            }

            // Function to clear search results
            function clearSearchResults(resultContainerId) {
                const searchResults = document.getElementById(resultContainerId);
                searchResults.innerHTML = '';
                searchResults.classList.add('hidden');
            }

            // Update user username in the navbar
            function updateUserUsername() {
                const username = localStorage.getItem('username');
                if (username) {
                    const userUsernameElement = document.getElementById('user-username');
                    const mobileUserUsernameElement = document.getElementById('mobile-user-username');
                    userUsernameElement.textContent = username;
                    mobileUserUsernameElement.textContent = username;
                }
            }

            updateUserUsername();
        })
        .catch(error => {
            console.error('Error fetching navbar:', error);
        });

    // Fetch top anime
    function fetchTopAnime() {
        fetch('https://api.jikan.moe/v4/top/anime')
            .then(response => response.json())
            .then(data => {
                const topAnimeContainer = document.getElementById('top-anime');
                topAnimeContainer.innerHTML = ''; // Clear previous results

                data.data.forEach(anime => {
                    const animeItem = document.createElement('div');
                    animeItem.classList.add('p-4', 'bg-gray-800', 'rounded-lg', 'mb-4');
                    animeItem.innerHTML = `
                        <img src="${anime.images.webp.image_url}" alt="${anime.title}" class="w-full h-40 object-cover mb-2 rounded-lg">
                        <h3 class="text-lg font-semibold">${anime.title}</h3>
                    `;
                    topAnimeContainer.appendChild(animeItem);
                });
            })
            .catch(error => {
                console.error('Error fetching top anime:', error);
            });
    }

    // Fetch latest anime
    function fetchLatestAnime() {
        fetch('https://api.jikan.moe/v4/seasons/now')
            .then(response => response.json())
            .then(data => {
                const latestAnimeContainer = document.getElementById('latest-anime');
                latestAnimeContainer.innerHTML = ''; // Clear previous results

                data.data.forEach(anime => {
                    const animeItem = document.createElement('div');
                    animeItem.classList.add('p-4', 'bg-gray-800', 'rounded-lg', 'mb-4');
                    animeItem.innerHTML = `
                        <img src="${anime.images.webp.image_url}" alt="${anime.title}" class="w-full h-40 object-cover mb-2 rounded-lg">
                        <h3 class="text-lg font-semibold">${anime.title}</h3>
                    `;
                    latestAnimeContainer.appendChild(animeItem);
                });
            })
            .catch(error => {
                console.error('Error fetching latest anime:', error);
            });
    }

    // Fetch latest reviews
    function fetchLatestReviews() {
        fetch('https://api.jikan.moe/v4/reviews/anime')
            .then(response => response.json())
            .then(data => {
                const latestReviewsContainer = document.getElementById('latest-reviews');
                latestReviewsContainer.innerHTML = ''; // Clear previous results

                data.data.forEach(review => {
                    const reviewItem = document.createElement('div');
                    reviewItem.classList.add('p-4', 'bg-gray-800', 'rounded-lg', 'mb-4');
                    reviewItem.innerHTML = `
                        <h3 class="text-lg font-semibold">${review.anime.title}</h3>
                        <p>${review.content}</p>
                    `;
                    latestReviewsContainer.appendChild(reviewItem);
                });
            })
            .catch(error => {
                console.error('Error fetching latest reviews:', error);
            });
    }

    // Fetch initial data
    fetchTopAnime();
    fetchLatestAnime();
    fetchLatestReviews();
});
