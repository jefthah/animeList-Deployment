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
                    performSearch(query);
                } else {
                    clearSearchResults();
                }
            });

            document.getElementById('mobile-search-input').addEventListener('input', function() {
                const query = this.value.trim();
                if (query.length > 2) {
                    performSearch(query);
                } else {
                    clearSearchResults();
                }
            });

            function performSearch(query) {
                fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=10`)
                    .then(response => response.json())
                    .then(data => {
                        const searchResults = document.getElementById('search-results');
                        const mobileSearchResults = document.getElementById('mobile-search-results');
                        
                        searchResults.innerHTML = ''; // Clear previous results
                        mobileSearchResults.innerHTML = ''; // Clear previous results

                        data.data.forEach(anime => {
                            const resultItem = document.createElement('a');
                            resultItem.href = `/html/detailAnimeNotLogin.html?id=${anime.mal_id}&email=${localStorage.getItem('email')}`;
                            resultItem.classList.add('p-2', 'hover:bg-gray-200', 'cursor-pointer', 'flex', 'items-center');
                            resultItem.innerHTML = `
                                <img src="${anime.images.webp.image_url}" alt="${anime.title}" class="w-12 h-12 object-cover inline-block mr-2">
                                <span>${anime.title}</span>
                            `;
                            searchResults.appendChild(resultItem);
                            mobileSearchResults.appendChild(resultItem.cloneNode(true));
                        });

                        searchResults.classList.remove('hidden');
                        mobileSearchResults.classList.remove('hidden');
                    })
                    .catch(error => {
                        console.error('Error fetching search results:', error);
                    });
            }

            function clearSearchResults() {
                const searchResults = document.getElementById('search-results');
                const mobileSearchResults = document.getElementById('mobile-search-results');

                searchResults.innerHTML = '';
                mobileSearchResults.innerHTML = '';
                searchResults.classList.add('hidden');
                mobileSearchResults.classList.add('hidden');
            }

            updateUserEmail();
        });

    function getQueryParams() {
        const params = {};
        window.location.search.replace(/^\?/, '').split('&').forEach(param => {
            const [key, value] = param.split('=');
            params[key] = decodeURIComponent(value);
        });
        return params;
    }

    function updateUserEmail() {
        const params = getQueryParams();
        const email = params.email || localStorage.getItem('email');
        const userEmailElement = document.getElementById('user-email');
        const mobileUserEmailElement = document.getElementById('mobile-user-email');

        if (email) {
            localStorage.setItem('email', email);
            if (userEmailElement) {
                userEmailElement.textContent = email;
                userEmailElement.setAttribute('data-email', 'true');
            }
            if (mobileUserEmailElement) {
                mobileUserEmailElement.textContent = email;
                mobileUserEmailElement.setAttribute('data-email', 'true');
            }
        } else {
            if (userEmailElement) {
                userEmailElement.setAttribute('data-email', 'false');
            }
            if (mobileUserEmailElement) {
                mobileUserEmailElement.setAttribute('data-email', 'false');
            }
        }
    }
});
