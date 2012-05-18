/**
 * @preserve Author: Darren Schnare
 * Keywords: javascript,binding,bind,property,list,observer,observable
 * License: MIT ( http://www.opensource.org/licenses/mit-license.php )
 * Repo: https://github.com/dschnare/binderjs
 */
/*global 'UTIL', 'xport', 'setTimeout', 'clearTimeout'*/
/*jslint sub: true, continue: true*/
(function () {
	'use strict';

	function module(util) {
		var Array = ([]).constructor,
			Object = ({}).constructor,