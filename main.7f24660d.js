!function(t){function e(e){for(var n,i,s=e[0],o=e[1],a=0,u=[];a<s.length;a++)i=s[a],Object.prototype.hasOwnProperty.call(r,i)&&r[i]&&u.push(r[i][0]),r[i]=0;for(n in o)Object.prototype.hasOwnProperty.call(o,n)&&(t[n]=o[n]);for(c&&c(e);u.length;)u.shift()()}var n={},r={5:0};function i(e){if(n[e])return n[e].exports;var r=n[e]={i:e,l:!1,exports:{}};return t[e].call(r.exports,r,r.exports,i),r.l=!0,r.exports}i.e=function(t){var e=[],n=r[t];if(0!==n)if(n)e.push(n[2]);else{var s=new Promise((function(e,i){n=r[t]=[e,i]}));e.push(n[2]=s);var o,a=document.createElement("script");a.charset="utf-8",a.timeout=120,i.nc&&a.setAttribute("nonce",i.nc),a.src=function(t){return i.p+""+({0:"demo~display~editing",1:"vendors~demo~display~editing",2:"demo",3:"display",4:"editing",6:"map-backend-svg",7:"map-backend-webgl",8:"not-found"}[t]||t)+"."+{0:"b3f89279",1:"b0c7e787",2:"3e17bf07",3:"a3dabd5a",4:"1b118408",6:"7c8915a6",7:"f00f4bd1",8:"1cc1c21a"}[t]+".js"}(t);var c=new Error;o=function(e){a.onerror=a.onload=null,clearTimeout(u);var n=r[t];if(0!==n){if(n){var i=e&&("load"===e.type?"missing":e.type),s=e&&e.target&&e.target.src;c.message="Loading chunk "+t+" failed.\n("+i+": "+s+")",c.name="ChunkLoadError",c.type=i,c.request=s,n[1](c)}r[t]=void 0}};var u=setTimeout((function(){o({type:"timeout",target:a})}),12e4);a.onerror=a.onload=o,document.head.appendChild(a)}return Promise.all(e)},i.m=t,i.c=n,i.d=function(t,e,n){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var r in t)i.d(n,r,function(e){return t[e]}.bind(null,r));return n},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="",i.oe=function(t){throw console.error(t),t};var s=window.webpackJsonp=window.webpackJsonp||[],o=s.push.bind(s);s.push=e,s=s.slice();for(var a=0;a<s.length;a++)e(s[a]);var c=o;i(i.s=16)}([function(t,e,n){"use strict";n.d(e,"f",(function(){return r})),n.d(e,"g",(function(){return i})),n.d(e,"b",(function(){return o})),n.d(e,"a",(function(){return a})),n.d(e,"d",(function(){return u})),n.d(e,"c",(function(){return l})),n.d(e,"e",(function(){return d}));
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const r=`{{lit-${String(Math.random()).slice(2)}}}`,i=`\x3c!--${r}--\x3e`,s=new RegExp(`${r}|${i}`),o="$lit$";class a{constructor(t,e){this.parts=[],this.element=e;const n=[],i=[],a=document.createTreeWalker(e.content,133,null,!1);let u=0,h=-1,p=0;const{strings:f,values:{length:m}}=t;for(;p<m;){const t=a.nextNode();if(null!==t){if(h++,1===t.nodeType){if(t.hasAttributes()){const e=t.attributes,{length:n}=e;let r=0;for(let t=0;t<n;t++)c(e[t].name,o)&&r++;for(;r-- >0;){const e=f[p],n=d.exec(e)[2],r=n.toLowerCase()+o,i=t.getAttribute(r);t.removeAttribute(r);const a=i.split(s);this.parts.push({type:"attribute",index:h,name:n,strings:a}),p+=a.length-1}}"TEMPLATE"===t.tagName&&(i.push(t),a.currentNode=t.content)}else if(3===t.nodeType){const e=t.data;if(e.indexOf(r)>=0){const r=t.parentNode,i=e.split(s),a=i.length-1;for(let e=0;e<a;e++){let n,s=i[e];if(""===s)n=l();else{const t=d.exec(s);null!==t&&c(t[2],o)&&(s=s.slice(0,t.index)+t[1]+t[2].slice(0,-o.length)+t[3]),n=document.createTextNode(s)}r.insertBefore(n,t),this.parts.push({type:"node",index:++h})}""===i[a]?(r.insertBefore(l(),t),n.push(t)):t.data=i[a],p+=a}}else if(8===t.nodeType)if(t.data===r){const e=t.parentNode;null!==t.previousSibling&&h!==u||(h++,e.insertBefore(l(),t)),u=h,this.parts.push({type:"node",index:h}),null===t.nextSibling?t.data="":(n.push(t),h--),p++}else{let e=-1;for(;-1!==(e=t.data.indexOf(r,e+1));)this.parts.push({type:"node",index:-1}),p++}}else a.currentNode=i.pop()}for(const t of n)t.parentNode.removeChild(t)}}const c=(t,e)=>{const n=t.length-e.length;return n>=0&&t.slice(n)===e},u=t=>-1!==t.index,l=()=>document.createComment(""),d=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/},function(t,e,n){"use strict";n.d(e,"h",(function(){return u})),n.d(e,"a",(function(){return d})),n.d(e,"b",(function(){return h})),n.d(e,"e",(function(){return p})),n.d(e,"c",(function(){return f})),n.d(e,"f",(function(){return m})),n.d(e,"g",(function(){return y})),n.d(e,"d",(function(){return g}));var r=n(7),i=n(3),s=n(2),o=n(9),a=n(8),c=n(0);
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const u=t=>null===t||!("object"==typeof t||"function"==typeof t),l=t=>Array.isArray(t)||!(!t||!t[Symbol.iterator]);class d{constructor(t,e,n){this.dirty=!0,this.element=t,this.name=e,this.strings=n,this.parts=[];for(let t=0;t<n.length-1;t++)this.parts[t]=this._createPart()}_createPart(){return new h(this)}_getValue(){const t=this.strings,e=t.length-1,n=this.parts;if(1===e&&""===t[0]&&""===t[1]){const t=n[0].value;if("symbol"==typeof t)return String(t);if("string"==typeof t||!l(t))return t}let r="";for(let i=0;i<e;i++){r+=t[i];const e=n[i];if(void 0!==e){const t=e.value;if(u(t)||!l(t))r+="string"==typeof t?t:String(t);else for(const e of t)r+="string"==typeof e?e:String(e)}}return r+=t[e],r}commit(){this.dirty&&(this.dirty=!1,this.element.setAttribute(this.name,this._getValue()))}}class h{constructor(t){this.value=void 0,this.committer=t}setValue(t){t===s.a||u(t)&&t===this.value||(this.value=t,Object(r.b)(t)||(this.committer.dirty=!0))}commit(){for(;Object(r.b)(this.value);){const t=this.value;this.value=s.a,t(this)}this.value!==s.a&&this.committer.commit()}}class p{constructor(t){this.value=void 0,this.__pendingValue=void 0,this.options=t}appendInto(t){this.startNode=t.appendChild(Object(c.c)()),this.endNode=t.appendChild(Object(c.c)())}insertAfterNode(t){this.startNode=t,this.endNode=t.nextSibling}appendIntoPart(t){t.__insert(this.startNode=Object(c.c)()),t.__insert(this.endNode=Object(c.c)())}insertAfterPart(t){t.__insert(this.startNode=Object(c.c)()),this.endNode=t.endNode,t.endNode=this.startNode}setValue(t){this.__pendingValue=t}commit(){if(null===this.startNode.parentNode)return;for(;Object(r.b)(this.__pendingValue);){const t=this.__pendingValue;this.__pendingValue=s.a,t(this)}const t=this.__pendingValue;t!==s.a&&(u(t)?t!==this.value&&this.__commitText(t):t instanceof a.b?this.__commitTemplateResult(t):t instanceof Node?this.__commitNode(t):l(t)?this.__commitIterable(t):t===s.b?(this.value=s.b,this.clear()):this.__commitText(t))}__insert(t){this.endNode.parentNode.insertBefore(t,this.endNode)}__commitNode(t){this.value!==t&&(this.clear(),this.__insert(t),this.value=t)}__commitText(t){const e=this.startNode.nextSibling,n="string"==typeof(t=null==t?"":t)?t:String(t);e===this.endNode.previousSibling&&3===e.nodeType?e.data=n:this.__commitNode(document.createTextNode(n)),this.value=t}__commitTemplateResult(t){const e=this.options.templateFactory(t);if(this.value instanceof o.a&&this.value.template===e)this.value.update(t.values);else{const n=new o.a(e,t.processor,this.options),r=n._clone();n.update(t.values),this.__commitNode(r),this.value=n}}__commitIterable(t){Array.isArray(this.value)||(this.value=[],this.clear());const e=this.value;let n,r=0;for(const i of t)n=e[r],void 0===n&&(n=new p(this.options),e.push(n),0===r?n.appendIntoPart(this):n.insertAfterPart(e[r-1])),n.setValue(i),n.commit(),r++;r<e.length&&(e.length=r,this.clear(n&&n.endNode))}clear(t=this.startNode){Object(i.b)(this.startNode.parentNode,t.nextSibling,this.endNode)}}class f{constructor(t,e,n){if(this.value=void 0,this.__pendingValue=void 0,2!==n.length||""!==n[0]||""!==n[1])throw new Error("Boolean attributes can only contain a single expression");this.element=t,this.name=e,this.strings=n}setValue(t){this.__pendingValue=t}commit(){for(;Object(r.b)(this.__pendingValue);){const t=this.__pendingValue;this.__pendingValue=s.a,t(this)}if(this.__pendingValue===s.a)return;const t=!!this.__pendingValue;this.value!==t&&(t?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name),this.value=t),this.__pendingValue=s.a}}class m extends d{constructor(t,e,n){super(t,e,n),this.single=2===n.length&&""===n[0]&&""===n[1]}_createPart(){return new y(this)}_getValue(){return this.single?this.parts[0].value:super._getValue()}commit(){this.dirty&&(this.dirty=!1,this.element[this.name]=this._getValue())}}class y extends h{}let _=!1;(()=>{try{const t={get capture(){return _=!0,!1}};window.addEventListener("test",t,t),window.removeEventListener("test",t,t)}catch(t){}})();class g{constructor(t,e,n){this.value=void 0,this.__pendingValue=void 0,this.element=t,this.eventName=e,this.eventContext=n,this.__boundHandleEvent=t=>this.handleEvent(t)}setValue(t){this.__pendingValue=t}commit(){for(;Object(r.b)(this.__pendingValue);){const t=this.__pendingValue;this.__pendingValue=s.a,t(this)}if(this.__pendingValue===s.a)return;const t=this.__pendingValue,e=this.value,n=null==t||null!=e&&(t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive),i=null!=t&&(null==e||n);n&&this.element.removeEventListener(this.eventName,this.__boundHandleEvent,this.__options),i&&(this.__options=v(t),this.element.addEventListener(this.eventName,this.__boundHandleEvent,this.__options)),this.value=t,this.__pendingValue=s.a}handleEvent(t){"function"==typeof this.value?this.value.call(this.eventContext||this.element,t):this.value.handleEvent(t)}}const v=t=>t&&(_?{capture:t.capture,passive:t.passive,once:t.once}:t.capture)},function(t,e,n){"use strict";n.d(e,"a",(function(){return r})),n.d(e,"b",(function(){return i}));
/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const r={},i={}},function(t,e,n){"use strict";n.d(e,"a",(function(){return r})),n.d(e,"c",(function(){return i})),n.d(e,"b",(function(){return s}));
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const r="undefined"!=typeof window&&null!=window.customElements&&void 0!==window.customElements.polyfillWrapFlushCallback,i=(t,e,n=null,r=null)=>{for(;e!==n;){const n=e.nextSibling;t.insertBefore(e,r),e=n}},s=(t,e,n=null)=>{for(;e!==n;){const n=e.nextSibling;t.removeChild(e),e=n}}},function(t,e,n){"use strict";n.d(e,"e",(function(){return o.a})),n.d(e,"h",(function(){return a.c})),n.d(e,"a",(function(){return r.b})),n.d(e,"b",(function(){return r.e})),n.d(e,"c",(function(){return r.g})),n.d(e,"g",(function(){return c.b})),n.d(e,"d",(function(){return s.b})),n.d(e,"f",(function(){return u})),n.d(e,"i",(function(){return l}));var r=n(1);
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const i=new class{handleAttributeExpressions(t,e,n,i){const s=e[0];if("."===s){return new r.f(t,e.slice(1),n).parts}if("@"===s)return[new r.d(t,e.slice(1),i.eventContext)];if("?"===s)return[new r.c(t,e.slice(1),n)];return new r.a(t,e,n).parts}handleTextExpression(t){return new r.e(t)}};var s=n(8),o=n(7),a=n(3),c=(n(2),n(6));n(5),n(9),n(0);
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
"undefined"!=typeof window&&(window.litHtmlVersions||(window.litHtmlVersions=[])).push("1.3.0");const u=(t,...e)=>new s.b(t,e,"html",i),l=(t,...e)=>new s.a(t,e,"svg",i)},function(t,e,n){"use strict";n.d(e,"b",(function(){return i})),n.d(e,"a",(function(){return s}));var r=n(0);
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */function i(t){let e=s.get(t.type);void 0===e&&(e={stringsArray:new WeakMap,keyString:new Map},s.set(t.type,e));let n=e.stringsArray.get(t.strings);if(void 0!==n)return n;const i=t.strings.join(r.f);return n=e.keyString.get(i),void 0===n&&(n=new r.a(t,t.getTemplateElement()),e.keyString.set(i,n)),e.stringsArray.set(t.strings,n),n}const s=new Map},function(t,e,n){"use strict";n.d(e,"a",(function(){return o})),n.d(e,"b",(function(){return a}));var r=n(3),i=n(1),s=n(5);
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const o=new WeakMap,a=(t,e,n)=>{let a=o.get(e);void 0===a&&(Object(r.b)(e,e.firstChild),o.set(e,a=new i.e(Object.assign({templateFactory:s.b},n))),a.appendInto(e)),a.setValue(t),a.commit()}},function(t,e,n){"use strict";n.d(e,"a",(function(){return i})),n.d(e,"b",(function(){return s}));
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const r=new WeakMap,i=t=>(...e)=>{const n=t(...e);return r.set(n,!0),n},s=t=>"function"==typeof t&&r.has(t)},function(t,e,n){"use strict";n.d(e,"b",(function(){return a})),n.d(e,"a",(function(){return c}));var r=n(3),i=n(0);
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const s=window.trustedTypes&&trustedTypes.createPolicy("lit-html",{createHTML:t=>t}),o=` ${i.f} `;class a{constructor(t,e,n,r){this.strings=t,this.values=e,this.type=n,this.processor=r}getHTML(){const t=this.strings.length-1;let e="",n=!1;for(let r=0;r<t;r++){const t=this.strings[r],s=t.lastIndexOf("\x3c!--");n=(s>-1||n)&&-1===t.indexOf("--\x3e",s+1);const a=i.e.exec(t);e+=null===a?t+(n?o:i.g):t.substr(0,a.index)+a[1]+a[2]+i.b+a[3]+i.f}return e+=this.strings[t],e}getTemplateElement(){const t=document.createElement("template");let e=this.getHTML();return void 0!==s&&(e=s.createHTML(e)),t.innerHTML=e,t}}class c extends a{getHTML(){return`<svg>${super.getHTML()}</svg>`}getTemplateElement(){const t=super.getTemplateElement(),e=t.content,n=e.firstChild;return e.removeChild(n),Object(r.c)(e,n.firstChild),t}}},function(t,e,n){"use strict";n.d(e,"a",(function(){return s}));var r=n(3),i=n(0);
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
class s{constructor(t,e,n){this.__parts=[],this.template=t,this.processor=e,this.options=n}update(t){let e=0;for(const n of this.__parts)void 0!==n&&n.setValue(t[e]),e++;for(const t of this.__parts)void 0!==t&&t.commit()}_clone(){const t=r.a?this.template.element.content.cloneNode(!0):document.importNode(this.template.element.content,!0),e=[],n=this.template.parts,s=document.createTreeWalker(t,133,null,!1);let o,a=0,c=0,u=s.nextNode();for(;a<n.length;)if(o=n[a],Object(i.d)(o)){for(;c<o.index;)c++,"TEMPLATE"===u.nodeName&&(e.push(u),s.currentNode=u.content),null===(u=s.nextNode())&&(s.currentNode=e.pop(),u=s.nextNode());if("node"===o.type){const t=this.processor.handleTextExpression(this.options);t.insertAfterNode(u.previousSibling),this.__parts.push(t)}else this.__parts.push(...this.processor.handleAttributeExpressions(u,o.name,o.strings,this.options));a++}else this.__parts.push(void 0),a++;return r.a&&(document.adoptNode(t),customElements.upgrade(t)),t}}},function(t,e){t.exports=function(t,e){return e||(e=t.slice(0)),Object.freeze(Object.defineProperties(t,{raw:{value:Object.freeze(e)}}))}},function(t,e,n){"use strict";n.d(e,"c",(function(){return d.f})),n.d(e,"d",(function(){return d.i})),n.d(e,"e",(function(){return N})),n.d(e,"b",(function(){return O})),n.d(e,"a",(function(){return A}));var r=n(3),i=n(0);function s(t,e){const{element:{content:n},parts:r}=t,i=document.createTreeWalker(n,133,null,!1);let s=a(r),o=r[s],c=-1,u=0;const l=[];let d=null;for(;i.nextNode();){c++;const t=i.currentNode;for(t.previousSibling===d&&(d=null),e.has(t)&&(l.push(t),null===d&&(d=t)),null!==d&&u++;void 0!==o&&o.index===c;)o.index=null!==d?-1:o.index-u,s=a(r,s),o=r[s]}l.forEach(t=>t.parentNode.removeChild(t))}const o=t=>{let e=11===t.nodeType?0:1;const n=document.createTreeWalker(t,133,null,!1);for(;n.nextNode();)e++;return e},a=(t,e=-1)=>{for(let n=e+1;n<t.length;n++){const e=t[n];if(Object(i.d)(e))return n}return-1};var c=n(6),u=n(5),l=n(9),d=n(4);
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const h=(t,e)=>`${t}--${e}`;let p=!0;void 0===window.ShadyCSS?p=!1:void 0===window.ShadyCSS.prepareTemplateDom&&(console.warn("Incompatible ShadyCSS version detected. Please update to at least @webcomponents/webcomponentsjs@2.0.2 and @webcomponents/shadycss@1.3.1."),p=!1);const f=t=>e=>{const n=h(e.type,t);let r=u.a.get(n);void 0===r&&(r={stringsArray:new WeakMap,keyString:new Map},u.a.set(n,r));let s=r.stringsArray.get(e.strings);if(void 0!==s)return s;const o=e.strings.join(i.f);if(s=r.keyString.get(o),void 0===s){const n=e.getTemplateElement();p&&window.ShadyCSS.prepareTemplateDom(n,t),s=new i.a(e,n),r.keyString.set(o,s)}return r.stringsArray.set(e.strings,s),s},m=["html","svg"],y=new Set,_=(t,e,n)=>{y.add(t);const r=n?n.element:document.createElement("template"),i=e.querySelectorAll("style"),{length:c}=i;if(0===c)return void window.ShadyCSS.prepareTemplateStyles(r,t);const l=document.createElement("style");for(let t=0;t<c;t++){const e=i[t];e.parentNode.removeChild(e),l.textContent+=e.textContent}(t=>{m.forEach(e=>{const n=u.a.get(h(e,t));void 0!==n&&n.keyString.forEach(t=>{const{element:{content:e}}=t,n=new Set;Array.from(e.querySelectorAll("style")).forEach(t=>{n.add(t)}),s(t,n)})})})(t);const d=r.content;n?function(t,e,n=null){const{element:{content:r},parts:i}=t;if(null==n)return void r.appendChild(e);const s=document.createTreeWalker(r,133,null,!1);let c=a(i),u=0,l=-1;for(;s.nextNode();){l++;for(s.currentNode===n&&(u=o(e),n.parentNode.insertBefore(e,n));-1!==c&&i[c].index===l;){if(u>0){for(;-1!==c;)i[c].index+=u,c=a(i,c);return}c=a(i,c)}}}(n,l,d.firstChild):d.insertBefore(l,d.firstChild),window.ShadyCSS.prepareTemplateStyles(r,t);const p=d.querySelector("style");if(window.ShadyCSS.nativeShadow&&null!==p)e.insertBefore(p.cloneNode(!0),e.firstChild);else if(n){d.insertBefore(l,d.firstChild);const t=new Set;t.add(l),s(n,t)}};window.JSCompiler_renameProperty=(t,e)=>t;const g={toAttribute(t,e){switch(e){case Boolean:return t?"":null;case Object:case Array:return null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){switch(e){case Boolean:return null!==t;case Number:return null===t?null:Number(t);case Object:case Array:return JSON.parse(t)}return t}},v=(t,e)=>e!==t&&(e==e||t==t),b={attribute:!0,type:String,converter:g,reflect:!1,hasChanged:v};class S extends HTMLElement{constructor(){super(),this.initialize()}static get observedAttributes(){this.finalize();const t=[];return this._classProperties.forEach((e,n)=>{const r=this._attributeNameForProperty(n,e);void 0!==r&&(this._attributeToPropertyMap.set(r,n),t.push(r))}),t}static _ensureClassProperties(){if(!this.hasOwnProperty(JSCompiler_renameProperty("_classProperties",this))){this._classProperties=new Map;const t=Object.getPrototypeOf(this)._classProperties;void 0!==t&&t.forEach((t,e)=>this._classProperties.set(e,t))}}static createProperty(t,e=b){if(this._ensureClassProperties(),this._classProperties.set(t,e),e.noAccessor||this.prototype.hasOwnProperty(t))return;const n="symbol"==typeof t?Symbol():"__"+t,r=this.getPropertyDescriptor(t,n,e);void 0!==r&&Object.defineProperty(this.prototype,t,r)}static getPropertyDescriptor(t,e,n){return{get(){return this[e]},set(r){const i=this[t];this[e]=r,this.requestUpdateInternal(t,i,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this._classProperties&&this._classProperties.get(t)||b}static finalize(){const t=Object.getPrototypeOf(this);if(t.hasOwnProperty("finalized")||t.finalize(),this.finalized=!0,this._ensureClassProperties(),this._attributeToPropertyMap=new Map,this.hasOwnProperty(JSCompiler_renameProperty("properties",this))){const t=this.properties,e=[...Object.getOwnPropertyNames(t),..."function"==typeof Object.getOwnPropertySymbols?Object.getOwnPropertySymbols(t):[]];for(const n of e)this.createProperty(n,t[n])}}static _attributeNameForProperty(t,e){const n=e.attribute;return!1===n?void 0:"string"==typeof n?n:"string"==typeof t?t.toLowerCase():void 0}static _valueHasChanged(t,e,n=v){return n(t,e)}static _propertyValueFromAttribute(t,e){const n=e.type,r=e.converter||g,i="function"==typeof r?r:r.fromAttribute;return i?i(t,n):t}static _propertyValueToAttribute(t,e){if(void 0===e.reflect)return;const n=e.type,r=e.converter;return(r&&r.toAttribute||g.toAttribute)(t,n)}initialize(){this._updateState=0,this._updatePromise=new Promise(t=>this._enableUpdatingResolver=t),this._changedProperties=new Map,this._saveInstanceProperties(),this.requestUpdateInternal()}_saveInstanceProperties(){this.constructor._classProperties.forEach((t,e)=>{if(this.hasOwnProperty(e)){const t=this[e];delete this[e],this._instanceProperties||(this._instanceProperties=new Map),this._instanceProperties.set(e,t)}})}_applyInstanceProperties(){this._instanceProperties.forEach((t,e)=>this[e]=t),this._instanceProperties=void 0}connectedCallback(){this.enableUpdating()}enableUpdating(){void 0!==this._enableUpdatingResolver&&(this._enableUpdatingResolver(),this._enableUpdatingResolver=void 0)}disconnectedCallback(){}attributeChangedCallback(t,e,n){e!==n&&this._attributeToProperty(t,n)}_propertyToAttribute(t,e,n=b){const r=this.constructor,i=r._attributeNameForProperty(t,n);if(void 0!==i){const t=r._propertyValueToAttribute(e,n);if(void 0===t)return;this._updateState=8|this._updateState,null==t?this.removeAttribute(i):this.setAttribute(i,t),this._updateState=-9&this._updateState}}_attributeToProperty(t,e){if(8&this._updateState)return;const n=this.constructor,r=n._attributeToPropertyMap.get(t);if(void 0!==r){const t=n.getPropertyOptions(r);this._updateState=16|this._updateState,this[r]=n._propertyValueFromAttribute(e,t),this._updateState=-17&this._updateState}}requestUpdateInternal(t,e,n){let r=!0;if(void 0!==t){const i=this.constructor;n=n||i.getPropertyOptions(t),i._valueHasChanged(this[t],e,n.hasChanged)?(this._changedProperties.has(t)||this._changedProperties.set(t,e),!0!==n.reflect||16&this._updateState||(void 0===this._reflectingProperties&&(this._reflectingProperties=new Map),this._reflectingProperties.set(t,n))):r=!1}!this._hasRequestedUpdate&&r&&(this._updatePromise=this._enqueueUpdate())}requestUpdate(t,e){return this.requestUpdateInternal(t,e),this.updateComplete}async _enqueueUpdate(){this._updateState=4|this._updateState;try{await this._updatePromise}catch(t){}const t=this.performUpdate();return null!=t&&await t,!this._hasRequestedUpdate}get _hasRequestedUpdate(){return 4&this._updateState}get hasUpdated(){return 1&this._updateState}performUpdate(){if(!this._hasRequestedUpdate)return;this._instanceProperties&&this._applyInstanceProperties();let t=!1;const e=this._changedProperties;try{t=this.shouldUpdate(e),t?this.update(e):this._markUpdated()}catch(e){throw t=!1,this._markUpdated(),e}t&&(1&this._updateState||(this._updateState=1|this._updateState,this.firstUpdated(e)),this.updated(e))}_markUpdated(){this._changedProperties=new Map,this._updateState=-5&this._updateState}get updateComplete(){return this._getUpdateComplete()}_getUpdateComplete(){return this._updatePromise}shouldUpdate(t){return!0}update(t){void 0!==this._reflectingProperties&&this._reflectingProperties.size>0&&(this._reflectingProperties.forEach((t,e)=>this._propertyToAttribute(e,this[e],t)),this._reflectingProperties=void 0),this._markUpdated()}updated(t){}firstUpdated(t){}}S.finalized=!0;const w=Element.prototype;w.msMatchesSelector||w.webkitMatchesSelector;
/**
@license
Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/
const x=window.ShadowRoot&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,P=Symbol();class C{constructor(t,e){if(e!==P)throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t}get styleSheet(){return void 0===this._styleSheet&&(x?(this._styleSheet=new CSSStyleSheet,this._styleSheet.replaceSync(this.cssText)):this._styleSheet=null),this._styleSheet}toString(){return this.cssText}}const N=t=>new C(String(t),P),O=(t,...e)=>{const n=e.reduce((e,n,r)=>e+(t=>{if(t instanceof C)return t.cssText;if("number"==typeof t)return t;throw new Error(`Value passed to 'css' function must be a 'css' function result: ${t}. Use 'unsafeCSS' to pass non-literal values, but\n            take care to ensure page security.`)})(n)+t[r+1],t[0]);return new C(n,P)};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
(window.litElementVersions||(window.litElementVersions=[])).push("2.4.0");const T={};class A extends S{static getStyles(){return this.styles}static _getUniqueStyles(){if(this.hasOwnProperty(JSCompiler_renameProperty("_styles",this)))return;const t=this.getStyles();if(Array.isArray(t)){const e=(t,n)=>t.reduceRight((t,n)=>Array.isArray(n)?e(n,t):(t.add(n),t),n),n=e(t,new Set),r=[];n.forEach(t=>r.unshift(t)),this._styles=r}else this._styles=void 0===t?[]:[t];this._styles=this._styles.map(t=>{if(t instanceof CSSStyleSheet&&!x){const e=Array.prototype.slice.call(t.cssRules).reduce((t,e)=>t+e.cssText,"");return N(e)}return t})}initialize(){super.initialize(),this.constructor._getUniqueStyles(),this.renderRoot=this.createRenderRoot(),window.ShadowRoot&&this.renderRoot instanceof window.ShadowRoot&&this.adoptStyles()}createRenderRoot(){return this.attachShadow({mode:"open"})}adoptStyles(){const t=this.constructor._styles;0!==t.length&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow?x?this.renderRoot.adoptedStyleSheets=t.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet):this._needsShimAdoptedStyleSheets=!0:window.ShadyCSS.ScopingShim.prepareAdoptedCssText(t.map(t=>t.cssText),this.localName))}connectedCallback(){super.connectedCallback(),this.hasUpdated&&void 0!==window.ShadyCSS&&window.ShadyCSS.styleElement(this)}update(t){const e=this.render();super.update(t),e!==T&&this.constructor.render(e,this.renderRoot,{scopeName:this.localName,eventContext:this}),this._needsShimAdoptedStyleSheets&&(this._needsShimAdoptedStyleSheets=!1,this.constructor._styles.forEach(t=>{const e=document.createElement("style");e.textContent=t.cssText,this.renderRoot.appendChild(e)}))}render(){return T}}A.finalized=!0,A.render=(t,e,n)=>{if(!n||"object"!=typeof n||!n.scopeName)throw new Error("The `scopeName` option is required.");const i=n.scopeName,s=c.a.has(e),o=p&&11===e.nodeType&&!!e.host,a=o&&!y.has(i),u=a?document.createDocumentFragment():e;if(Object(c.b)(t,u,Object.assign({templateFactory:f(i)},n)),a){const t=c.a.get(u);c.a.delete(u);const n=t.value instanceof l.a?t.value.template:void 0;_(i,u,n),Object(r.b)(e,e.firstChild),e.appendChild(u),c.a.set(e,t)}!s&&o&&window.ShadyCSS.styleElement(e.host)}},function(t,e){t.exports=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}},function(t,e){function n(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}t.exports=function(t,e,r){return e&&n(t.prototype,e),r&&n(t,r),t}},function(t,e,n){},function(t,e,n){},function(t,e,n){"use strict";n.r(e);var r=n(10),i=n.n(r),s=n(11),o=(n(14),n(12)),a=n.n(o),c=n(13),u=n.n(c),l=n(4);function d(t,e){var n;if("undefined"==typeof Symbol||null==t[Symbol.iterator]){if(Array.isArray(t)||(n=function(t,e){if(!t)return;if("string"==typeof t)return h(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);"Object"===n&&t.constructor&&(n=t.constructor.name);if("Map"===n||"Set"===n)return Array.from(t);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return h(t,e)}(t))||e&&t&&"number"==typeof t.length){n&&(t=n);var r=0,i=function(){};return{s:i,n:function(){return r>=t.length?{done:!0}:{done:!1,value:t[r++]}},e:function(t){throw t},f:i}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var s,o=!0,a=!1;return{s:function(){n=t[Symbol.iterator]()},n:function(){var t=n.next();return o=t.done,t},e:function(t){a=!0,s=t},f:function(){try{o||null==n.return||n.return()}finally{if(a)throw s}}}}function h(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r}var p=function(){function t(e){a()(this,t),this.component=e,this.routes=[],this.default_route=null,this.last_route=null}return u()(t,[{key:"add",value:function(t,e,n){if("string"==typeof t&&"function"==typeof n){var r={uri:t,callback:n,html:e};this.routes.push(r)}else console.error("Failed to register route.",t,n)}},{key:"default",value:function(t,e){if("function"==typeof e){var n={callback:e,html:t};this.default_route=n}else console.error("Failed to register default route.",e,t)}},{key:"update",value:function(){var t,e,n,r=!0,i=d(this.routes);try{for(i.s();!(t=i.n()).done;){var s=t.value,o=new RegExp("^".concat(s.uri,"$")),a=void 0,c=(a="#"===s.uri[0]?window.location.hash||"#/":window.location.pathname||"/").match(o);if(c){if(this.last_route!==s&&(this.last_route=s,Object(l.g)(s.html,this.component),s.callback)){var u,h={path:a,match:c};null===(u=s.callback)||void 0===u||u.call(s,h)}r=!1;break}}}catch(t){i.e(t)}finally{i.f()}r&&this.last_route!==this.default_route&&(this.last_route=this.default_route,Object(l.g)(this.default_route.html,this.component),null===(e=(n=this.default_route).callback)||void 0===e||e.call(n))}},{key:"init",value:function(){window.addEventListener("hashchange",this.update.bind(this)),this.update()}}]),t}();n(15);function f(){var t=i()(["<not-found-view></not-found-view>"]);return f=function(){return t},t}function m(){var t=i()(["<demo-view></demo-view>"]);return m=function(){return t},t}function y(){var t=i()(["<display-view></display-view>"]);return y=function(){return t},t}function _(){var t=i()(["<editing-view></editing-view>"]);return _=function(){return t},t}window.addEventListener("load",(function(){var t=document.querySelector("main"),e=new p(t);e.add("#/?(edit(/(.*))?)?",Object(s.c)(_()),(function(){Promise.all([n.e(1),n.e(0),n.e(4)]).then(n.bind(null,55))})),e.add("#/?view/(.+)",Object(s.c)(y()),(function(){Promise.all([n.e(1),n.e(0),n.e(3)]).then(n.bind(null,52))})),e.add("#/?demo/(.+)",Object(s.c)(m()),(function(){Promise.all([n.e(1),n.e(0),n.e(2)]).then(n.bind(null,53))})),e.default(Object(s.c)(f()),(function(){window.location.hash="#/404",n.e(8).then(n.bind(null,54))})),e.init()}))}]);