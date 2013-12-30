/**
* util
* @module util
**/
/**
*	创建cookie<br>
*	<a href="nie.use.html"><font color="red">nie.use模块：</font></a>util.cookie<br>
*	原作者：Klaus Hartl/<a href="mailto:klaus.hartl@stilbuero.de">klaus.hartl@stilbuero.de</a><br>
*	作者网站：<a href="http://stilbuero.de" target="_blank">http://stilbuero.de</a><br>
*	<pre>
*	//Set the value of a cookie.
*	$.cookie('the_cookie', 'the_value');	
*	<br>
*	//Create a cookie with all available options.
*	$.cookie('the_cookie', 'the_value', { expires: 7, path: '/', domain: 'jquery.com', secure: true }); 
*	<br>
*	//Create a session cookie.
*	$.cookie('the_cookie', 'the_value');
*	<br>
*	//Delete a cookie by passing null as value. Keep in mind that you have to use the same path and domain used when the cookie was set.
*	$.cookie('the_cookie', null);
*	</pre>
*	@namespace $
*	@class cookie
*	@static
**/
/**
*	@constructor cookie
*	@param {String} name The name of the cookie.
*	@param {String} value The value of the cookie.
*	@param {Object} options An object literal containing key/value pairs to provide optional cookie attributes.
*	@return	{Object} The value of the cookie.
**/
jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // CAUTION: Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};