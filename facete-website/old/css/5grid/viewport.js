/*****************************************************************/
/* 5grid 0.2 by nodethirtythree.com | MIT+GPLv2 license licensed */
/* viewport.js: Needed by responsive/responsive-1000px           */
/*****************************************************************/
(function() {
// Insert viewport meta tag
var x, w = window.screen.availWidth;
if (w <= 480) x = 'width=device-width; initial-scale=1.0; minimum-scale=1.0; maximum-scale=1.0;';
else if (w > 480 && w <= 1024) x = 'width=1080';
if (x) {
var h = document.getElementsByTagName('head')[0], hfc = h.firstChild, mt = document.createElement('meta');
mt.id = 'viewport'; mt.name = 'viewport'; mt.content = x; h.insertBefore(mt, hfc);
}
})();