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


document.getElementById('copy-link').addEventListener('click', function(){
    const url = window.location.href
    const tempTextarea = document.createElement('textarea')
    tempTextarea.value = url
    document.body.appendChild(tempTextarea)

    tempTextarea.select()
    tempTextarea.setSelectionRange(0,99999)
    document.execCommand('copy')
    document.body.removeChild(tempTextarea)
    Swal.fire({
        title: "Link gekopieerd!",
        text: "De link is naar het klembord gekopieerd",
        icon: "success"
    })
})

