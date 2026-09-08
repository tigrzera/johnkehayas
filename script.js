document.addEventListener('DOMContentLoaded', () => {
    
    // Prevent browser scroll restoration on refresh/restart
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    const videos = [
        { src: "assets/1142 County Road 43.mp4", title: "1142 County Road 43" },
        { src: "assets/373 Craig Road.mp4", title: "373 Craig Road" },
        { src: "assets/36 Marchbrook Circle.mp4", title: "36 Marchbrook Circle" },
        { src: "assets/Imagine Dragons - Believer (Make The Cut).mp4", title: "Imagine Dragons - Believer (Make The Cut)" },
        { src: "assets/Nike Mock Advertisement - John Kehayas.mp4", title: "Nike Mock Advertisement - John Kehayas" },
        { src: "assets/R34 GTR Edit (Travis Scott - SDP Interlude).mp4", title: "R34 GTR Edit (Travis Scott - SDP Interlude)" }
    ];

    let currentIndex = 0;
    
    // Global Audio States for Hero Player
    let globalMuted = true;
    let globalVolume = 0;

    const heroVideo = document.getElementById('heroVideo');
    const carouselContainer = document.getElementById('carouselContainer');
    const overlayTitle = document.getElementById('overlayTitle');
    const playerGridView = document.getElementById('playerGridView');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const muteUnmuteBtn = document.getElementById('muteUnmuteBtn');
    const mutedIcon = document.getElementById('mutedIcon');
    const unmutedIcon = document.getElementById('unmutedIcon');
    const volumeSlider = document.getElementById('volumeSlider');
    const timelineContainer = document.getElementById('timelineContainer');
    const timelineProgress = document.getElementById('timelineProgress');
    const timecodeDisplay = document.getElementById('timecodeDisplay');
    const carouselTip1 = document.getElementById('carouselTip1');
    const carouselTip2 = document.getElementById('carouselTip2');

    let isAtThumbnail = true;
    let tip1Dismissed = false;

    function dismissTip1() {
        if (!tip1Dismissed && carouselTip1) {
            tip1Dismissed = true;
            carouselTip1.classList.add('hidden');
            if (carouselTip2) {
                setTimeout(() => carouselTip2.classList.remove('hidden'), 300);
            }
        }
    }

    function dismissTip2() {
        if (carouselTip2) {
            carouselTip2.classList.add('hidden');
        }
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function applyAudioState() {
        if (heroVideo) {
            heroVideo.muted = globalMuted;
            heroVideo.volume = globalVolume;
        }
        if (volumeSlider) {
            volumeSlider.value = globalVolume;
        }
        if (globalMuted || globalVolume === 0) {
            if (mutedIcon) mutedIcon.style.display = 'block';
            if (unmutedIcon) unmutedIcon.style.display = 'none';
        } else {
            if (mutedIcon) mutedIcon.style.display = 'none';
            if (unmutedIcon) unmutedIcon.style.display = 'block';
        }
    }

    function updateHeroPlayer(index) {
        currentIndex = index;
        const v = videos[currentIndex];
        if (heroVideo) {
            heroVideo.src = v.src;
            heroVideo.load();
            heroVideo.pause();
            isAtThumbnail = true;
            carouselContainer.classList.remove('is-playing');
            
            applyAudioState();

            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';

            heroVideo.addEventListener('loadedmetadata', function() {
                heroVideo.currentTime = heroVideo.duration / 2;
                timecodeDisplay.textContent = `${formatTime(heroVideo.currentTime)} / ${formatTime(heroVideo.duration)}`;
            }, { once: true });
        }
        if (overlayTitle) {
            overlayTitle.textContent = v.title;
        }
    }

    if (heroVideo) {
        applyAudioState();
        heroVideo.pause();

        heroVideo.addEventListener('loadedmetadata', () => {
            heroVideo.currentTime = heroVideo.duration / 2;
            timecodeDisplay.textContent = `${formatTime(heroVideo.currentTime)} / ${formatTime(heroVideo.duration)}`;
        }, { once: true });

        heroVideo.addEventListener('timeupdate', () => {
            if (!isNaN(heroVideo.duration) && !isAtThumbnail) {
                const percent = (heroVideo.currentTime / heroVideo.duration) * 100;
                timelineProgress.style.width = `${percent}%`;
                timecodeDisplay.textContent = `${formatTime(heroVideo.currentTime)} / ${formatTime(heroVideo.duration)}`;
            }
        });

        heroVideo.addEventListener('ended', () => {
            heroVideo.pause();
            isAtThumbnail = true;
            carouselContainer.classList.remove('is-playing');
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            heroVideo.currentTime = heroVideo.duration / 2;
        });

        heroVideo.addEventListener('click', () => {
            if (document.fullscreenElement) return;
            dismissTip1();
            togglePlayState();
        });
    }

    function togglePlayState() {
        if (!heroVideo) return;
        dismissTip1();
        if (heroVideo.paused) {
            if (isAtThumbnail) {
                heroVideo.currentTime = 0;
                isAtThumbnail = false;
            }
            heroVideo.play();
            carouselContainer.classList.add('is-playing');
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            heroVideo.pause();
            carouselContainer.classList.remove('is-playing');
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }

    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dismissTip1();
            togglePlayState();
        });
    }

    if (muteUnmuteBtn) {
        muteUnmuteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            globalMuted = !globalMuted;
            if (!globalMuted && globalVolume === 0) {
                globalVolume = 1;
            }
            applyAudioState();
        });
    }

    if (volumeSlider && heroVideo) {
        volumeSlider.addEventListener('input', (e) => {
            e.stopPropagation();
            globalVolume = parseFloat(volumeSlider.value);
            globalMuted = (globalVolume === 0);
            applyAudioState();
        });
        volumeSlider.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    if (timelineContainer && heroVideo) {
        timelineContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            dismissTip1();
            const rect = timelineContainer.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            if (!isNaN(heroVideo.duration)) {
                if (isAtThumbnail) {
                    isAtThumbnail = false;
                    carouselContainer.classList.add('is-playing');
                }
                heroVideo.currentTime = pos * heroVideo.duration;
                timelineProgress.style.width = `${pos * 100}%`;
            }
        });
    }

    // =========================================
    // Internal Grid Asset Cards Logic (Fixed)
    // =========================================
    document.querySelectorAll('.player-asset-card').forEach(card => {
        const vid = card.querySelector('video');
        if (vid) {
            if (vid.readyState >= 1 && !isNaN(vid.duration)) {
                vid.currentTime = vid.duration / 2;
            } else {
                vid.addEventListener('loadedmetadata', () => {
                    vid.currentTime = vid.duration / 2;
                }, { once: true });
            }

            card.addEventListener('mouseenter', () => {
                vid.currentTime = 0;
                vid.play().catch(() => {});
            });

            card.addEventListener('mouseleave', () => {
                vid.pause();
                vid.currentTime = vid.duration / 2;
            });
        }
    });

    // =========================================
    // Portfolio Grid Custom Players Logic
    // =========================================
    document.querySelectorAll('.custom-grid-player').forEach(container => {
        const vid = container.querySelector('video');
        const playBtn = container.querySelector('.grid-play-btn');
        const playIcon = container.querySelector('.play-icon');
        const pauseIcon = container.querySelector('.pause-icon');
        const timeline = container.querySelector('.grid-timeline');
        const progress = container.querySelector('.timeline-progress');
        const timecode = container.querySelector('.timecode');
        const muteBtn = container.querySelector('.grid-mute-btn');
        const mutedIcon = container.querySelector('.muted-icon');
        const unmutedIcon = container.querySelector('.unmuted-icon');
        const volSlider = container.querySelector('.grid-volume-slider');
        const fullscreenBtn = container.querySelector('.grid-fullscreen-btn');

        let isAtThumb = true;

        if (vid) {
            vid.muted = true;
            vid.volume = 0;

            if (vid.readyState >= 1 && !isNaN(vid.duration)) {
                vid.currentTime = vid.duration / 2;
                timecode.textContent = `${formatTime(vid.currentTime)} / ${formatTime(vid.duration)}`;
            } else {
                vid.addEventListener('loadedmetadata', () => {
                    vid.currentTime = vid.duration / 2;
                    timecode.textContent = `${formatTime(vid.currentTime)} / ${formatTime(vid.duration)}`;
                }, { once: true });
            }

            vid.addEventListener('timeupdate', () => {
                if (!isNaN(vid.duration) && !isAtThumb) {
                    const pct = (vid.currentTime / vid.duration) * 100;
                    progress.style.width = `${pct}%`;
                    timecode.textContent = `${formatTime(vid.currentTime)} / ${formatTime(vid.duration)}`;
                }
            });

            vid.addEventListener('ended', () => {
                vid.pause();
                isAtThumb = true;
                container.classList.remove('is-playing');
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
                vid.currentTime = vid.duration / 2;
            });

            vid.addEventListener('play', () => {
                if (isAtThumb) {
                    vid.currentTime = 0;
                    isAtThumb = false;
                }
                container.classList.add('is-playing');
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
            });

            vid.addEventListener('pause', () => {
                if (!isAtThumb) {
                    container.classList.remove('is-playing');
                    playIcon.style.display = 'block';
                    pauseIcon.style.display = 'none';
                }
            });

            function toggleGridPlay() {
                if (vid.paused) {
                    vid.play().catch(() => {});
                } else {
                    vid.pause();
                }
            }

            if (playBtn) {
                playBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleGridPlay();
                });
            }

            vid.addEventListener('click', () => {
                if (document.fullscreenElement) return;
                toggleGridPlay();
            });

            if (timeline) {
                timeline.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const rect = timeline.getBoundingClientRect();
                    const pos = (e.clientX - rect.left) / rect.width;
                    if (!isNaN(vid.duration)) {
                        if (isAtThumb) {
                            isAtThumb = false;
                            container.classList.add('is-playing');
                        }
                        vid.currentTime = pos * vid.duration;
                        progress.style.width = `${pos * 100}%`;
                    }
                });
            }

            if (muteBtn) {
                muteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    vid.muted = !vid.muted;
                    if (vid.muted) {
                        mutedIcon.style.display = 'block';
                        unmutedIcon.style.display = 'none';
                        if (volSlider) volSlider.value = 0;
                    } else {
                        mutedIcon.style.display = 'none';
                        unmutedIcon.style.display = 'block';
                        vid.volume = volSlider ? parseFloat(volSlider.value) || 1 : 1;
                        if (volSlider && volSlider.value == 0) volSlider.value = 1;
                    }
                });
            }

            if (volSlider) {
                volSlider.addEventListener('input', (e) => {
                    e.stopPropagation();
                    const val = parseFloat(volSlider.value);
                    vid.volume = val;
                    vid.muted = (val === 0);
                    if (val === 0) {
                        mutedIcon.style.display = 'block';
                        unmutedIcon.style.display = 'none';
                    } else {
                        mutedIcon.style.display = 'none';
                        unmutedIcon.style.display = 'block';
                    }
                });
                volSlider.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }

            if (fullscreenBtn) {
                fullscreenBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (vid.requestFullscreen) {
                        vid.requestFullscreen();
                    } else if (vid.webkitRequestFullscreen) {
                        vid.webkitRequestFullscreen();
                    } else if (vid.msRequestFullscreen) {
                        vid.msRequestFullscreen();
                    }
                });
            }
        }
    });

    const prevBtn = document.getElementById('prevVideoBtn');
    const nextBtn = document.getElementById('nextVideoBtn');

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dismissTip1();
            let newIdx = currentIndex - 1;
            if (newIdx < 0) newIdx = videos.length - 1;
            updateHeroPlayer(newIdx);
            if (playerGridView) playerGridView.classList.remove('active');
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dismissTip1();
            let newIdx = currentIndex + 1;
            if (newIdx >= videos.length) newIdx = 0;
            updateHeroPlayer(newIdx);
            if (playerGridView) playerGridView.classList.remove('active');
        });
    }

    const toggleGridBtn = document.getElementById('toggleGridBtn');

    if (toggleGridBtn && playerGridView) {
        toggleGridBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dismissTip1();
            dismissTip2();
            playerGridView.classList.toggle('active');
        });
    }

    const playerAssetCards = document.querySelectorAll('.player-asset-card');
    playerAssetCards.forEach(card => {
        card.addEventListener('click', () => {
            const idx = parseInt(card.getAttribute('data-index'));
            updateHeroPlayer(idx);
            if (playerGridView) {
                playerGridView.classList.remove('active');
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
        if (heroVideo && !isNaN(heroVideo.duration)) {
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                heroVideo.currentTime = Math.min(heroVideo.duration, heroVideo.currentTime + 10);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                heroVideo.currentTime = Math.max(0, heroVideo.currentTime - 10);
            }
        }
    });

    const viewWorkflowBtn = document.getElementById('viewWorkflowBtn');
    if (viewWorkflowBtn) {
        viewWorkflowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1 
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.filter(entry => entry.isIntersecting).forEach(entry => {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(el => observer.observe(el));

    // Accordion Logic
    const accordions = document.querySelectorAll(".accordion");
    accordions.forEach(acc => {
        acc.addEventListener("click", function() {
            this.classList.add('dot-viewed');

            accordions.forEach(otherAcc => {
                if (otherAcc !== this && otherAcc.classList.contains("active")) {
                    otherAcc.classList.remove("active");
                    if (otherAcc.nextElementSibling) {
                        otherAcc.nextElementSibling.style.maxHeight = null;
                    }
                }
            });

            this.classList.toggle("active");
            const panel = this.nextElementSibling;
            if (panel) {
                if (panel.style.maxHeight) {
                    panel.style.maxHeight = null;
                } else {
                    panel.style.maxHeight = panel.scrollHeight + "px";
                }
            }
        });
    });
});