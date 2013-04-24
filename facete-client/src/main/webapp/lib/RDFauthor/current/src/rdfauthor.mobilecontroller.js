/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Tim Ermilov <yamalight@gmail.com>
 */

/**
 * Constructs a view object for mobile devices.
 *
 * @param options An object with view options. The following keys are recognized
 * (default values in parantheses):
 * <ul>
 *   <li><code>title</code> The view's main title ('Edit Properties'), </li>
 *   <li><code>saveButtonTitle</code> the title for the save button ('Save'), </li>
 *   <li><code>cancelButtonTitle</code> the caption for the cancel button ('Cancel'), </li>
 *   <li><code>container</code> a jQuery selector for the container DOM element ('body'), </li>
 *   <li><code>showButtons</code> whether to display buttons (true), </li>
 *   <li><code>animationTime</code> animation time in milliseconds (250), </li>
 *   <li><code>id</code> the ad attribute for the view's DOM element ('rdfAuthorView'), </li>
 *   <li><code>contentContainerClass</code> the CSS class for the content container ('rdfAuthorViewContent').</li>
 * </ul>
 *
 * @constructor
 * @requires RDFauthor
 * @requires SubjectGroup
 */
function MobileController(options) {
    // default options
    var defaultOptions = {
        title: 'Edit Properties',
        saveButtonTitle: 'Save',
        cancelButtonTitle: 'Cancel',
        propertyButtonTitle: 'Add Property',
        container: 'body',
        showButtons: true,
        showPropertyButton: true,
        useAnimations: true,
        animationTime: 250, // ms
        id: 'rdfauthor-view',
        contentContainerClass: 'rdfauthor-view-content'/*,
        replaceContainerContent: false*/
    };

    this.activeSubject = null;

    // overwrite defaults if supplied
    this._options   = jQuery.extend(defaultOptions, options);
    this._options.animationTime = this._options.useAnimations ? this._options.animationTime : 0;
    this._container = this._options.container instanceof jQuery
                    ? this._options.container
                    : $(this._options.container);

    // unique subjects
    this._subjects     = {};
    this._subjectCount = 0;

    var self = this;

    function getChrome() {
        // class="window"
        html = '\
            <div id="' + self.cssID() + '" style="display:none">\
                ' + getContent() + '\
            </div>';

        return html;
    };

    function getContent() {
        html = '\
            <h2 class="title">' + self._options.title + '</h2>\
            <div class="' + self._options.contentContainerClass + '">\
            </div>' + getButtons() + '<div style="clear:both"></div>';

        return html;
    };

    function getButtons() {
        var buttonHTML = '';
        if (self._options.showButtons) {
            var propertyButton = '';
            if (self._options.showPropertyButton) {
                propertyButton = '<button type="button" id="rdfauthor-button-property">' + self._options.propertyButtonTitle + '</button>';
            }

            buttonHTML = '\
                <div id="rdfauthor-buttons">\
                    ' + propertyButton + '\
                    <button type="button" id="rdfauthor-button-cancel">' + self._options.cancelButtonTitle + '</button>\
                    <button type="button" id="rdfauthor-button-submit">' + self._options.saveButtonTitle + '</button>\
                </div>';
        }

        return buttonHTML;
    }

    // keybord support
    function handleKeybordEvent(e) {
        switch (e.which) {
            case 27:    // esc
                jQuery('#rdfauthor-button-cancel').click();
                break;
            /*case 13:    // return
                if (e.shiftKey) {   // shift
                    jQuery('#rdfauthor-button-submit').click();
                }
                break;*/
            case 65:    // a
                if (e.shiftKey && e.ctrlKey) {
                    jQuery('#rdfauthor-button-property').click();
                }
                break;
            default:
                // alert(e.which);
                break;
        }
    }

    jQuery(document).bind('keydown.view', handleKeybordEvent);

    // view initialization
    if (jQuery('#' + this.cssID()).length < 1) {
        // append chrome
        this._container.append(getChrome());

        // call event
        $(document).trigger("RDFauthor.added");

        jQuery('#rdfauthor-button-submit').live('click', function () {
            RDFauthor.commit();
        });

        jQuery('#rdfauthor-button-cancel').live('click', function () {
            RDFauthor.cancel();
        });

        jQuery('#rdfauthor-button-property').live('click', function () {
            jQuery('body').trigger('rdfauthor.view.property');
            var subjectGroup = self.activeSubjectGroup();
            var propertySelector = subjectGroup.getPropertySelector(function (widgetID) {
                var rowTop          = jQuery('#' + widgetID).closest('.rdfauthor-predicate-row').offset().top;
                var containerTop    = jQuery('.' + self._options.contentContainerClass).offset().top;
                var containerScroll = jQuery('.' + self._options.contentContainerClass).scrollTop();

                // TODO: seems to not work properly
                var scrollTo = containerScroll - (containerTop - rowTop);
                jQuery('.' + self._options.contentContainerClass).animate({scrollTop: scrollTo}, self._options.animationTime);
            });
            propertySelector.presentInContainer(self._options.useAnimations);
        });
    } else {
        // append content only
        jQuery('#' + this.cssID()).html(getContent());
    }
}

MobileController.prototype = {
    /**
     * Adds a new widget to the view self.
     * @param {Statement} statement object
     * @param {function} Constructor function to be used for widget instantiation
     */
    addWidget: function (statement, constructor) {
        var graphURI     = statement.graphURI();
        var subjectURI   = statement.subjectURI();
        var subjectGroup = this.getSubjectGroup(graphURI, subjectURI);

        return subjectGroup.addWidget(statement, constructor);
    },

    getSubjectGroup: function (graphURI, subjectURI) {
        var subjectGroup;
        if (undefined !== this._subjects[subjectURI]) {
            subjectGroup = this._subjects[subjectURI];
        } else {
            subjectGroup = new SubjectGroup(graphURI, subjectURI, subjectURI, this.getContentContainer(), RDFauthor.nextID());
            this._subjects[subjectURI] = subjectGroup;
            this._subjectCount++;

            // save the first group as the initially active group
            if (null === this.activeSubject) {
                this.activeSubject = subjectURI;
            }
        }

        return subjectGroup;
    },

    /**
     * Returns the currently active subject group.
     * @return SubjectGroup
     */
    activeSubjectGroup: function () {
        if (null === this.activeSubject) {
            this.activeSubject = RDFauthor.defaultSubjectURI();
            var activeGraph = RDFauthor.defaultGraphURI();
            var subjectGroup = this.getSubjectGroup(activeGraph, this.activeSubject);
        }

        return this.subjectGroup(this.activeSubject);
    },

    /**
     * Returns the DOM element that is used as a container for view content
     * (i.e. PredicateRows).
     * @return {jQuery}
     */
    getContentContainer: function () {
        return jQuery(this.getElement()).children('.' + this._options.contentContainerClass).eq(0);
    },

    /**
     * Returns the DOM element associated with this view self.
     * @return {jQuery}
     */
    getElement: function () {
        return jQuery('#' + this.cssID()).get(0);
    },

    /**
     * Returns the subject group self identified by URI.
     * @param subjectURI The subject URI for which to return the {@link SubjectGroup} (string)
     * @return {SubjectGroup}
     */
    subjectGroup: function (subjectURI) {
        return this._subjects[subjectURI];
    },

    /**
     * Returns the CSS id of this view self's associated DOM element.
     * @return {string}
     */
    cssID: function () {
        return this._options.id;
    },

    /**
     * Returns the number of dsitinguished subjects currently managed by the
     * view self.
     * @return {number}
     */
    numberOfSubjects: function () {
        return this._subjectCount;
    },

    position: function () {
        /*var cw = this._container.width();
        var w  = jQuery(this.getElement()).width();
        var wh = jQuery(window).height();
        var h  = jQuery(this.getElement()).height();
        var self = this;

        // set container height
        /*this._container.height(
            Math.max(
                jQuery(document).height(),
                jQuery(window).height(),
                /* for Opera: *
                document.documentElement.clientHeight
            ) + 'px'); //*/
    },

    layout: function (layoutInfo) {
        this.activeSubjectGroup().getElement().resize();
    },

    /**
     * Resets this view self
     */
    reset: function () {
        // unique subjects
        this._subjects     = {};
        this._subjectCount = 0;
        // this._container.empty();
        jQuery('#' + this.cssID()).empty();
        jQuery(RDFauthor.eventTarget()).unbind('rdfauthor.view');
    },

    submit: function () {
        var submitOk = true;
        for (var index in this._subjects) {
            submitOk &= this._subjects[index].submit();
        }

        return submitOk;
    },

    cancel: function () {
        for (var index in this._subjects) {
            this._subjects[index].cancel();
        }
    },

    /**
     * Shows this view self if currently hidden.
     * @param {boolean} animated Whether to appear animatedly
     */
    show: function (animated) {
        var self = this;
        if (arguments.length === 0 || !animated || !this._options.useAnimations) {
            jQuery(this.getElement()).show();
            this.activeSubjectGroup().show();
            this._container.show();
            this.position();
            // TODO: trigger event
        } else {
            if (this.activeSubjectGroup()) {
                this.activeSubjectGroup().show();
            }
            this._container.fadeIn(100, function () {
                jQuery(self.getElement()).fadeIn(function () {
                    self.position();
                });
            });
        }
    },

    /**
     * Hides this view self if currently visible.
     * @member
     * @param {boolean} animated Whether to disappear animatedly
     */
    hide: function (animated, callback) {
        if (arguments.length === 0 || !animated || !this._options.useAnimations) {
            jQuery(this.getElement()).hide();
            this._container.hide();
        } else {
            var self = this;
            jQuery(this.getElement()).fadeOut(function() {
                jQuery(self.getElement()).hide();
                self._container.hide();
                if (typeof callback == 'function') {
                    callback();
                }
            });
        }
    }
};
