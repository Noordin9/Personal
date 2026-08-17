// (function() {
//     // Wacht tot het DOM volledig geladen is
//     document.addEventListener('DOMContentLoaded', function() {
//         // Mobile menu toggle
//         const hamburger = document.getElementById('hamburger');
//         const navLinks = document.getElementById('navLinks');
//         if (hamburger && navLinks) {
//             hamburger.addEventListener('click', (e) => {
//                 e.stopPropagation();
//                 navLinks.classList.toggle('active');
//                 const icon = hamburger.querySelector('i');
//                 if (navLinks.classList.contains('active')) {
//                     icon.classList.remove('fa-bars');
//                     icon.classList.add('fa-times');
//                 } else {
//                     icon.classList.remove('fa-times');
//                     icon.classList.add('fa-bars');
//                 }
//             });
//             const navItems = document.querySelectorAll('.nav-links a');
//             navItems.forEach(link => {
//                 link.addEventListener('click', () => {
//                     navLinks.classList.remove('active');
//                     const icon = hamburger.querySelector('i');
//                     if (icon) {
//                         icon.classList.remove('fa-times');
//                         icon.classList.add('fa-bars');
//                     }
//                 });
//             });
//         }
//
//         // Active nav highlight on scroll
//         const sections = ['projects', 'about', 'contact'];
//         const navElements = document.querySelectorAll('.nav-item');
//         function updateActiveNav() {
//             let currentSection = '';
//             const scrollPosition = window.scrollY + 150;
//             for (let sec of sections) {
//                 const element = document.getElementById(sec);
//                 if (element) {
//                     const offsetTop = element.offsetTop;
//                     const offsetBottom = offsetTop + element.offsetHeight;
//                     if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
//                         currentSection = sec;
//                         break;
//                     }
//                 }
//             }
//             if (window.scrollY < 200) currentSection = '';
//             navElements.forEach(link => {
//                 const sectionRef = link.getAttribute('data-section');
//                 if (sectionRef === currentSection) {
//                     link.classList.add('active-nav');
//                 } else {
//                     link.classList.remove('active-nav');
//                 }
//             });
//         }
//         window.addEventListener('scroll', updateActiveNav);
//         window.addEventListener('load', updateActiveNav);
//
//         // Smooth scroll for internal anchor links
//         const allInternalLinks = document.querySelectorAll('a[href^="#"]');
//         allInternalLinks.forEach(anchor => {
//             anchor.addEventListener('click', function(e) {
//                 const targetId = this.getAttribute('href');
//                 if (targetId === '#') return;
//                 const targetElement = document.querySelector(targetId);
//                 if (targetElement) {
//                     e.preventDefault();
//                     targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
//                     history.pushState(null, null, targetId);
//                     if (navLinks && navLinks.classList.contains('active')) {
//                         navLinks.classList.remove('active');
//                         const icon = hamburger.querySelector('i');
//                         if (icon) icon.classList.remove('fa-times'), icon.classList.add('fa-bars');
//                     }
//                 }
//             });
//         });
//
//         // Hero view projects button
//         const heroViewBtn = document.getElementById('heroViewProjects');
//         if(heroViewBtn) {
//             heroViewBtn.addEventListener('click', (e) => {
//                 e.preventDefault();
//                 const projectsSection = document.getElementById('projects');
//                 if(projectsSection) projectsSection.scrollIntoView({ behavior: 'smooth' });
//             });
//         }
//
//         // ========== BESTSELLER & OVAPP GALERIJ LOGICA ==========
//         // Verzamel alle afbeeldingen uit de assets folder
//         const galleries = {
//             bestseller: {
//                 images: [],
//                 currentIndex: 0
//             },
//             ovapp: {
//                 images: [],
//                 currentIndex: 0
//             }
//         };
//
//         // BestSeller afbeeldingen (1 t/m 10)
//         for (let i = 1; i <= 10; i++) {
//             galleries.bestseller.images.push(`assets/BestSeller${i}.png`);
//         }
//         // OVApp afbeeldingen (1 t/m 7)
//         for (let i = 1; i <= 7; i++) {
//             galleries.ovapp.images.push(`assets/OVApp${i}.png`);
//         }
//
//         // Lightbox elementen
//         const lightbox = document.getElementById('lightbox');
//         const lightboxImg = document.getElementById('lightboxImg');
//         const prevBtn = document.getElementById('prevBtn');
//         const nextBtn = document.getElementById('nextBtn');
//         const closeLightbox = document.getElementById('closeLightbox');
//
//         let activeGallery = null;
//
//         function openGallery(galleryKey, startIndex = 0) {
//             if (!galleries[galleryKey] || galleries[galleryKey].images.length === 0) return;
//             activeGallery = galleryKey;
//             galleries[galleryKey].currentIndex = startIndex;
//             updateLightboxImage();
//             lightbox.classList.add('active');
//             document.body.style.overflow = 'hidden';
//         }
//
//         function updateLightboxImage() {
//             if (!activeGallery) return;
//             const imgPath = galleries[activeGallery].images[galleries[activeGallery].currentIndex];
//             lightboxImg.src = imgPath;
//             lightboxImg.onerror = function() {
//                 this.src = 'https://placehold.co/800x500/1E2A36/00e87a?text=Afbeelding+niet+gevonden';
//             };
//         }
//
//         function nextImage() {
//             if (!activeGallery) return;
//             const gallery = galleries[activeGallery];
//             if (gallery.currentIndex + 1 < gallery.images.length) {
//                 gallery.currentIndex++;
//             } else {
//                 gallery.currentIndex = 0;
//             }
//             updateLightboxImage();
//         }
//
//         function prevImage() {
//             if (!activeGallery) return;
//             const gallery = galleries[activeGallery];
//             if (gallery.currentIndex - 1 >= 0) {
//                 gallery.currentIndex--;
//             } else {
//                 gallery.currentIndex = gallery.images.length - 1;
//             }
//             updateLightboxImage();
//         }
//
//         function closeGallery() {
//             lightbox.classList.remove('active');
//             activeGallery = null;
//             document.body.style.overflow = '';
//         }
//
//         // Koppel klikken op de afbeeldingscontainers van BestSeller en OVApp
//         const bestsellerImgDiv = document.querySelector('#bestsellerCard .project-img');
//         const ovappImgDiv = document.querySelector('#ovappCard .project-img');
//
//         if (bestsellerImgDiv) {
//             bestsellerImgDiv.addEventListener('click', (e) => {
//                 e.stopPropagation();
//                 openGallery('bestseller', 0);
//             });
//         }
//         if (ovappImgDiv) {
//             ovappImgDiv.addEventListener('click', (e) => {
//                 e.stopPropagation();
//                 openGallery('ovapp', 0);
//             });
//         }
//
//         // Lightbox controls
//         if (prevBtn) prevBtn.addEventListener('click', prevImage);
//         if (nextBtn) nextBtn.addEventListener('click', nextImage);
//         if (closeLightbox) closeLightbox.addEventListener('click', closeGallery);
//
//         // Sluiten door klikken op de achtergrond
//         if (lightbox) {
//             lightbox.addEventListener('click', (e) => {
//                 if (e.target === lightbox) closeGallery();
//             });
//         }
//
//         // Toetsenbord navigatie
//         document.addEventListener('keydown', (e) => {
//             if (!lightbox || !lightbox.classList.contains('active')) return;
//             if (e.key === 'ArrowLeft') prevImage();
//             if (e.key === 'ArrowRight') nextImage();
//             if (e.key === 'Escape') closeGallery();
//         });
//
//         // ========== BESTAANDE PROJECTEN (Hoyo & Huis) ==========
//         const hoyoCard = document.getElementById('hoyoCard');
//         const visitHoyoBtn = document.querySelector('#hoyoCard .visit-site-btn');
//         if (hoyoCard && visitHoyoBtn) {
//             visitHoyoBtn.addEventListener('click', (e) => e.stopPropagation());
//             hoyoCard.addEventListener('click', (e) => {
//                 if (e.target.closest('.visit-site-btn')) return;
//                 window.open('https://hoyo-schoonmaak.nl', '_blank', 'noopener,noreferrer');
//             });
//             hoyoCard.style.cursor = 'pointer';
//         }
//
//         const huisCard = document.getElementById('huisCard');
//         const visitHuisBtn = document.querySelector('#huisCard .visit-site-btn');
//         if (huisCard && visitHuisBtn) {
//             visitHuisBtn.addEventListener('click', (e) => e.stopPropagation());
//             huisCard.addEventListener('click', (e) => {
//                 if (e.target.closest('.visit-site-btn')) return;
//                 window.open('https://huisenaanbod.nl', '_blank', 'noopener,noreferrer');
//             });
//             huisCard.style.cursor = 'pointer';
//         }
//
//
//         // Tech stack hover effect
//         document.querySelectorAll('.tech-stack span').forEach(span => {
//             span.addEventListener('mouseenter', () => { span.style.transform = 'translateY(-2px)'; span.style.backgroundColor = '#28343F'; });
//             span.addEventListener('mouseleave', () => { span.style.transform = 'translateY(0px)'; span.style.backgroundColor = '#1A1F29'; });
//         });
//
//     });
// })();

document.addEventListener("DOMContentLoaded", () => {
    const mobileToggle = document.getElementById("mobileToggle");
    const mobileMenu = document.getElementById("mobileMenu");

    const searchTabs = document.querySelectorAll(".search-tab");
    const searchButton = document.getElementById("searchButton");
    const locationInput = document.getElementById("locationInput");

    const favorites = document.querySelectorAll(".favorite");
    const mobileLinks = document.querySelectorAll(".mobile-menu a");

    const toast = document.getElementById("toast");

    let transactionType = "koop";
    let toastTimeout;


    /* ============================
       Toast
    ============================= */

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add("visible");

        clearTimeout(toastTimeout);

        toastTimeout = setTimeout(() => {
            toast.classList.remove("visible");
        }, 2600);
    }


    /* ============================
       Mobile menu
    ============================= */

    mobileToggle.addEventListener("click", () => {
        const isOpen = document.body.classList.toggle("menu-open");

        mobileToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        mobileToggle.setAttribute(
            "aria-label",
            isOpen ? "Menu sluiten" : "Menu openen"
        );
    });


    mobileLinks.forEach((link) => {
        link.addEventListener("click", () => {
            document.body.classList.remove("menu-open");

            mobileToggle.setAttribute(
                "aria-expanded",
                "false"
            );
        });
    });


    /* ============================
       Buy / rent tabs
    ============================= */

    searchTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            searchTabs.forEach((otherTab) => {
                otherTab.classList.remove("active");
            });

            tab.classList.add("active");

            transactionType = tab.dataset.type;

            if (transactionType === "huur") {
                locationInput.placeholder =
                    "Waar wilt u huren? Bijvoorbeeld Valencia, Algarve of Provence";
            } else {
                locationInput.placeholder =
                    "Zoek op land, streek of plaats — bijv. Algarve, Toscane of Valencia";
            }
        });
    });


    /* ============================
       Search
    ============================= */

    function runSearch() {
        const query = locationInput.value.trim();

        if (!query) {
            locationInput.focus();

            showToast(
                "Vul eerst een land, streek of plaats in."
            );

            return;
        }

        /*
          Later vervangen door jullie echte zoekpagina.

          Bijvoorbeeld:

          const url =
            `/woningen?type=${transactionType}` +
            `&location=${encodeURIComponent(query)}`;

          window.location.href = url;
        */

        showToast(
            `Zoeken naar ${transactionType === "koop" ? "koopwoningen" : "huurwoningen"} in ${query}`
        );
    }


    searchButton.addEventListener("click", runSearch);


    locationInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            runSearch();
        }
    });


    /* ============================
       Favorites
    ============================= */

    favorites.forEach((button) => {
        button.addEventListener("click", () => {
            const isFavorite =
                button.classList.toggle("active");

            button.textContent =
                isFavorite ? "♥" : "♡";

            button.setAttribute(
                "aria-label",
                isFavorite
                    ? "Verwijderen uit favorieten"
                    : "Toevoegen aan favorieten"
            );

            showToast(
                isFavorite
                    ? "Woning toegevoegd aan uw favorieten."
                    : "Woning verwijderd uit uw favorieten."
            );
        });
    });


    /* ============================
       Demo links
    ============================= */

    document
        .querySelectorAll('a[href="#"]')
        .forEach((link) => {
            link.addEventListener("click", (event) => {
                event.preventDefault();

                showToast(
                    "Deze pagina kan later aan de echte Huis & Aanbod-route worden gekoppeld."
                );
            });
        });
});