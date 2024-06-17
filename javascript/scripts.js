document.addEventListener("DOMContentLoaded", function() {
    fetch('/html/layout/NavbarNotLogin.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;

            // Reinitialize any required JS here
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

            document.getElementById('search-input').addEventListener('input', function() {
                const query = this.value.trim();
                if (query.length > 2) {
                    performSearch(query, 'search-results');
                } else {
                    clearSearchResults('search-results');
                }
            });

            document.getElementById('mobile-search-input').addEventListener('input', function() {
                const query = this.value.trim();
                if (query.length > 2) {
                    performSearch(query, 'mobile-search-results');
                } else {
                    clearSearchResults('mobile-search-results');
                }
            });

            function performSearch(query, resultContainerId) {
                fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=10`)
                    .then(response => response.json())
                    .then(data => {
                        const searchResults = document.getElementById(resultContainerId);
                        searchResults.innerHTML = ''; // Clear previous results

                        data.data.forEach(anime => {
                            const resultItem = document.createElement('a');
                            resultItem.href = `/html/Guest/detailAnimeNotLogin.html?id=${anime.mal_id}&email=${localStorage.getItem('email')}`;
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

            function clearSearchResults(resultContainerId) {
                const searchResults = document.getElementById(resultContainerId);
                searchResults.innerHTML = '';
                searchResults.classList.add('hidden');
            }

        });

    fetchTopAnime();
    fetchLatestAnime();
    fetchLatestReviews();
});

function getQueryParams() {
    const params = {};
    window.location.search.replace(/^\?/, '').split('&').forEach(param => {
        const [key, value] = param.split('=');
        params[key] = decodeURIComponent(value);
    });
    return params;
}

async function fetchTopAnime() {
    const loadingElement = document.getElementById('loading-top-anime');
    const animeCardsContainer = document.getElementById('anime-cards');
    
    try {
        const response = await fetch('https://api.jikan.moe/v4/top/anime');
        const data = await response.json();
        const top8Anime = data.data.slice(0, 8);

        top8Anime.forEach(anime => {
            const card = document.createElement('div');
            card.classList.add('bg-gray-800', 'rounded-lg', 'overflow-hidden', 'shadow-lg');
            card.innerHTML = `
                <img src="${anime.images.webp.image_url}" alt="${anime.title}" class="w-full h-48 object-cover">
                <div class="p-4">
                    <h3 class="text-xl font-semibold">${anime.title}</h3>
                    <a href="/html/Guest/detailAnimeNotLogin.html?id=${anime.mal_id}" class="mt-2 inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Learn More</a>
                </div>
            `;
            animeCardsContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching top anime data:', error);
    } finally {
        loadingElement.style.display = 'none';
    }
}

async function fetchLatestAnime() {
    const loadingElement = document.getElementById('loading-latest');
    const latestCardsContainer = document.getElementById('latest-cards');
    
    try {
        const response = await fetch('https://api.jikan.moe/v4/anime?q=LATEST&sfw');
        const data = await response.json();
        const latest8Anime = data.data.slice(0, 8);

        latest8Anime.forEach(anime => {
            const card = document.createElement('div');
            card.classList.add('bg-gray-800', 'rounded-lg', 'overflow-hidden', 'shadow-lg');
            card.innerHTML = `
                <img src="${anime.images.webp.image_url}" alt="${anime.title}" class="w-full h-48 object-cover">
                <div class="p-4">
                    <h3 class="text-xl font-semibold">${anime.title}</h3>
                    <a href="/html/Guest/detailAnimeNotLogin.html?id=${anime.mal_id}" class="mt-2 inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Learn More</a>
                </div>
            `;
            latestCardsContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching latest anime data:', error);
    } finally {
        loadingElement.style.display = 'none';
    }
}

async function fetchLatestReviews(page = 1) {
    const loadingElement = document.getElementById('loading-review');
    const reviewCardsContainer = document.getElementById('review-cards');
    
    try {
        const response = await fetch(`https://mylistanime-api-anime.vercel.app/animes/reviews?page=${page}`);
        const data = await response.json();

        data.forEach(review => {
            const card = document.createElement('div');
            card.classList.add('flex', 'items-start', 'space-x-4', 'bg-gray-800', 'rounded-lg', 'overflow-hidden', 'shadow-lg', 'p-4');
            card.innerHTML = `
                <img src="${review.image}" alt="${review.title}" class="w-24 h-24 object-cover flex-shrink-0">
                <div>
                    <h3 class="text-xl font-semibold">${review.title}</h3>
                    <p class="mt-1 text-gray-400">Rating: ${review.rating}</p>
                    <p class="mt-2">${review.review}</p>
                    <p class="mt-2 text-blue-400">Review By ${review.user.username}</p>
                </div>
            `;
            reviewCardsContainer.prepend(card); // Prepend the card to the container
        });
        
        if (data.length > 0) {
            // If there are more reviews to load, add a button to load more
            const loadMoreButton = document.createElement('button');
            loadMoreButton.textContent = 'Load More Reviews';
            loadMoreButton.classList.add('mt-4', 'bg-purple-600', 'text-white', 'px-4', 'py-2', 'rounded', 'hover:bg-purple-700');
            loadMoreButton.addEventListener('click', () => {
                loadMoreButton.remove();
                fetchLatestReviews(page + 1);
            });
            reviewCardsContainer.appendChild(loadMoreButton);
        }
    } catch (error) {
        console.error('Error fetching latest review data:', error);
    } finally {
        loadingElement.style.display = 'none';
    }
}
