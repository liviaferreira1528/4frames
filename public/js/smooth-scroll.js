(function() {
    if (window.innerWidth < 768) return;

    const body = document.body;
    const html = document.documentElement;
    let targetScroll = window.scrollY || window.pageYOffset;
    let currentScroll = targetScroll;
    let isAnimating = false;
    let ease = 0.08;

    function getMaxScroll() {
        return Math.max(body.scrollHeight, html.scrollHeight, body.offsetHeight, html.offsetHeight) - window.innerHeight;
    }

    function onWheel(e) {
        e.preventDefault();
        targetScroll += e.deltaY;
        targetScroll = Math.max(0, Math.min(targetScroll, getMaxScroll()));
        if (!isAnimating) {
            isAnimating = true;
            requestAnimationFrame(tick);
        }
    }

    function tick() {
        currentScroll += (targetScroll - currentScroll) * ease;
        window.scrollTo(0, Math.round(currentScroll));
        if (Math.abs(targetScroll - currentScroll) < 0.5) {
            window.scrollTo(0, targetScroll);
            isAnimating = false;
            return;
        }
        requestAnimationFrame(tick);
    }

    window.addEventListener('wheel', onWheel, { passive: false });

    window.addEventListener('scroll', function() {
        if (isAnimating) return;
        targetScroll = window.scrollY;
        currentScroll = targetScroll;
    });
})();
