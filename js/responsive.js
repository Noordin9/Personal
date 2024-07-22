function scrollToTop() {
    window.scrollTo({ top: 0, behavior:'smooth' });
}

window.addEventListener('scroll', function (){
    const scrollTopBtn = document.querySelector('.scroll-top');
    if (this.window.pageYOffset > 200){
        scrollTopBtn.style.display = 'block';
    } else {
        scrollTopBtn.style.display = 'none';
    }
})

