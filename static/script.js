// Initialize AOS library if it exists
if (typeof AOS !== 'undefined') {
    AOS.init();
}

// Function to get directions from user location to Barkur Temples
function getDirections() {
    const locationInput = document.getElementById('location');
    if (!locationInput) {
        alert('Location input not found.');
        return;
    }
    const startLocation = locationInput.value.trim();
    if (!startLocation) {
        alert('Please enter your starting location.');
        return;
    }
    const destination = 'Barkur, Karnataka, India';
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(startLocation)}&destination=${encodeURIComponent(destination)}`;
    window.open(directionsUrl, '_blank');
}

// Top button functionality
window.onscroll = function() {
    const topBtn = document.getElementById("topBtn");
    if (topBtn) {
        topBtn.style.display = 
            document.body.scrollTop > 20 || document.documentElement.scrollTop > 20
                ? "block"
                : "none";
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const topBtn = document.getElementById("topBtn");
    if (topBtn) {
        topBtn.addEventListener('click', () => {
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        });
    }
});



function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

async function loadTemples() {
    try {
        const response = await fetch('/temples');
        const temples = await response.json();
        const container = document.getElementById('templeContainer');
        
        if (container) {
container.innerHTML = temples.map(temple => `
    <div class="temple-image-container">
        <img src="${temple.image_url}" alt="${temple.name}" onclick="showTempleInfo(${temple.id})" style="cursor:pointer;">
    </div>
`).join('');

            // Add hover tooltip for temple name on temple-info.html after loading temples
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            document.body.appendChild(tooltip);

            const templeContainers = container.querySelectorAll('.temple-image-container');
            templeContainers.forEach(container => {
            container.addEventListener('mouseover', (e) => {
                const img = container.querySelector('img');
                if (!img) return;
                tooltip.textContent = img.alt;
                tooltip.style.display = 'block';
                tooltip.style.left = e.clientX + 10 + 'px';
                tooltip.style.top = e.clientY + 10 + 'px';
            });
            container.addEventListener('mouseout', () => {
                tooltip.style.display = 'none';
            });
            container.addEventListener('mousemove', (e) => {
                tooltip.style.left = e.clientX + 10 + 'px';
                tooltip.style.top = e.clientY + 10 + 'px';
            });
            });
        }
    } catch (error) {
        console.error('Error loading temples:', error);
    }
}

async function showTempleInfo(templeId) {
    try {
        const response = await fetch(`/temple/${templeId}`);
        const temple = await response.json();

        const modal = document.getElementById('temple-modal');
        const modalContent = document.getElementById('temple-info');

        // Render description paragraphs separately
        const descriptionHtml = Array.isArray(temple.description)
            ? temple.description.map(paragraph => `<p>${paragraph}</p>`).join('')
            : `<p>${temple.description}</p>`;

        // Show two buttons: Info and Gallery
        modalContent.innerHTML = `<section class="modal-header">
            <div class="button-group">
                <button id="infoBtn" class="modal-btn">Info</button>
                <button id="galleryBtn" class="modal-btn">Gallery</button>
            </div>
            <div id="infoSection" style="display:none;">
                <h2>${temple.name}</h2>
                ${descriptionHtml}
            </div>
            <div id="gallerySection" style="display:none; position: relative;">
                <p>Loading gallery...</p>
            </div></section>
        `;

        modal.style.display = 'block';


        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
                closeFullscreenGallery();
                const gallerySection = document.getElementById('gallerySection');
                gallerySection.classList.remove('fullscreen');
                const fullscreenToggleBtn = document.getElementById('fullscreenToggleBtn');
                if (fullscreenToggleBtn) fullscreenToggleBtn.remove();
            }
        }

        // Button event listeners
        document.getElementById('infoBtn').addEventListener('click', () => {
            document.getElementById('infoSection').style.display = 'block';
            const gallerySection = document.getElementById('gallerySection');
            gallerySection.style.display = 'none';
            gallerySection.classList.remove('show');
            gallerySection.classList.remove('fullscreen');
            const fullscreenToggleBtn = document.getElementById('fullscreenToggleBtn');
            if (fullscreenToggleBtn) fullscreenToggleBtn.style.display = 'none';
        });

        document.getElementById('galleryBtn').addEventListener('click', () => {
            // Redirect to the new gallery page with temple ID as query parameter
            window.location.href = `/temple/${templeId}/gallery_page?id=${templeId}`;
        });

    } catch (error) {
        console.error('Error fetching temple info:', error);
    }
}

// New function to load temple gallery photos
async function loadTempleGallery(templeId) {
    try {
        const response = await fetch(`/temple/${templeId}/gallery`);
        if (!response.ok) throw new Error('Failed to fetch gallery photos');
        const photos = await response.json();

        const gallerySection = document.getElementById('gallerySection');
        if (photos.length === 0) {
            gallerySection.innerHTML = '<p>No gallery photos available.</p>';
            return;
        }

        gallerySection.innerHTML = photos.map(photo => `
            <a href="${photo.url}" data-fancybox="gallery" data-caption="Gallery photo">
                <img src="${photo.url}" alt="Gallery photo" style="max-width: 100%; margin-bottom: 10px; border-radius: 8px; cursor: pointer;">
            </a>
        `).join('');

        // Destroy any existing Fancybox instance before re-initializing
        if (typeof $ !== 'undefined' && $.fancybox) {
            if ($.fancybox.getInstance) {
                $.fancybox.getInstance()?.destroy();
            }
            $('[data-fancybox="gallery"]').fancybox({
                buttons: [
                    "slideShow",
                    "fullScreen",
                    "thumbs",
                    "close"
                ],
                loop: true,
                protect: true
            });
        }
    } catch (error) {
        console.error('Error loading gallery photos:', error);
        const gallerySection = document.getElementById('gallerySection');
        gallerySection.innerHTML = '<p>Error loading gallery photos.</p>';
    }
}

function searchTemples() {
    const input = document.getElementById("searchInput").value.toLowerCase();
    const temples = document.querySelectorAll(".temple-image-container");
    
    temples.forEach((temple) => {
        const imgAlt = temple.querySelector('img').alt.toLowerCase();
        temple.style.display = imgAlt.includes(input) ? "block" : "none";
    });
}

// Load temples when the page loads
async function login(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/admin/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });
        
        if (response.ok) {
            document.getElementById('adminForm').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'block';
            loadTemplesForAdmin();
        } else {
            alert('Invalid credentials');
        }
    } catch (error) {
        console.error('Login error:', error);
    }
    return false;
}

async function loadTemplesForAdmin() {
    try {
        const response = await fetch('/temples');
        const temples = await response.json();
        const container = document.getElementById('templeList');

container.innerHTML = temples.map(temple => {
    let descriptionText = '';
    if (Array.isArray(temple.description)) {
        descriptionText = temple.description.join('\n');
    } else if (typeof temple.description === 'string') {
        try {
            const parsed = JSON.parse(temple.description);
            if (Array.isArray(parsed)) {
                descriptionText = parsed.join('\n');
            } else {
                descriptionText = temple.description;
            }
        } catch {
            descriptionText = temple.description;
        }
    }
    return `
    <div class="temple-edit-card" data-temple-id="${temple.id}">
        <input type="text" id="name-${temple.id}" value="${temple.name}">
        <textarea id="desc-${temple.id}">${descriptionText}</textarea>
        <input type="text" id="img-${temple.id}" value="${temple.image_url}">
        <div>
            <label>Gallery Photos (comma separated URLs):</label>
            <textarea id="gallery-${temple.id}" placeholder="Enter gallery photo URLs separated by commas"></textarea>
        </div>
        <button onclick="updateTemple(${temple.id})">Save Changes</button>
        <button onclick="deleteTemple(${temple.id})" style="margin-left: 10px; background-color: #e74c3c; color: white;">Delete</button>
    </div>
    `;
}).join('');

        // Load gallery photos for each temple and fill the textarea
        temples.forEach(async (temple) => {
            try {
                const res = await fetch(`/temple/${temple.id}/gallery`);
                if (!res.ok) throw new Error('Failed to fetch gallery photos');
                const photos = await res.json();
                const galleryTextarea = document.getElementById(`gallery-${temple.id}`);
                if (galleryTextarea) {
                    galleryTextarea.value = photos.map(p => p.url).join(', ');
                }
            } catch (error) {
                console.error('Error loading gallery photos for temple', temple.id, error);
            }
        });
    } catch (error) {
        console.error('Error loading temples:', error);
    }
}

function addNewTempleForm() {
    const container = document.getElementById('templeList');
    const newTempleId = 'new'; // temporary id for new temple form
    const newTempleForm = document.createElement('div');
    newTempleForm.className = 'temple-edit-card';
    newTempleForm.setAttribute('data-temple-id', newTempleId);
    newTempleForm.innerHTML = `
        <input type="text" id="name-${newTempleId}" placeholder="Temple Name">
        <textarea id="desc-${newTempleId}" placeholder="Temple Description"></textarea>
        <input type="text" id="img-${newTempleId}" placeholder="Image URL">
        <div>
            <label>Gallery Photos (comma separated URLs):</label>
            <textarea id="gallery-${newTempleId}" placeholder="Enter gallery photo URLs separated by commas"></textarea>
        </div>
        <button onclick="saveNewTemple()">Save New Temple</button>
        <button onclick="this.parentElement.remove()">Cancel</button>
    `;
    container.prepend(newTempleForm);
}

async function saveNewTemple() {
    const id = 'new';
    const name = document.getElementById(`name-${id}`).value.trim();
    const descriptionRaw = document.getElementById(`desc-${id}`).value.trim();
    const description = descriptionRaw ? descriptionRaw.split('\n').map(p => p.trim()).filter(p => p.length > 0) : [];
    const image_url = document.getElementById(`img-${id}`).value.trim();
    const galleryRaw = document.getElementById(`gallery-${id}`).value.trim();
    const gallery_photos = galleryRaw ? galleryRaw.split(',').map(url => url.trim()).filter(url => url.length > 0) : [];

    if (!name || description.length === 0 || !image_url) {
        alert('Please fill in all required fields (name, description, image URL).');
        return;
    }

    const data = { name, description, image_url, gallery_photos };

    try {
        const response = await fetch('/admin/add_temple', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('New temple added successfully!');
            loadTemplesForAdmin();
        } else {
            alert('Failed to add new temple.');
        }
    } catch (error) {
        console.error('Error adding new temple:', error);
        alert('Error adding new temple.');
    }
}

document.getElementById('addTempleBtn')?.addEventListener('click', addNewTempleForm);

async function updateTemple(id) {
    const galleryPhotosRaw = document.getElementById(`gallery-${id}`).value;
    const galleryPhotos = galleryPhotosRaw.split(',').map(url => url.trim()).filter(url => url.length > 0);
    const descriptionRaw = document.getElementById(`desc-${id}`).value;
    const description = descriptionRaw ? descriptionRaw.split('\n').map(p => p.trim()).filter(p => p.length > 0) : [];

    const data = {
        id: id,
        name: document.getElementById(`name-${id}`).value,
        description: description,
        image_url: document.getElementById(`img-${id}`).value,
        gallery_photos: galleryPhotos
    };

    try {
        const response = await fetch('/admin/update_temple', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Temple updated successfully!');
        } else {
            alert('Failed to update temple');
        }
    } catch (error) {
        console.error('Error updating temple:', error);
    }
}

async function deleteTemple(id) {
    if (!confirm('Are you sure you want to delete this temple? This action cannot be undone.')) {
        return;
    }
    try {
        const response = await fetch(`/admin/delete_temple/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            alert('Temple deleted successfully!');
            loadTemplesForAdmin();
        } else {
            alert('Failed to delete temple.');
        }
    } catch (error) {
        console.error('Error deleting temple:', error);
        alert('Error deleting temple.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('templeContainer')) {
        loadTemples();

        // Add hover tooltip for temple name on temple-info.html
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        document.body.appendChild(tooltip);

        const templeContainers = document.querySelectorAll('.temple-image-container');
        templeContainers.forEach(container => {
            container.addEventListener('mouseover', (e) => {
                const img = container.querySelector('img');
                if (!img) return;
                tooltip.textContent = img.alt;
                tooltip.style.display = 'block';
                tooltip.style.left = e.clientX + 10 + 'px';
                tooltip.style.top = e.clientY + 10 + 'px';
            });
            container.addEventListener('mouseout', () => {
                tooltip.style.display = 'none';
            });
            container.addEventListener('mousemove', (e) => {
                tooltip.style.left = e.clientX + 10 + 'px';
                tooltip.style.top = e.clientY + 10 + 'px';
            });
        });
    }
});

// Temple hover functionality
document.addEventListener('DOMContentLoaded', () => {
    // Disable hover tooltip on interactive-gallery.html
    if (window.location.pathname.includes('interactive-gallery.html')) {
        return;
    }

    const gallery = document.querySelectorAll('.gallery-container a');
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip);

            gallery.forEach(item => {
                item.addEventListener('mouseover', async (e) => {
                    const img = item.querySelector('img');
                    if (!img) return;

                    const filename = img.src.split('/').pop();
                    const match = filename.match(/temple(\d+)/);

                    if (match) {
                        const imageId = match[1];
                        try {
                            const response = await fetch(`/temple/${imageId}`);
                            if (!response.ok) throw new Error('Failed to fetch temple info');

                            const data = await response.json();
                            tooltip.innerHTML = `
                                <h3>${data.name}</h3>
                                <p>${data.description}</p>
                            `;
                            tooltip.style.display = 'block';
                            tooltip.style.left = e.clientX + 10 + 'px';
                            tooltip.style.top = e.clientY + 10 + 'px';
                        } catch (error) {
                            console.error('Error fetching temple info:', error);
                        }
                    }
                });

                item.addEventListener('mouseout', () => {
                    tooltip.style.display = 'none';
                });

                item.addEventListener('mousemove', (e) => {
                    tooltip.style.left = e.clientX + 10 + 'px';
                    tooltip.style.top = e.clientY + 10 + 'px';
                });
            });

    // Modal functionality
    const modal = document.getElementById("temple-modal");
    const closeModalBtn = document.querySelector(".close-btn");

    if (closeModalBtn && modal) {
        closeModalBtn.addEventListener("click", () => {
            modal.classList.add("hidden");
        });
    }
});

// Dark mode functionality
window.addEventListener("DOMContentLoaded", () => {
    const isDarkMode = localStorage.getItem("darkMode") === "enabled";
    if (isDarkMode) {
        document.body.classList.add("dark-mode");
        const icon = document.getElementById("modeIcon");
        if (icon) icon.textContent = "☀️";
    }
});

const darkModeToggle = document.getElementById("darkModeToggle");
if (darkModeToggle) {
    darkModeToggle.addEventListener("click", function() {
        const isDark = document.body.classList.toggle("dark-mode");
        localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");

        const icon = document.getElementById("modeIcon");
        if (icon) {
            icon.classList.add("rotate");
            setTimeout(() => {
                icon.textContent = isDark ? "☀️" : "🌙";
                icon.classList.remove("rotate");
            }, 300);
        }
    });
}
