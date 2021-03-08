!function(){"use strict";var t=['a[href]:not([tabindex^="-"])','area[href]:not([tabindex^="-"])','input:not([type="hidden"]):not([type="radio"]):not([disabled]):not([tabindex^="-"])','input[type="radio"]:not([disabled]):not([tabindex^="-"]):checked','select:not([disabled]):not([tabindex^="-"])','textarea:not([disabled]):not([tabindex^="-"])','button:not([disabled]):not([tabindex^="-"])','iframe:not([tabindex^="-"])','audio[controls]:not([tabindex^="-"])','video[controls]:not([tabindex^="-"])','[contenteditable]:not([tabindex^="-"])','[tabindex]:not([tabindex^="-"])'];function e(t){this._show=this.show.bind(this),this._hide=this.hide.bind(this),this._maintainFocus=this._maintainFocus.bind(this),this._bindKeypress=this._bindKeypress.bind(this),this.$el=t,this.shown=!1,this._id=this.$el.getAttribute("data-a11y-dialog")||this.$el.id,this._previouslyFocused=null,this._listeners={},this.create()}function i(t,e){return i=(e||document).querySelectorAll(t),Array.prototype.slice.call(i);var i}function n(t){var e=s(t),i=t.querySelector("[autofocus]")||e[0];i&&i.focus()}function s(e){return i(t.join(","),e).filter((function(t){return!!(t.offsetWidth||t.offsetHeight||t.getClientRects().length)}))}function o(){i("[data-a11y-dialog]").forEach((function(t){new e(t,t.getAttribute("data-a11y-dialog")||void 0)}))}e.prototype.create=function(){return this.$el.setAttribute("aria-hidden",!0),this.$el.setAttribute("aria-modal",!0),this.$el.hasAttribute("role")||this.$el.setAttribute("role","dialog"),this._openers=i('[data-a11y-dialog-show="'+this._id+'"]'),this._openers.forEach(function(t){t.addEventListener("click",this._show)}.bind(this)),this._closers=i("[data-a11y-dialog-hide]",this.$el).concat(i('[data-a11y-dialog-hide="'+this._id+'"]')),this._closers.forEach(function(t){t.addEventListener("click",this._hide)}.bind(this)),this._fire("create"),this},e.prototype.show=function(t){return this.shown||(this._previouslyFocused=document.activeElement,this.$el.removeAttribute("aria-hidden"),this.shown=!0,n(this.$el),document.body.addEventListener("focus",this._maintainFocus,!0),document.addEventListener("keydown",this._bindKeypress),this._fire("show",t)),this},e.prototype.hide=function(t){return this.shown?(this.shown=!1,this.$el.setAttribute("aria-hidden","true"),this._previouslyFocused&&this._previouslyFocused.focus&&this._previouslyFocused.focus(),document.body.removeEventListener("focus",this._maintainFocus,!0),document.removeEventListener("keydown",this._bindKeypress),this._fire("hide",t),this):this},e.prototype.destroy=function(){return this.hide(),this._openers.forEach(function(t){t.removeEventListener("click",this._show)}.bind(this)),this._closers.forEach(function(t){t.removeEventListener("click",this._hide)}.bind(this)),this._fire("destroy"),this._listeners={},this},e.prototype.on=function(t,e){return void 0===this._listeners[t]&&(this._listeners[t]=[]),this._listeners[t].push(e),this},e.prototype.off=function(t,e){var i=(this._listeners[t]||[]).indexOf(e);return i>-1&&this._listeners[t].splice(i,1),this},e.prototype._fire=function(t,e){(this._listeners[t]||[]).forEach(function(t){t(this.$el,e)}.bind(this))},e.prototype._bindKeypress=function(t){this.$el.contains(document.activeElement)&&(this.shown&&27===t.which&&"alertdialog"!==this.$el.getAttribute("role")&&(t.preventDefault(),this.hide(t)),this.shown&&9===t.which&&function(t,e){var i=s(t),n=i.indexOf(document.activeElement);e.shiftKey&&0===n?(i[i.length-1].focus(),e.preventDefault()):e.shiftKey||n!==i.length-1||(i[0].focus(),e.preventDefault())}(this.$el,t))},e.prototype._maintainFocus=function(t){var e=t.target.getAttribute("data-a11y-dialog-show");this.shown&&!this.$el.contains(t.target)&&e===this._id&&n(this.$el)},"undefined"!=typeof document&&("loading"===document.readyState?document.addEventListener("DOMContentLoaded",o):window.requestAnimationFrame?window.requestAnimationFrame(o):window.setTimeout(o,16));new class{constructor(t={}){this.options={...t},this.init()}init(){this.dialogContainer=document.querySelector("#dialog"),this.title=this.dialogContainer.querySelector("[data-gallery-title]"),this.content=this.dialogContainer.querySelector("[data-gallery-content]"),this.dialogContainer&&this.title&&this.content&&(this.dialog=new e(this.dialogContainer),this.photos=[].map.call(document.querySelectorAll(".photos a"),(t=>{const e=t.href,i=t.querySelector("img");return{element:t,src:e,title:i.title}})),this.photos.forEach(((t,e)=>{t.element.addEventListener("click",(t=>{t.preventDefault(),this.show(e)}),!1)})),document.addEventListener("keydown",(t=>{this.dialog.shown&&("ArrowLeft"===t.key?(t.preventDefault(),this.prev()):"ArrowRight"===t.key&&(t.preventDefault(),this.next()))}),!1),this.prevButton=this.dialogContainer.querySelector("[data-gallery-prev]"),this.prevButton&&this.prevButton.addEventListener("click",(t=>{t.preventDefault(),this.prev()}),!1),this.nextButton=this.dialogContainer.querySelector("[data-gallery-next]"),this.nextButton&&this.nextButton.addEventListener("click",(t=>{t.preventDefault(),this.next()}),!1))}show(t){const e=this.photos[t];if(!e)return;const{src:i,title:n}=e;this.dialog.show(),this.title.innerHTML=n,this.content.innerHTML=`<img src="${i}" alt="${n}" />`,this.prevButton&&(this.prevButton.disabled=0===t),this.nextButton&&(this.nextButton.disabled=t===this.photos.length),this.current=t}prev(){this.show(this.current-1)}next(){this.show(this.current+1)}}}();