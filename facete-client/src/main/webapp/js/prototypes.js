

if (typeof String.prototype.trim === 'undefined') {
	String.prototype.trim = function() {
		// TODO Does not work, because jQuery invokes String.trim; resulting in recursion
		return jQuery.trim(this);
	};
}
