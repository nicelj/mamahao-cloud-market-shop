define(function(require,exports,module){var i={config:{},init:function(){i.bindEvents()},bindEvents:function(){$(".js-login").on("click",i.login),$(".js-bind").on("click",i.bind),$(".js-vcode, .js-bindVcode").on("click",i.getVCode)},getVCode:function(){function i(e){0==o?e.removeClass("ban").text(r):(e.text(o+"秒后可重发"),o--,setTimeout(function(){i(e)},1e3))}var e=$(".fm-login"),t=e.find(".js-mobile"),n=$.trim(t.val()),a=/^1[3,5,7,8]{1}\d{9}$/;if(!n||!a.test(n))return M.tips("请输入正确的手机号！"),!1;var s=$(this);if(s.hasClass("ban"))return!1;s.addClass("ban");var o=60,r=s.text();i(s);var c=s.is(".js-vcode")?"/api/sendMessage":"/api/sendBindMessage";M.ajax({url:c,data:{mobile:n},success:function(i){i.success_code?M.tips("发送成功"):M.tips(i.error)}})},login:function(){var e=$(".fm-login");return!!i.validate(e)&&void M.ajax({url:"/api/login",data:e.serialize(),success:function(i){i.success&&M.tips({body:"登录成功！",callback:function(){location.href=M.url.query("origin")||location.origin}})}})},bind:function(){var e=$(".fm-login");if(!i.validate(e))return!1;var t=e.serialize(),n=M.url.query("k");M.ajax({url:"/api/bind",data:n?[t,"&k=",n].join(""):t,success:function(i){i.success&&M.tips({body:"绑定成功！",callback:function(){window.location.href=M.url.query("origin")||location.origin}})}})},validate:function(i){var e=!0,t=$(i).find(':text,:password,[type="tel"],[type="email"],[type="number"],[type="date"],[type="search"],[type="time"],[type="url"]');return $.each(t,function(){var i=$(this),t=$.trim(i.val()),n=i.data("type"),a=(i.closest("li").find("em").text()||i.data("name")).replace(/\s|\*|:|：/g,"");if(""===t)return M.tips(a+"不能为空！"),e=!1;switch(n){case"mobile":if(!/^1[3,4,5,7,8]{1}\d{9}$/.test(t))return M.tips("请输入正确的"+a),e=!1;break;case"integer":if(!/^\d{6}$/.test(t))return M.tips("请输入正确的"+a),e=!1}}),e}};i.init()});