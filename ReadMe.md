# Echo's of Barkur

## Project Description
Echo's of Barkur is a web application dedicated to showcasing the rich heritage and divine temples of Barkur, Udupi. The project provides detailed information about various temples, an interactive photo gallery, and easy navigation to explore the cultural and historical significance of these sacred sites.

## Features
- **Temple Information Hub:** Searchable and detailed insights about temples in Barkur, including history, architecture, and cultural significance.
- **Interactive Gallery:** A visually appealing gallery showcasing high-quality images of temples with descriptions.
- **Easy Navigation:** Intuitive interface to navigate through different temples and find detailed location information.
- **Dark Mode Support:** User-friendly dark mode toggle for comfortable viewing.
- **Admin Panel:** Secure admin endpoints to add, update, and delete temple information and gallery photos.

## Technology Stack
- **Backend:** Python Flask framework serving RESTful APIs and static files.
- **Database:** SQLite database (`temples.db`) storing temple data and gallery photos.
- **Frontend:** HTML, CSS, JavaScript with libraries such as AOS (Animate On Scroll), Font Awesome, Fancybox, and jQuery.
- **Other:** Dark mode support using localStorage and dynamic content loading.

## Installation and Running Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd Mini
   ```
3. Ensure you have Python and Flask installed. You can install Python using:
   ```
   pip install python
   ```
4. Ensure you have Python and Flask installed. You can install Flask using:
   ```
   pip install flask
   ```
5. Run the Flask application:
   ```
   python3 app.py
   ```
6. Open your browser and go to:
   ```
   http://localhost:5000
   ```

## Folder Structure Overview
```
Mini/
├── app.py                  # Flask backend application
├── init_db.py              # Database initialization script (if any)
├── temples.db              # SQLite database file
├── static/                 # Static files (HTML, CSS, JS, images)
│   ├── Assets/             # Temple images and assets
│   ├── *.html              # Static HTML pages
│   ├── *.css               # Stylesheets
│   └── script.js           # Frontend JavaScript
└── templates/              # HTML templates for dynamic rendering
    ├── temple-gallery.html
    └── temple-info.html
```

## Usage
- Visit the homepage to explore the temples of Barkur.
- Use the search feature on the Temple Information page to find specific temples.
- Browse the Interactive Gallery to view temple photographs.
- Admin users can log in and manage temple data via the provided API endpoints.

## Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes. For major changes, please open an issue first to discuss what you would like to change.

## License and Credits
© 2025 Barkur Temples. All rights reserved.

This project uses open-source libraries such as Flask, jQuery, Fancybox, AOS, and Font Awesome. Thanks to all contributors and the open-source community.
