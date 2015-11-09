var AUDIO = (function() {
    var narrativePlayer = null;
    var ambientPlayer = null;
    var ambientId = null;
    var subtitles = null;
    var progressInterval = null;
    var narrativeURL = null;
    var subtitlesURL = null;
    var ambientURL = null;
    var narrativeVisible = false;

    var checkForAudio = function(slideIndex) {
        var $slide = $slides.eq(slideIndex);
        var narrativeFilename = $slide.attr('data-narrative');

        if (narrativeFilename) {
            $thisPlayerProgress = $slide.find('.player-progress');
            $playedBar = $slide.find('.player-progress .played');
            $controlBtn = $slide.find('.control-btn');
            $subtitleWrapper = $slide.find('.subtitle-wrapper');
            $subtitles = $slide.find('.subtitles');

            narrativeURL = APP_CONFIG.S3_BASE_URL + '/assets/audio/' + narrativeFilename + '.mp3';
            subtitlesURL = APP_CONFIG.S3_BASE_URL + '/data/' + narrativeFilename + '.json';
            setNarrativeMedia();
        // grid slide
        } else if (slideIndex === $slides.length - 2) {
            _setUpGrid($slide);
        } else {
            _pauseNarrativePlayer();
            narrativeVisible = false;
        }
    }

    var setUpNarrativePlayer = function() {
        $narrativePlayer.jPlayer({
            swfPath: 'js/lib',
            loop: false,
            supplied: 'mp3',
            timeupdate: onNarrativeTimeupdate,
        });
    }

    var _playGridAudio = function($box) {
        $('.img-box').removeClass('playing');
        $box.addClass('playing');
        var narrativeFilename = $box.data('audio');
        narrativeURL = APP_CONFIG.S3_BASE_URL + '/assets/audio/' + narrativeFilename + '.mp3';
        subtitlesURL = APP_CONFIG.S3_BASE_URL + '/data/' + narrativeFilename + '.json';
        setNarrativeMedia();
    }

    var _setUpGrid = function($slide) {
        $thisPlayerProgress = $slide.find('.player-progress');
        $playedBar = $slide.find('.player-progress .played');
        $controlBtn = $slide.find('.control-btn');
        $subtitleWrapper = $slide.find('.subtitle-wrapper');
        $subtitles = $slide.find('.subtitles');

        $('.img-box').click(function(e) {
            _playGridAudio($(this));
        });

        _playGridAudio($('.img-box.first'));
    }

    var setNarrativeMedia = function() {
        $.getJSON(subtitlesURL, function(data) {
            subtitles = data.subtitles;
            _startNarrativePlayer();
        });
    }

    var _startNarrativePlayer = function() {
        $narrativePlayer.jPlayer('setMedia', {
            mp3: narrativeURL
        });
        narrativeVisible = true;
        animateSubtitles(0.01);
        setTimeout(function() {
            if (narrativeVisible) {
                $narrativePlayer.jPlayer('play');
                $controlBtn.removeClass('play').addClass('pause');
            }
        }, 1000)
    }

    var _resumeNarrativePlayer = function() {
        $narrativePlayer.jPlayer('play');
        $controlBtn.removeClass('play').addClass('pause');
    }

    var _pauseNarrativePlayer = function(end) {
        $narrativePlayer.jPlayer('pause');
        if (end) {
            $playedBar.css('width', $thisPlayerProgress.width() + 'px');
        }
        $controlBtn.removeClass('pause').addClass('play');
    }

    var toggleNarrativeAudio = function() {
        if ($narrativePlayer.data().jPlayer.status.paused) {
            _resumeNarrativePlayer();
        } else {
            _pauseNarrativePlayer(false);
        }
    }

    var fakeNarrativePlayer = function() {
        $narrativePlayer.jPlayer('setMedia', {
            mp3: APP_CONFIG.S3_BASE_URL + '/assets/audio/' + 'reich_careful.mp3'
        }).jPlayer('pause');
    }

    var onNarrativeTimeupdate = function(e) {
        if (narrativeVisible) {
            var totalTime = e.jPlayer.status.duration;
            var position = e.jPlayer.status.currentTime;

            // animate progress bar
            var percentage = position / totalTime;

            // if we're resetting the bar 
            if (position === 0) {
                $playedBar.addClass('no-transition');
                $playedBar.css('width', 0);
            } else {
                $playedBar.removeClass('no-transition');
                $playedBar.css('width', $thisPlayerProgress.width() * percentage + 'px');

                if (percentage === 1) {
                    $controlBtn.removeClass('pause').addClass('play');
                }
            }

            animateSubtitles(position);
        }
    }

    var animateSubtitles = function(position) {
        if (subtitles) {
            // animate subtitles
            var activeSubtitle = null;
            for (var i = 0; i < subtitles.length; i++) {
                if (position > 0) {
                    if (position < subtitles[i]['time']) {
                        if (i > 0) {
                            activeSubtitle = subtitles[i - 1]['transcript'];
                        } else {
                            activeSubtitle = subtitles[i]['transcript'];
                        }
                        $subtitleWrapper.fadeIn();
                        $subtitles.html(activeSubtitle);
                        break;
                    } else {
                        // this is the last one
                        activeSubtitle = subtitles[i]['transcript'];
                        $subtitles.html(activeSubtitle);
                    }
                }
            }
        }
    }

    var setUpAmbientPlayer = function() {
        $ambientPlayer.jPlayer({
            swfPath: 'js/lib',
            supplied: 'mp3',
            loop: true,
            volume: 0.1,
        });
    }

    var setAmbientMedia = function(url) {
        $ambientPlayer.jPlayer('setMedia', {
            mp3: url
        }).jPlayer('play');
    }

    var fakeAmbientPlayer = function() {
        $ambientPlayer.jPlayer('setMedia', {
            mp3: APP_CONFIG.S3_BASE_URL + '/assets/audio/' + 'doctor_ambient.mp3'
        }).jPlayer('pause');
    }

    var toggleAllAudio = function() {
        if (isHidden()) {
            if (narrativeVisible) {
                _pauseNarrativePlayer(false);
            }
            $ambientPlayer.jPlayer('pause');

        } else {
            if (narrativeVisible) {
                _resumeNarrativePlayer();
            }
            $ambientPlayer.jPlayer('play');
        }
    }

    return {
        'checkForAudio': checkForAudio,
        'toggleNarrativeAudio': toggleNarrativeAudio,
        'toggleAllAudio': toggleAllAudio,
        'setUpAmbientPlayer': setUpAmbientPlayer,
        'setUpNarrativePlayer': setUpNarrativePlayer,
        'fakeNarrativePlayer': fakeNarrativePlayer,
    }
}());