document.addEventListener("DOMContentLoaded", function() {
    // Load navbar from external HTML file
    fetch('/html/layout/NavbarLogin.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;

            // Add event listeners for navbar functionalities
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
                        searchResults.innerHTML = '';

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

            function clearSearchResults(resultContainerId) {
                const searchResults = document.getElementById(resultContainerId);
                searchResults.innerHTML = '';
                searchResults.classList.add('hidden');
            }

            updateUserUsername();
        });

    fetchTopAnime();
    fetchLatestAnime();
    fetchLatestReviews();

    // Avatar change functionality
    const changeAvatarBtn = document.getElementById('change-avatar-btn');
    const avatarPlaceholder = document.getElementById('avatar-placeholder');
    const imageModal = document.getElementById('image-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    avatarPlaceholder.addEventListener('click', function () {
        imageModal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', function () {
        imageModal.classList.add('hidden');
    });

    document.querySelectorAll('#image-modal button').forEach(button => {
        button.addEventListener('click', function() {
            const imgSrc = button.querySelector('img').src;
            document.getElementById('change-avatar-btn').querySelector('img').src = imgSrc;
            imageModal.classList.add('hidden');
        });
    });

    // Fetch logged-in user's username and email
    function updateUserUsername() {
        const username = localStorage.getItem('username');
        fetch(`https://mylistanime-api-user.vercel.app/${username}`)
            .then(response => response.json())
            .then(data => {
                console.log('User data:', data); // Log the response data to debug
                if (data && data.username && data.email) {
                    document.getElementById('username').innerText = data.username;
                    document.getElementById('user-email').innerText = data.email;
                } else {
                    console.error('Invalid user data format:', data);
                }
            })
            .catch(error => console.error('Error fetching user data:', error));
    }
});
