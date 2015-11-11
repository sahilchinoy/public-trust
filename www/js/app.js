// Global state
var $upNext = null;
var $w;
var $h;
var $slides;
var $arrows;
var $nextArrow;
var $controlBtn;
var $thisPlayerProgress;
var $playedBar;
var $subtitleWrapper;
var $subtitles;
var $slideTitle;
var $ambientPlayer;
var $narrativePlayer;
var $progressIndicator
var $currentProgress;
var isTouch = Modernizr.touch;
var mobileSuffix;
var aspectWidth = 16;
var aspectHeight = 9;
var optimalWidth;
var optimalHeight;
var w;
var h;
var completion = 0;
var visibilityProperty = null;

var resize = function() {
    $w = $(window).width();
    $h = $(window).height();

    $slides.width($w);

    optimalWidth = ($h * aspectWidth) / aspectHeight;
    optimalHeight = ($w * aspectHeight) / aspectWidth;

    w = $w;
    h = optimalHeight;

    if (optimalWidth > $w) {
        w = optimalWidth;
        h = $h;
    }
};

var setUpFullPage = function() {
    $.fn.fullpage({
        anchors: false,
        autoScrolling: false,
        keyboardScrolling: false,
        verticalCentered: false,
        fixedElements: '.primary-navigation, .progress-indicator',
        resize: false,
        css3: true,
        loopHorizontal: false,
        afterRender: onPageLoad,
        afterSlideLoad: lazyLoad,
    });
};

var onPageLoad = function() {
    setSlidesForLazyLoading(0);
    $('.section').css({
      'opacity': 1,
      'visibility': 'visible',
    });
    showNavigation();
};

// after a new slide loads
var lazyLoad = function(anchorLink, index, slideAnchor, slideIndex) {
    setSlidesForLazyLoading(slideIndex);
    showNavigation();
    AUDIO.checkForAudio(slideIndex);
    animateProgress(slideIndex);
};

var setSlidesForLazyLoading = function(slideIndex) {
    /*
    * Sets up a list of slides based on your position in the deck.
    * Lazy-loads images in future slides because of reasons.
    */
    var slides = [
        $slides.eq(slideIndex),
        $slides.eq(slideIndex + 1),
        $slides.eq(slideIndex + 2),
        $slides.eq(slideIndex + 3),
        $slides.eq(slideIndex + 4)
    ];

    // Mobile suffix should be blank by default.
    mobileSuffix = '';
    
    /*if ($w < 769) {
        mobileSuffix = '-vertical';
    }*/

    for (var i = 0; i < slides.length; i++) {
        loadImages(slides[i]);
    };

}

var loadImages = function($slide) {
    /*
    * Sets the background image on a div for our fancy slides.
    */
    if ($slide.data('bgimage')) {
        var image_filename = $slide.data('bgimage').split('.')[0];
        var image_extension = '.' + $slide.data('bgimage').split('.')[1];
        var image_path = 'assets/' + image_filename + image_extension;

        if ($slide.css('background-image') === 'none') {
            $slide.css('background-image', 'url(' + image_path +')');
        }
    }

    /*
    * Lazy-load regular, inline images.
    */
    var $images = $slide.find('img.lazy-load');
    if ($images.length > 0) {
        for (var i = 0; i < $images.length; i++) {
            var image = $images.eq(i).data('src');
            var image_path = 'assets/' + image + mobileSuffix + '.jpg'
            $images.eq(i).attr('src', image_path);
        }
    }
};

var showNavigation = function() {
    /*
    * Nav doesn't exist by default.
    * This function loads it up.
    */

    if ($slides.first().hasClass('active')) {
        /*
        * Show only right arrow on titlecard.
        */
        if (!$arrows.hasClass('active')) {
            showArrows();
        }
        $prevArrow.removeClass('active');
        $prevArrow.hide();

        $nextArrow.on('click', onFirstRightArrowClick);
    }

    else if ($slides.last().hasClass('active')) {
        /*
        * Last card gets no next arrow but does have the nav.
        */
        if (!$arrows.hasClass('active')) {
            showArrows();
        }

        $nextArrow.removeClass('active');
        $nextArrow.hide();
    } else {
        /*
        * All of the other cards? Arrows and navs.
        */
        if ($arrows.filter('active').length != $arrows.length) {
            showArrows();
        }
    }

    $progressIndicator.show();
}

var showArrows = function() {
    /*
    * Show the arrows.
    */
    $arrows.addClass('active');
    $arrows.show();
};

var animateProgress = function(index) {
    var totalSlides = $slides.length;
    var percentage = (index + 1) / totalSlides;
    $currentProgress.css('width', percentage * 100 + '%');

    // No progress indicator on first slide
    if (index === 0) {
        $progressIndicator.width(0);
    } else {
        $progressIndicator.width('100%');
    }

    $progressIndicator.width('100%');
}

var onFirstRightArrowClick = function() {
    /*
    * Fake audio player for mobile.
    */
    if (isTouch) {
        if ($slides.first().hasClass('active')) {
            AUDIO.fakeNarrativePlayer();
        }
    }
}

var onDocumentKeyDown = function(e) {
    if (e.which === 37 || e.which === 39) {
        if (e.which === 37) {
            $.fn.fullpage.moveSlideLeft();
        } else if (e.which === 39) {
            $.fn.fullpage.moveSlideRight();
        }
    }
    // jquery.fullpage handles actual scrolling
    return true;
}

var fakeMobileHover = function() {
    $(this).css({
        'opacity': 1
    });
}

var rmFakeMobileHover = function() {
    $(this).css({
        'opacity': .3
    });
}

var onControlBtnClick = function(e) {
    e.preventDefault();
    AUDIO.toggleNarrativeAudio();
    e.stopPropagation();
}

var onVisibilityChange = function() {
    AUDIO.toggleAllAudio();
}

var getHiddenProperty = function() {
    var prefixes = ['webkit','moz','ms','o'];

    // if 'hidden' is natively supported just return it
    if ('hidden' in document) return 'hidden';

    // otherwise loop over all the known prefixes until we find one
    for (var i = 0; i < prefixes.length; i++){
        if ((prefixes[i] + 'Hidden') in document)
            return prefixes[i] + 'Hidden';
    }

    // otherwise it's not supported
    return null;
}

var isHidden = function() {
    var prop = getHiddenProperty();
    if (!prop) return false;

    return document[prop];
}

var setUpGraphics = function() {
    $('.graphic-embed').each(function() {
        var graphic = $(this).data('graphic');
        var pymParent = new pym.Parent(
            $(this).attr('id'),
            'https://s3-us-west-1.amazonaws.com/dc-graphics/dailygraphics/graphics/' + graphic + '/child.html',
            {}
        );
    });
}


$(document).ready(function() {
    $w = $(window).width();
    $h = $(window).height();

    $slides = $('.slide');
    $navButton = $('.primary-navigation-btn');
    $arrows = $('.controlArrow');
    $prevArrow = $arrows.filter('.prev');
    $nextArrow = $arrows.filter('.next');
    $upNext = $('.up-next');
    $controlBtn = $('.control-btn');
    $narrativePlayer = $('#narrative-player');
    $ambientPlayer = $('#ambient-player');
    $progressIndicator = $('.progress-indicator');
    $currentProgress = $('.current-progress');

    $controlBtn.on('click', onControlBtnClick);
    $arrows.on('touchstart', fakeMobileHover);
    $arrows.on('touchend', rmFakeMobileHover);
    $(document).keydown(onDocumentKeyDown);

    AUDIO.setUpNarrativePlayer();
    setUpFullPage();
    setUpGraphics();
    resize();

    // Redraw slides if the window resizes
    window.addEventListener("deviceorientation", resize, true);
    $(window).resize(resize);

    // listen for page visibility changes
    visibilityProperty = getHiddenProperty();
    if (visibilityProperty) {
        var evtname = visibilityProperty.replace(/[H|h]idden/,'') + 'visibilitychange';
        document.addEventListener(evtname, onVisibilityChange);
    }
});