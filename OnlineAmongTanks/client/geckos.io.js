var geckos;(()=>{"use strict";var e={118:function(e,t,n){var o=this&&this.__spreadArray||function(e,t,n){if(n||2===arguments.length)for(var o,r=0,i=t.length;r<i;r++)!o&&r in t||(o||(o=Array.prototype.slice.call(t,0,r)),o[r]=t[r]);return e.concat(o||Array.prototype.slice.call(t))};Object.defineProperty(t,"__esModule",{value:!0}),t.Events=void 0;var r=n(939),i=function(e,t,n){void 0===n&&(n=!1),this.fn=e,this.context=t,this.once=n},s=function(e,t,n,o,r){if("function"!=typeof n)throw new TypeError("The listener must be a function");var s=new i(n,o||e,r);return e._events.has(t)?e._events.get(t).fn?e._events.set(t,[e._events.get(t),s]):e._events.get(t).push(s):(e._events.set(t,s),e._eventsCount++),e},a=function(e,t){0==--e._eventsCount?e._events=new Map:e._events.delete(t)},c=function(){function e(){this._events=new Map,this._eventsCount=0}return Object.defineProperty(e,"VERSION",{get:function(){return r.VERSION},enumerable:!1,configurable:!0}),e.prototype.eventNames=function(){return Array.from(this._events.keys())},e.prototype.listeners=function(e){var t=this._events.get(e);if(!t)return[];if(t.fn)return[t.fn];for(var n=0,o=t.length,r=new Array(o);n<o;n++)r[n]=t[n].fn;return r},e.prototype.listenerCount=function(e){var t=this._events.get(e);return t?t.fn?1:t.length:0},e.prototype.emit=function(e){for(var t,n,r=[],i=1;i<arguments.length;i++)r[i-1]=arguments[i];if(!this._events.has(e))return!1;var s,a=this._events.get(e);if(a.fn)return a.once&&this.removeListener(e,a.fn,void 0,!0),(t=a.fn).call.apply(t,o([a.context],r,!1)),!0;var c=a.length;for(s=0;s<c;s++)a[s].once&&this.removeListener(e,a[s].fn,void 0,!0),(n=a[s].fn).call.apply(n,o([a[s].context],r,!1));return!0},e.prototype.on=function(e,t,n){return s(this,e,t,n,!1)},e.prototype.once=function(e,t,n){return s(this,e,t,n,!0)},e.prototype.removeListener=function(e,t,n,o){if(!this._events.has(e))return this;if(!t)return a(this,e),this;var r=this._events.get(e);if(r.fn)r.fn!==t||o&&!r.once||n&&r.context!==n||a(this,e);else{for(var i=0,s=[],c=r.length;i<c;i++)(r[i].fn!==t||o&&!r[i].once||n&&r[i].context!==n)&&s.push(r[i]);s.length?this._events.set(e,1===s.length?s[0]:s):a(this,e)}return this},e.prototype.removeAllListeners=function(e){return e?this._events.delete(e)&&a(this,e):(this._events=new Map,this._eventsCount=0),this},Object.defineProperty(e.prototype,"off",{get:function(){return this.removeListener},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"addListener",{get:function(){return this.on},enumerable:!1,configurable:!0}),e}();t.Events=c},939:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.VERSION=void 0,t.VERSION="0.0.6"}},t={};function n(o){var r=t[o];if(void 0!==r)return r.exports;var i=t[o]={exports:{}};return e[o].call(i.exports,i,i.exports,n),i.exports}n.d=(e,t)=>{for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t);var o={};(()=>{n.d(o,{default:()=>g});var e=n(118);class t{constructor(){this.eventEmitter=new e.Events}emit(e,t,n={}){this.eventEmitter.emit(e,t,n)}on(e,t){return this.eventEmitter.on(e,((e,n)=>{t(e,n)}))}removeAllListeners(){this.eventEmitter.removeAllListeners()}}new t;const r="disconnected",i="rawMessage",s="BROWSER_NOT_SUPPORTED",a="COULD_NOT_PARSE_MESSAGE",c=Object.getPrototypeOf(Object.getPrototypeOf(new Uint8Array)).constructor,l=("function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,e=>"string"==typeof e),h=e=>e instanceof ArrayBuffer||e instanceof c,u=e=>{let{data:t}=e;t||(t=e);const n=h(t),o=(e=>{try{return"string"==typeof e&&!!isNaN(parseInt(e))&&(JSON.parse(e),!0)}catch(e){return!1}})(t),r=l(t);if(o){const e=JSON.parse(t),n=Object.keys(e)[0];return{key:n,data:e[n]}}return n||r?{key:i,data:t}:{key:"error",data:new Error(a)}};class d{emit(e,t=null){((e,t,n,o=null)=>{var r;const s=(n,o)=>{var r;const i=null!==(r=n.byteLength)&&void 0!==r?r:2*n.length;if("number"==typeof t&&i>t)throw new Error(`maxMessageSize of ${t} exceeded`);Promise.resolve().then((()=>{e.send?e.send(n):o?e.sendMessageBinary(Buffer.from(n)):e.sendMessage(n)})).catch((e=>{console.log("error",e)}))};if(e&&("open"===e.readyState||(null===(r=e.isOpen)||void 0===r?void 0:r.call(e))))try{n===i&&null!==o&&(l(o)||h(o))?s(o,h(o)):s(JSON.stringify({[n]:o}),!1)}catch(e){return console.error("Error in sendMessage.ts: ",e.message),e}})(this.dataChannel,this.maxMessageSize,e,t)}constructor(e,n,o,r){this.url=e,this.authorization=n,this.label=o,this.rtcConfiguration=r,this.bridge=new t,this.onDataChannel=e=>{const{channel:t}=e;t.label===this.label&&(this.dataChannel=t,this.dataChannel.binaryType="arraybuffer",this.dataChannel.onmessage=e=>{const{key:t,data:n}=u(e);this.bridge.emit(t,n)})}}async fetchAdditionalCandidates(e,t){var n;if("closed"===(null===(n=this.dataChannel)||void 0===n?void 0:n.readyState))return;const o=await fetch(`${e}/connections/${t}/additional-candidates`,{method:"GET",headers:{"Content-Type":"application/json"}});if(o.ok){(await o.json()).forEach((e=>{this.localPeerConnection.addIceCandidate(e)}))}}async connect(){const e=`${this.url}/.wrtc/v2`;let t={"Content-Type":"application/json"};this.authorization&&(t={...t,Authorization:this.authorization});let n={};try{const o=await fetch(`${e}/connections`,{method:"POST",headers:t});if(o.status>=300)throw{name:"Error",message:`Connection failed with status code ${o.status}.`,status:o.status,statusText:o.statusText};const r=await o.json();n=r.userData,this.remotePeerConnection=r}catch(e){return console.error(e.message),{error:e}}const{id:o,localDescription:r}=this.remotePeerConnection,i={sdpSemantics:"unified-plan",...this.rtcConfiguration},s=RTCPeerConnection||webkitRTCPeerConnection;this.localPeerConnection=new s(i);((e=10,t=50,n=1.8,o=20)=>Array(e).fill(0).map(((e,r)=>parseInt((t*n**r).toString())+parseInt((Math.random()*o).toString()))))().forEach((t=>{setTimeout((()=>{this.fetchAdditionalCandidates(e,o).catch((()=>{}))}),t)}));try{await this.localPeerConnection.setRemoteDescription(r),this.localPeerConnection.addEventListener("datachannel",this.onDataChannel,{once:!0});const t=await this.localPeerConnection.createAnswer(),i=new RTCSessionDescription({type:"answer",sdp:t.sdp});await this.localPeerConnection.setLocalDescription(i);try{await fetch(`${e}/connections/${o}/remote-description`,{method:"POST",body:JSON.stringify(this.localPeerConnection.localDescription),headers:{"Content-Type":"application/json"}})}catch(e){return console.error(e.message),{error:e}}const s=()=>new Promise((e=>{this.localPeerConnection.addEventListener("datachannel",(()=>{e()}),{once:!0})}));return this.dataChannel||await s(),{userData:n,localPeerConnection:this.localPeerConnection,dataChannel:this.dataChannel,id:o}}catch(e){return console.error(e.message),this.localPeerConnection.close(),{error:e}}}}class f{async connect(e){if(RTCPeerConnection||webkitRTCPeerConnection){const{localPeerConnection:t,dataChannel:n,id:o,userData:r,error:i}=await e.connect();return i?{error:i}:t&&n&&o&&r?(this.localPeerConnection=t,this.dataChannel=n,this.id=o,{userData:r}):{error:new Error('Something went wrong in "await connectionsManager.connect()"')}}{const e=new Error(s);return console.error(e.message),{error:e}}}}const p=(e,t)=>{const{interval:n=150,runs:o=10}=e,r=((e=24)=>{const t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";let n="";for(let o=0;o<e;o++)n+=t.charAt(Math.floor(62*Math.random()));return n})(24);((e=200,t=1,n)=>{let o=0;if("function"!=typeof n)return void console.error("You have to define your callback function!");const r=setInterval((()=>{n(),o++,o===t-1&&clearInterval(r)}),e);n()})(n,o,(()=>{t(r)}))};class v{constructor(e,t,n,o,i){this.userData={},this.receivedReliableMessages=[],this.url=n?`${e}:${n}`:e,this.connectionsManager=new d(this.url,t,o,i),this.bridge=this.connectionsManager.bridge,this.bridge.on(r,(()=>this.bridge.removeAllListeners()))}onconnectionstatechange(){const e=this.peerConnection.localPeerConnection;e.onconnectionstatechange=()=>{"disconnected"!==e.connectionState&&"closed"!==e.connectionState||this.bridge.emit(r)}}get id(){return this.peerConnection.id}close(){this.peerConnection.localPeerConnection.close(),this.bridge.emit(r);try{const e=`${this.url}/.wrtc/v2`;fetch(`${e}/connections/${this.id}/close`,{method:"POST",headers:{"Content-Type":"application/json"}})}catch(e){console.error(e.message)}}emit(e,t=null,n){n&&n.reliable?p(n,(n=>this.connectionsManager.emit(e,{MESSAGE:t,RELIABLE:1,ID:n}))):this.connectionsManager.emit(e,t)}get raw(){return{emit:e=>this.emit(i,e)}}onRaw(e){this.bridge.on(i,(t=>{(t=>{e(t)})(t)}))}async onConnect(e){var t;this.peerConnection=new f;const n=await this.peerConnection.connect(this.connectionsManager);n.error?e(n.error):(n.userData&&(this.userData=n.userData),this.maxMessageSize=this.connectionsManager.maxMessageSize=null===(t=this.peerConnection.localPeerConnection.sctp)||void 0===t?void 0:t.maxMessageSize,this.onconnectionstatechange(),e())}onDisconnect(e){this.bridge.on(r,e)}on(e,t){this.bridge.on(e,(e=>{e&&1===e.RELIABLE&&"undefined"!==e.ID?((()=>{const e=(new Date).getTime();this.receivedReliableMessages.forEach(((t,n,o)=>{t.expire<=e&&o.splice(n,1)}))})(),0===this.receivedReliableMessages.filter((t=>t.id===e.ID)).length&&(this.receivedReliableMessages.push({id:e.ID,timestamp:new Date,expire:(new Date).getTime()+15e3}),t(e.MESSAGE))):t(e)}))}}const g=(e={})=>{const{authorization:t,iceServers:n=[],iceTransportPolicy:o="all",label:r="geckos.io",port:i=9208,url:s=`${location.protocol}//${location.hostname}`}=e;return new v(s,t,i,r,{iceServers:n,iceTransportPolicy:o})}})(),geckos=o.default})();