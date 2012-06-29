/**
 * @preserve Module: binderjs
 * Author: Darren Schnare
 * Keywords: javascript,binding,bind,property,list,observer,observable
 * License: MIT ( http://www.opensource.org/licenses/mit-license.php )
 * Repo: https://github.com/dschnare/binderjs
 */
/*global 'UTIL', 'XPORT', 'setTimeout', 'clearTimeout'*/
/*jslint sub: true, continue: true*/
(function (xport, utiljs) {
	'use strict';

	function module(utiljs) {
		var Array = ([]).constructor,
			Object = ({}).constructor,