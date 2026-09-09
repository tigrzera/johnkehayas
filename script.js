document.addEventListener('DOMContentLoaded', () => {
    
    // Prevent browser scroll restoration on refresh/restart
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // Optimized Cloudinary Auto-Transcoded & Compressed Streams
    const videos = [
        { src: "https://res.cloudinary.com/xxubsnyx/video/upload/f_auto,q_auto,w_1280/v1788909996/1142_County_Road_43.mp4", title: "1142 County Road 43" },
        { src: "https://res.cloudinary.com/xxubsnyx/video/upload/f_auto,q_auto,w_1280/v1788909996/373_Craig_Road.mp4", title: "373 Craig Road" },
        { src: "https://res.cloudinary.com/xxubsnyx/video/upload/f_auto,q_auto,w_1280/v1788909996/36_Marchbrook_Circle.mp4", title: "36 Marchbrook Circle" },
        { src: "https://res.cloudinary.com/xxubsnyx/video/upload/f_auto,q_auto,w_1280/v1788909993/Imagine_Dragons_-_Believer_Make_The_Cut.mp4", title: "Imagine Dragons - Believer (Make The Cut)" },
        { src: "https://res.cloudinary.com/xxubsnyx/video/upload/f_auto,q_auto,w_1280/v1788909994/Nike_Mock_Advertisement_-_John_Kehayas.mp4", title: "Nike Mock Advertisement - John Kehayas" },
        { src: "https://res.cloudinary.com/xxubsnyx/video/upload/f_auto,q_auto,w_1280/v1788909993/R34_GTR_Edit_Travis_Scott_-_SDP_Interlude.mp4", title: "R34 GTR Edit (Travis Scott - SDP Interlude)" }
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
    const centerPlayPauseBtn = document.getElementById('centerPlayPauseBtn');
    const centerPlayIcon = document.getElementById('centerPlayIcon');
    const centerPauseIcon = document.getElementById('centerPauseIcon');
    const skipBackBtn = document.getElementById('skipBackBtn');
    const skipForwardBtn = document.getElementById('skipForwardBtn');
    const muteUnmuteBtn = document.getElementById('muteUnmuteBtn');
    const mutedIcon = document.getElementById('mutedIcon');
    const unmutedIcon = document.getElementById('unmutedIcon');
    const volumeSlider = document.getElementById('volumeSlider');
    const timelineContainer = document.getElementById('timelineContainer');
    const timelineProgress = document.getElementById('timelineProgress');
    const timecodeDisplay = document.getElementById('timecodeDisplay');
    const carouselFullscreenBtn = document.getElementById('carouselFullscreenBtn');
    const prevBtn = document.getElementById('prevVideoBtn');
    const nextBtn = document.getElementById('nextVideoBtn');
    const toggleGridBtn = document.getElementById('toggleGridBtn');

    // Tooltip Elements
    const carouselPlayTip = document.getElementById('carouselPlayTip');
    const carouselTip1 = document.getElementById('carouselTip1');
    const carouselTip2 = document.getElementById('carouselTip2');

    let isAtThumbnail = true;
    let playTipDismissed = false;
    let navTipsTriggered = false;
    let navTipsCompleted = false;

    let playbackTimer = null;
    let tip1Timer = null;
    let tip2Timer = null;

    function isGridOpen() {
        return playerGridView && playerGridView.classList.contains('active');
    }

    function setGridState(open) {
        if (!playerGridView) return;
        if (open) {
            playerGridView.classList.add('active');
            if (carouselContainer) carouselContainer.classList.add('grid-open');
        } else {
            playerGridView.classList.remove('active');
            if (carouselContainer) carouselContainer.classList.remove('grid-open');
        }
    }

    // Immediately present the play tip & pulsing play button
    if (carouselPlayTip) {
        carouselPlayTip.classList.add('active');
    }
    if (playPauseBtn) {
        playPauseBtn.classList.add('tip-highlight');
    }

    function updatePlayPauseIcons(isPlaying) {
        if (playIcon) playIcon.style.display = isPlaying ? 'none' : 'block';
        if (pauseIcon) pauseIcon.style.display = isPlaying ? 'block' : 'none';
        if (centerPlayIcon) centerPlayIcon.style.display = isPlaying ? 'none' : 'block';
        if (centerPauseIcon) centerPauseIcon.style.display = isPlaying ? 'block' : 'none';
        if (centerPlayIcon) {
            centerPlayIcon.style.marginLeft = isPlaying ? '0' : '2px';
        }
    }

    // =========================================
    // Dynamic Carousel Tip Alignment
    // =========================================
    function alignTip(tip, targetElement) {
        if (!tip || !targetElement) return;
        const wrapper = document.querySelector('.carousel-outer-wrapper');
        if (!wrapper) return;

        const wrapperRect = wrapper.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        const targetCenterX = targetRect.left + (targetRect.width / 2);

        const tipWidth = tip.offsetWidth || 230;
        const idealLeft = (targetCenterX - wrapperRect.left) - (tipWidth / 2);
        const clampedLeft = Math.max(10, Math.min(wrapperRect.width - tipWidth - 10, idealLeft));
        tip.style.left = `${clampedLeft}px`;
        tip.style.right = 'auto';

        const tipLeftOnScreen = wrapperRect.left + clampedLeft;
        const arrowLeft = (targetCenterX - tipLeftOnScreen) - 5;
        const clampedArrowLeft = Math.max(14, Math.min(tipWidth - 24, arrowLeft));
        tip.style.setProperty('--arrow-left', `${clampedArrowLeft}px`);
    }

    function alignTipBetween(tip, el1, el2) {
        if (!tip || !el1 || !el2) return;
        const wrapper = document.querySelector('.carousel-outer-wrapper');
        if (!wrapper) return;

        const wrapperRect = wrapper.getBoundingClientRect();
        const rect1 = el1.getBoundingClientRect();
        const rect2 = el2.getBoundingClientRect();
        const targetCenterX = (rect1.left + rect2.right) / 2;

        const tipWidth = tip.offsetWidth || 260;
        const idealLeft = (targetCenterX - wrapperRect.left) - (tipWidth / 2);
        const clampedLeft = Math.max(10, Math.min(wrapperRect.width - tipWidth - 10, idealLeft));
        tip.style.left = `${clampedLeft}px`;
        tip.style.right = 'auto';

        const tipLeftOnScreen = wrapperRect.left + clampedLeft;
        const arrowLeft = (targetCenterX - tipLeftOnScreen) - 5;
        const clampedArrowLeft = Math.max(14, Math.min(tipWidth - 24, arrowLeft));
        tip.style.setProperty('--arrow-left', `${clampedArrowLeft}px`);
    }

    function alignCarouselTips() {
        if (carouselPlayTip && playPauseBtn) {
            alignTip(carouselPlayTip, playPauseBtn);
        }
        if (carouselTip1 && prevBtn && nextBtn) {
            alignTipBetween(carouselTip1, prevBtn, nextBtn);
        }
        if (carouselTip2 && toggleGridBtn) {
            alignTip(carouselTip2, toggleGridBtn);
        }
    }

    alignCarouselTips();
    setTimeout(alignCarouselTips, 150);
    window.addEventListener('resize', alignCarouselTips);
    window.addEventListener('load', alignCarouselTips);

    // =========================================
    // Carousel Tooltip Sequence
    // =========================================
    function dismissPlayTip() {
        if (!playTipDismissed) {
            playTipDismissed = true;
            if (carouselPlayTip) carouselPlayTip.classList.remove('active');
            if (playPauseBtn) playPauseBtn.classList.remove('tip-highlight');
        }
    }

    function startPlaybackTipSequence() {
        if (navTipsTriggered || navTipsCompleted) return;
        
        playbackTimer = setTimeout(() => {
            navTipsTriggered = true;
            showNavigationTips();
        }, 2500);
    }

    function showNavigationTips() {
        if (!carouselTip1 || navTipsCompleted) return;
        
        carouselTip1.classList.add('active');
        if (prevBtn) prevBtn.classList.add('tip-highlight');
        if (nextBtn) nextBtn.classList.add('tip-highlight');
        alignCarouselTips();

        tip1Timer = setTimeout(() => {
            transitionToTip2();
        }, 6000);
    }

    function transitionToTip2() {
        if (tip1Timer) clearTimeout(tip1Timer);
        if (carouselTip1) carouselTip1.classList.remove('active');
        if (prevBtn) prevBtn.classList.remove('tip-highlight');
        if (nextBtn) nextBtn.classList.remove('tip-highlight');

        if (carouselTip2 && !navTipsCompleted) {
            setTimeout(() => {
                carouselTip2.classList.add('active');
                if (toggleGridBtn) toggleGridBtn.classList.add('tip-highlight');
                alignCarouselTips();

                tip2Timer = setTimeout(() => {
                    dismissTip2();
                }, 6000);
            }, 300);
        }
    }

    function dismissTip2() {
        if (tip2Timer) clearTimeout(tip2Timer);
        if (carouselTip2) carouselTip2.classList.remove('active');
        if (toggleGridBtn) toggleGridBtn.classList.remove('tip-highlight');
        navTipsCompleted = true;
    }

    // =========================================
    // Core Player & Timeline Logic
    // =========================================
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
            if (carouselContainer) carouselContainer.classList.remove('is-playing');
            
            applyAudioState();
            updatePlayPauseIcons(false);

            heroVideo.addEventListener('loadedmetadata', function() {
                heroVideo.currentTime = 0;
                if (timecodeDisplay) {
                    timecodeDisplay.textContent = `${formatTime(0)} / ${formatTime(heroVideo.duration)}`;
                }
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
            if (timecodeDisplay) {
                timecodeDisplay.textContent = `${formatTime(0)} / ${formatTime(heroVideo.duration)}`;
            }
        }, { once: true });

        heroVideo.addEventListener('timeupdate', () => {
            if (!isNaN(heroVideo.duration) && !isAtThumbnail) {
                const percent = (heroVideo.currentTime / heroVideo.duration) * 100;
                if (timelineProgress) timelineProgress.style.width = `${percent}%`;
                if (timecodeDisplay) {
                    timecodeDisplay.textContent = `${formatTime(heroVideo.currentTime)} / ${formatTime(heroVideo.duration)}`;
                }
            }
        });

        heroVideo.addEventListener('play', () => {
            dismissPlayTip();
            startPlaybackTipSequence();
            updatePlayPauseIcons(true);
        });

        heroVideo.addEventListener('pause', () => {
            updatePlayPauseIcons(false);
        });

        heroVideo.addEventListener('ended', () => {
            heroVideo.pause();
            isAtThumbnail = true;
            if (carouselContainer) carouselContainer.classList.remove('is-playing');
            updatePlayPauseIcons(false);
            heroVideo.currentTime = 0;
        });

        heroVideo.addEventListener('click', () => {
            if (document.fullscreenElement) return;
            if (isGridOpen()) return;
            togglePlayState();
        });
    }

    function togglePlayState() {
        if (!heroVideo) return;
        if (isGridOpen()) return;
        dismissPlayTip();
        if (heroVideo.paused) {
            if (isAtThumbnail) {
                isAtThumbnail = false;
            }
            heroVideo.play();
            if (carouselContainer) carouselContainer.classList.add('is-playing');
            updatePlayPauseIcons(true);
        } else {
            heroVideo.pause();
            if (carouselContainer) carouselContainer.classList.remove('is-playing');
            updatePlayPauseIcons(false);
        }
    }

    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePlayState();
        });
    }

    if (centerPlayPauseBtn) {
        centerPlayPauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isGridOpen()) return;
            togglePlayState();
        });
    }

    if (skipBackBtn && heroVideo) {
        skipBackBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isGridOpen()) return;
            dismissPlayTip();
            if (!isNaN(heroVideo.duration)) {
                heroVideo.currentTime = Math.max(0, heroVideo.currentTime - 5);
            }
        });
    }

    if (skipForwardBtn && heroVideo) {
        skipForwardBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isGridOpen()) return;
            dismissPlayTip();
            if (!isNaN(heroVideo.duration)) {
                heroVideo.currentTime = Math.min(heroVideo.duration, heroVideo.currentTime + 5);
            }
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
            if (isGridOpen()) return;
            dismissPlayTip();
            const rect = timelineContainer.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            if (!isNaN(heroVideo.duration)) {
                if (isAtThumbnail) {
                    isAtThumbnail = false;
                    if (carouselContainer) carouselContainer.classList.add('is-playing');
                }
                heroVideo.currentTime = pos * heroVideo.duration;
                if (timelineProgress) timelineProgress.style.width = `${pos * 100}%`;
            }
        });
    }

    // Carousel Fullscreen Control
    if (carouselFullscreenBtn && heroVideo) {
        carouselFullscreenBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (heroVideo.requestFullscreen) {
                heroVideo.requestFullscreen();
            } else if (heroVideo.webkitRequestFullscreen) {
                heroVideo.webkitRequestFullscreen();
            } else if (heroVideo.msRequestFullscreen) {
                heroVideo.msRequestFullscreen();
            }
        });
    }

    // Carousel Navigation Controls
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (carouselTip1 && carouselTip1.classList.contains('active')) {
                transitionToTip2();
            }
            let newIdx = currentIndex - 1;
            if (newIdx < 0) newIdx = videos.length - 1;
            updateHeroPlayer(newIdx);
            setGridState(false);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (carouselTip1 && carouselTip1.classList.contains('active')) {
                transitionToTip2();
            }
            let newIdx = currentIndex + 1;
            if (newIdx >= videos.length) newIdx = 0;
            updateHeroPlayer(newIdx);
            setGridState(false);
        });
    }

    if (toggleGridBtn && playerGridView) {
        toggleGridBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (carouselTip2 && carouselTip2.classList.contains('active')) {
                dismissTip2();
            }
            const shouldOpen = !playerGridView.classList.contains('active');
            setGridState(shouldOpen);
        });
    }

    // Stop propagation on the grid overlay to protect background clicks
    if (playerGridView) {
        playerGridView.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Popover Grid View Cards
    document.querySelectorAll('.player-asset-card').forEach((card, index) => {
        const vid = card.querySelector('video');
        if (vid && videos[index]) {
            vid.src = videos[index].src;

            card.addEventListener('mouseenter', () => {
                vid.play().catch(() => {});
            });

            card.addEventListener('mouseleave', () => {
                vid.pause();
                vid.currentTime = 0;
            });

            card.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(card.getAttribute('data-index'));
                updateHeroPlayer(idx);
                setGridState(false);
            });
        }
    });

    // Portfolio Grid Custom Players Logic
    document.querySelectorAll('.custom-grid-player').forEach((container, index) => {
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

        if (vid && videos[index]) {
            vid.src = videos[index].src;
            vid.muted = true;
            vid.volume = 0;

            vid.addEventListener('loadedmetadata', () => {
                if (timecode) timecode.textContent = `${formatTime(0)} / ${formatTime(vid.duration)}`;
            }, { once: true });

            vid.addEventListener('timeupdate', () => {
                if (!isNaN(vid.duration) && !isAtThumb) {
                    const pct = (vid.currentTime / vid.duration) * 100;
                    if (progress) progress.style.width = `${pct}%`;
                    if (timecode) timecode.textContent = `${formatTime(vid.currentTime)} / ${formatTime(vid.duration)}`;
                }
            });

            vid.addEventListener('ended', () => {
                vid.pause();
                isAtThumb = true;
                container.classList.remove('is-playing');
                if (playIcon) playIcon.style.display = 'block';
                if (pauseIcon) pauseIcon.style.display = 'none';
                vid.currentTime = 0;
            });

            vid.addEventListener('play', () => {
                if (isAtThumb) {
                    isAtThumb = false;
                }
                container.classList.add('is-playing');
                if (playIcon) playIcon.style.display = 'none';
                if (pauseIcon) pauseIcon.style.display = 'block';
            });

            vid.addEventListener('pause', () => {
                if (!isAtThumb) {
                    container.classList.remove('is-playing');
                    if (playIcon) playIcon.style.display = 'block';
                    if (pauseIcon) pauseIcon.style.display = 'none';
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
                        if (progress) progress.style.width = `${pos * 100}%`;
                    }
                });
            }

            if (muteBtn) {
                muteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    vid.muted = !vid.muted;
                    if (vid.muted) {
                        if (mutedIcon) mutedIcon.style.display = 'block';
                        if (unmutedIcon) unmutedIcon.style.display = 'none';
                        if (volSlider) volSlider.value = 0;
                    } else {
                        if (mutedIcon) mutedIcon.style.display = 'none';
                        if (unmutedIcon) unmutedIcon.style.display = 'block';
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
                        if (mutedIcon) mutedIcon.style.display = 'block';
                        if (unmutedIcon) unmutedIcon.style.display = 'none';
                    } else {
                        if (mutedIcon) mutedIcon.style.display = 'none';
                        if (unmutedIcon) unmutedIcon.style.display = 'block';
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

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
        if (isGridOpen()) return;
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

    // Workflow Scroll Button
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

    // Scroll Reveal Animations
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

    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

    // Accordion Handling
    document.querySelectorAll('.accordion').forEach(acc => {
        acc.addEventListener('click', function() {
            this.classList.add('dot-viewed');

            document.querySelectorAll('.accordion').forEach(otherAcc => {
                if (otherAcc !== this && otherAcc.classList.contains('active')) {
                    otherAcc.classList.remove('active');
                    if (otherAcc.nextElementSibling) {
                        otherAcc.nextElementSibling.style.maxHeight = null;
                    }
                }
            });

            this.classList.toggle('active');
            const panel = this.nextElementSibling;
            if (panel) {
                panel.style.maxHeight = panel.style.maxHeight ? null : `${panel.scrollHeight}px`;
            }
        });
    });
});