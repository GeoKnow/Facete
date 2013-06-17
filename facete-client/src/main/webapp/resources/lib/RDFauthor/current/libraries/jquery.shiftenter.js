/*
 * shiftenter: a jQuery plugin
 * tested on jQuery v1.5.0
 *
 * jquery-shiftenter is a jQuery plugin that makes it easy to allow submitting
 * a form with textareas using a simple press on 'Enter'. Line breaks (newlines)
 * in these input fields can then be achieved by pressing 'Shift+Enter'
 * (alternatively 'Ctrl+Enter'). Additionally a hint is shown.
 *
 * For usage and examples, visit:
 * http://cburgmer.github.com/jquery-shiftenter
 *
 * Settings:
 *
 * $('textarea').shiftenter({
 *     focusClass: 'shiftenter',             // CSS class used on focus
 *     inactiveClass: 'shiftenterInactive',  // CSS class used when no focus
 *     hint: 'Shift+Enter for line break',   // hint shown
 *     metaKey: 'shift',                     // meta key that triggers a line-break, allowed values: 'shift', 'ctrl'
 *     pseudoPadding: '0 10'                 // padding (bottom, right) of hint text
 * });
 *
 * Licensed under the MIT:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright (c) 2011, Christoph Burgmer (cburgmer -[at]- ira [*dot*] uka [*dot*] de)
 */
/*jslint devel: false, browser: true, vars: true, indent: 4 */
/*global jQuery */
(function ($) {
    "use strict";
    $.extend({
        shiftenter: {
            settings: {
                focusClass: 'shiftenter',
                inactiveClass: 'shiftenterInactive',
                hint: 'Shift+Enter for line break',
                metaKey: 'shift',     // Meta key that triggers a line-break, allowed values: 'shift', 'ctrl'
                pseudoPadding: '0 10', // Pseudo-padding to work around webkit/firefox4 resize handler being hidden, follows the CSS padding style
                onReturn: ''
            },
            get_padding: function (padding) {
                // Parse padding and return right & bottom padding
                var padding_right = 0,
                    padding_bottom = 0,
                    padding_list = null;
                if (padding) {
                    padding_list = padding.split(/ +/);
                    switch (padding_list.length) {
                    case 1:
                        padding_bottom = padding_right = parseInt(padding_list[0], 10);
                        break;
                    case 2:
                        padding_bottom = parseInt(padding_list[0], 10);
                        padding_right = parseInt(padding_list[1], 10);
                        break;
                    default:
                        padding_right = parseInt(padding_list[1], 10);
                        padding_bottom = parseInt(padding_list[2], 10);
                    }
                }
                return {right: padding_right, bottom: padding_bottom};
            },
            debug: false,
            log: function (msg) {
                if (!$.shiftenter.debug) { return; }
                msg = "[ShiftEnter] " + msg;
                $.shiftenter.hasFirebug ?
                        window.console.log(msg) :
                        $.shiftenter.hasConsoleLog ?
                                window.console.log(msg) :
                                window.alert(msg);
            },
            hasFirebug: window.hasOwnProperty("console") && window.console.hasOwnProperty("firebug"),
            hasConsoleLog: window.hasOwnProperty("console") && typeof window.console.log !== "undefined"
        }

    });
    // plugin code
    $.fn.shiftenter = function (opts) {
        opts = $.extend({}, $.shiftenter.settings, opts);

        return this.each(function () {
            var $el = $(this);

            // Our goal only makes sense for textareas where enter does not trigger submit
            if (!$el.is('textarea')) {
                $.shiftenter.log('Ignoring non-textarea element');
                return;
            }

            // Add hint
            if (opts.hint) {
                $.shiftenter.log('Registering hint');
                var $hint = $('<div class="' + opts.inactiveClass + '">' + opts.hint + '</div>').insertAfter($el),
                    reposition = function () {
                        var position = $el.position(),
                            padding = $.shiftenter.get_padding(opts.pseudoPadding);

                        /* Position hint, relative right bottom corner of textarea,
                           add pseudo-padding to workaround hint text with heigher z-index hiding resize handler */
                        $hint.css("left", position.left + $el.outerWidth() - $hint.outerWidth() - padding.right)
                            .css("top", position.top + $el.outerHeight() - $hint.outerHeight() - padding.bottom);
                    };

                reposition();

                // Show & Hide hint
                $el.bind('focus.shiftenter', function () {
                    $.shiftenter.log('Gained focus');
                    // Be safe and reposition, size of textarea might have been changed
                    reposition();
                    $hint.removeClass(opts.inactiveClass).addClass(opts.focusClass);
                    /* Reposition hint on user grabbing the webkit/firefox4 textarea resize handler
                       TODO should be only bound on "mousedown", but Chrome currently doesn't issue a mousedown on the resizer */
                    $el.bind('mousemove.shiftenter', reposition);
                });
                $el.bind('blur.shiftenter', function () {
                    $.shiftenter.log('Lost focus');
                    $hint.removeClass(opts.focusClass).addClass(opts.inactiveClass);
                    // Stop repositioning
                    $el.unbind('mousemove.shiftenter');
                });
                /* Resize wrap (needs jquery-resize, http://benalman.com/projects/jquery-resize-plugin/),
                   only needed for cases where javascript-triggered resize happens while textarea has focus
                   (e.g. autogrow) */
                $el.bind('resize', function () {
                    reposition();
                });
            }

            // Catch return key without shift to submit form
            $el.bind('keydown.shiftenter', function (event) {
                if (event.keyCode === 13) {
                    var meta_key = opts.metaKey.toLowerCase();

                    if (meta_key === 'shift' && event.shiftKey) {
                        // Nothing to do, browser inserts a return
                        $.shiftenter.log('Got Shift+Enter');

                    } else if (meta_key === 'ctrl' && event.ctrlKey) {
                        $.shiftenter.log('Got Ctrl+Enter');
                        // For Ctrl+Enter we need to manually insert a return
                        // Taken from Tim Down, http://stackoverflow.com/questions/3532313/jquery-ctrlenter-as-enter-in-text-area, CC BY-SA 3.0
                        var val = this.value;
                        if (typeof this.selectionStart === "number" && typeof this.selectionEnd === "number") {
                            var start = this.selectionStart;
                            this.value = val.slice(0, start) + "\n" + val.slice(this.selectionEnd);
                            this.selectionStart = this.selectionEnd = start + 1;
                        } else if (window.document.selection && window.document.selection.createRange) {
                            this.focus();
                            var range = window.document.selection.createRange();
                            range.text = "\r\n";
                            range.collapse(false);
                            range.select();
                        }
                        return false;

                    } else {
                        event.preventDefault();
                        if (opts.onReturn) {
                            opts.onReturn();
                        }
                        //$.shiftenter.log('Got Enter, submitting');
                        // Submit form
                        // $el.blur();
                        // $el.parents('form').submit();
                        return false;
                    }
                }
            });

        });
    };
}(jQuery));
