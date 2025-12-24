document.querySelectorAll('.post').forEach(post => {
    const gallery = post.querySelector('.post-gallery');
    const images = gallery.querySelectorAll('img');
    const mainImg = post.querySelector('.post-media > img');

    if (images.length === 0) return;

    const prevBtn = post.querySelector('.gallery-prev');
    const nextBtn = post.querySelector('.gallery-next');

    let currentIndex = 0;

    function updateImage(index) {
        currentIndex = (index + images.length) % images.length;
        mainImg.src = images[currentIndex].src;
        mainImg.alt = images[currentIndex].alt;
    };

    prevBtn.addEventListener('click', () => updateImage(currentIndex - 1));
    nextBtn.addEventListener('click', () => updateImage(currentIndex + 1));
});
