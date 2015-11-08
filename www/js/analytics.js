/*
 * Module for tracking standardized analytics.
 */

var _gaq = _gaq || [];
var _sf_async_config = {};

var ANALYTICS = (function () {

    /*
     * Global time tracking variables
     */
    // The time the current slide was pulled up
    var slideStartTime =  new Date();
    // The time spent on the previous slide, for use in slide-specific tests
    var timeOnLastSlide = null;

    /*
     * Google Analytics
     */
    var setupGoogle = function() {
        _gaq.push(['_setAccount', APP_CONFIG.GOOGLE_ANALYTICS.ACCOUNT_ID]);
        _gaq.push(['_setDomainName', APP_CONFIG.GOOGLE_ANALYTICS.DOMAIN]);

        _gaq.push(['_trackPageview']);

        (function() {
            var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
            ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
        })();
    }

    var setupAll = function() {
        setupGoogle();
    }

    /*
     * Event tracking.
     */
    var trackEvent = function(eventName, label, value) {
        var args = ['_trackEvent', APP_CONFIG.PROJECT_SLUG];

        args.push(eventName);

        if (label) {
            args.push(label);
        } else if (value) {
            args.push('');
        }

        if (value) {
            args.push(value);
        }

        _gaq.push(args);
    }

    var setCustomVar = function(index, varName, value, scope) {
        var args = ['_setCustomVar', index, varName, value]

        if (scope) {
            args.push(scope);
        } else {
            args.push(3);
        }

        _gaq.push(args);
    }

    // SHARING

    var openShareDiscuss = function() {
        trackEvent('open-share-discuss');
    }

    var closeShareDiscuss = function() {
        trackEvent('close-share-discuss');
    }

    var clickTweet = function(location) {
        trackEvent('tweet', location);
    }

    var clickFacebook = function(location) {
        trackEvent('facebook', location);
    }

    var clickEmail = function(location) {
        trackEvent('email', location);
    }

    var postComment = function() {
        trackEvent('new-comment');
    }

    var actOnFeaturedTweet = function(action, tweetUrl) {
        trackEvent('featured-tweet-action', action, null, tweetUrl);
    }

    var actOnFeaturedFacebook = function(action, postUrl) {
        trackEvent('featured-facebook-action', action, null, postUrl);
    }

    var copySummary = function() {
        trackEvent('summary-copied');
    }

    // NAVIGATION
    var usedKeyboardNavigation = false;

    var useKeyboardNavigation = function() {
        if (!usedKeyboardNavigation) {
            trackEvent('keyboard-nav');
            usedKeyboardNavigation = true;
        }
    }

    var completeTwentyFivePercent =  function() {
        trackEvent('completion', '0.25');
    }

    var completeFiftyPercent =  function() {
        trackEvent('completion', '0.5');
    }

    var completeSeventyFivePercent =  function() {
        trackEvent('completion', '0.75');
    }

    var completeOneHundredPercent =  function() {
        trackEvent('completion', '1');
    }

    // SLIDES
    
    var exitSlide = function(slideIndex) {
        var currentTime = new Date();
        timeOnLastSlide = Math.abs(currentTime - slideStartTime);
        slideStartTime = currentTime;
        trackEvent('slide-exit', slideIndex, timeOnLastSlide);
    }

    // This depends on exitSlide executing
    var firstRightArrowClick = function(test) {
        trackEvent('first-right-arrow-clicked', test, timeOnLastSlide);
    }

    return {
        'setupAll': setupAll,
        'trackEvent': trackEvent,
        'setCustomVar': setCustomVar,
        'openShareDiscuss': openShareDiscuss,
        'closeShareDiscuss': closeShareDiscuss,
        'clickTweet': clickTweet,
        'clickFacebook': clickFacebook,
        'clickEmail': clickEmail,
        'postComment': postComment,
        'actOnFeaturedTweet': actOnFeaturedTweet,
        'actOnFeaturedFacebook': actOnFeaturedFacebook,
        'copySummary': copySummary,
        'useKeyboardNavigation': useKeyboardNavigation,
        'completeTwentyFivePercent': completeTwentyFivePercent,
        'completeFiftyPercent': completeFiftyPercent,
        'completeSeventyFivePercent': completeSeventyFivePercent,
        'completeOneHundredPercent': completeOneHundredPercent,
        'exitSlide': exitSlide,
        'firstRightArrowClick': firstRightArrowClick,
    };
}());

ANALYTICS.setupAll();