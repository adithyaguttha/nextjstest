(()=>{var e={};e.id=541,e.ids=[541],e.modules={42:(e,t,r)=>{Promise.resolve().then(r.bind(r,69448))},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},11997:e=>{"use strict";e.exports=require("punycode")},19121:e=>{"use strict";e.exports=require("next/dist/server/app-render/action-async-storage.external.js")},27910:e=>{"use strict";e.exports=require("stream")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33873:e=>{"use strict";e.exports=require("path")},34631:e=>{"use strict";e.exports=require("tls")},37590:(e,t,r)=>{"use strict";r.d(t,{l$:()=>ed,oR:()=>q});var s,o=r(43210);let a={data:""},i=e=>"object"==typeof window?((e?e.querySelector("#_goober"):window._goober)||Object.assign((e||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:e||a,l=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,n=/\/\*[^]*?\*\/|  +/g,d=/\n+/g,c=(e,t)=>{let r="",s="",o="";for(let a in e){let i=e[a];"@"==a[0]?"i"==a[1]?r=a+" "+i+";":s+="f"==a[1]?c(i,a):a+"{"+c(i,"k"==a[1]?"":t)+"}":"object"==typeof i?s+=c(i,t?t.replace(/([^,])+/g,e=>a.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):a):null!=i&&(a=/^--/.test(a)?a:a.replace(/[A-Z]/g,"-$&").toLowerCase(),o+=c.p?c.p(a,i):a+":"+i+";")}return r+(t&&o?t+"{"+o+"}":o)+s},u={},p=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+p(e[r]);return t}return e},m=(e,t,r,s,o)=>{let a=p(e),i=u[a]||(u[a]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(a));if(!u[i]){let t=a!==e?e:(e=>{let t,r,s=[{}];for(;t=l.exec(e.replace(n,""));)t[4]?s.shift():t[3]?(r=t[3].replace(d," ").trim(),s.unshift(s[0][r]=s[0][r]||{})):s[0][t[1]]=t[2].replace(d," ").trim();return s[0]})(e);u[i]=c(o?{["@keyframes "+i]:t}:t,r?"":"."+i)}let m=r&&u.g?u.g:null;return r&&(u.g=u[i]),((e,t,r,s)=>{s?t.data=t.data.replace(s,e):-1===t.data.indexOf(e)&&(t.data=r?e+t.data:t.data+e)})(u[i],t,s,m),i},h=(e,t,r)=>e.reduce((e,s,o)=>{let a=t[o];if(a&&a.call){let e=a(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;a=t?"."+t:e&&"object"==typeof e?e.props?"":c(e,""):!1===e?"":e}return e+s+(null==a?"":a)},"");function x(e){let t=this||{},r=e.call?e(t.p):e;return m(r.unshift?r.raw?h(r,[].slice.call(arguments,1),t.p):r.reduce((e,r)=>Object.assign(e,r&&r.call?r(t.p):r),{}):r,i(t.target),t.g,t.o,t.k)}x.bind({g:1});let g,f,b,v=x.bind({k:1});function y(e,t){let r=this||{};return function(){let s=arguments;function o(a,i){let l=Object.assign({},a),n=l.className||o.className;r.p=Object.assign({theme:f&&f()},l),r.o=/ *go\d+/.test(n),l.className=x.apply(r,s)+(n?" "+n:""),t&&(l.ref=i);let d=e;return e[0]&&(d=l.as||e,delete l.as),b&&d[0]&&b(l),g(d,l)}return t?t(o):o}}var w=e=>"function"==typeof e,j=(e,t)=>w(e)?e(t):e,N=(()=>{let e=0;return()=>(++e).toString()})(),k=(()=>{let e;return()=>e})(),C=(e,t)=>{switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,20)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:r}=t;return C(e,{type:+!!e.toasts.find(e=>e.id===r.id),toast:r});case 3:let{toastId:s}=t;return{...e,toasts:e.toasts.map(e=>e.id===s||void 0===s?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let o=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+o}))}}},_=[],D={toasts:[],pausedAt:void 0},E=e=>{D=C(D,e),_.forEach(e=>{e(D)})},L={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},P=(e={})=>{let[t,r]=(0,o.useState)(D),s=(0,o.useRef)(D);(0,o.useEffect)(()=>(s.current!==D&&r(D),_.push(r),()=>{let e=_.indexOf(r);e>-1&&_.splice(e,1)}),[]);let a=t.toasts.map(t=>{var r,s,o;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(r=e[t.type])?void 0:r.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(s=e[t.type])?void 0:s.duration)||(null==e?void 0:e.duration)||L[t.type],style:{...e.style,...null==(o=e[t.type])?void 0:o.style,...t.style}}});return{...t,toasts:a}},$=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||N()}),M=e=>(t,r)=>{let s=$(t,e,r);return E({type:2,toast:s}),s.id},q=(e,t)=>M("blank")(e,t);q.error=M("error"),q.success=M("success"),q.loading=M("loading"),q.custom=M("custom"),q.dismiss=e=>{E({type:3,toastId:e})},q.remove=e=>E({type:4,toastId:e}),q.promise=(e,t,r)=>{let s=q.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let o=t.success?j(t.success,e):void 0;return o?q.success(o,{id:s,...r,...null==r?void 0:r.success}):q.dismiss(s),e}).catch(e=>{let o=t.error?j(t.error,e):void 0;o?q.error(o,{id:s,...r,...null==r?void 0:r.error}):q.dismiss(s)}),e};var A=(e,t)=>{E({type:1,toast:{id:e,height:t}})},z=()=>{E({type:5,time:Date.now()})},R=new Map,O=1e3,F=(e,t=O)=>{if(R.has(e))return;let r=setTimeout(()=>{R.delete(e),E({type:4,toastId:e})},t);R.set(e,r)},S=e=>{let{toasts:t,pausedAt:r}=P(e);(0,o.useEffect)(()=>{if(r)return;let e=Date.now(),s=t.map(t=>{if(t.duration===1/0)return;let r=(t.duration||0)+t.pauseDuration-(e-t.createdAt);if(r<0){t.visible&&q.dismiss(t.id);return}return setTimeout(()=>q.dismiss(t.id),r)});return()=>{s.forEach(e=>e&&clearTimeout(e))}},[t,r]);let s=(0,o.useCallback)(()=>{r&&E({type:6,time:Date.now()})},[r]),a=(0,o.useCallback)((e,r)=>{let{reverseOrder:s=!1,gutter:o=8,defaultPosition:a}=r||{},i=t.filter(t=>(t.position||a)===(e.position||a)&&t.height),l=i.findIndex(t=>t.id===e.id),n=i.filter((e,t)=>t<l&&e.visible).length;return i.filter(e=>e.visible).slice(...s?[n+1]:[0,n]).reduce((e,t)=>e+(t.height||0)+o,0)},[t]);return(0,o.useEffect)(()=>{t.forEach(e=>{if(e.dismissed)F(e.id,e.removeDelay);else{let t=R.get(e.id);t&&(clearTimeout(t),R.delete(e.id))}})},[t]),{toasts:t,handlers:{updateHeight:A,startPause:z,endPause:s,calculateOffset:a}}},U=v`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,H=v`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,K=v`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,W=y("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${U} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${H} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${K} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,B=v`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,G=y("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${B} 1s linear infinite;
`,I=v`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,T=v`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,Y=y("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${I} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${T} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,V=y("div")`
  position: absolute;
`,J=y("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,X=v`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Z=y("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${X} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,Q=({toast:e})=>{let{icon:t,type:r,iconTheme:s}=e;return void 0!==t?"string"==typeof t?o.createElement(Z,null,t):t:"blank"===r?null:o.createElement(J,null,o.createElement(G,{...s}),"loading"!==r&&o.createElement(V,null,"error"===r?o.createElement(W,{...s}):o.createElement(Y,{...s})))},ee=e=>`
0% {transform: translate3d(0,${-200*e}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,et=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*e}%,-1px) scale(.6); opacity:0;}
`,er=y("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,es=y("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,eo=(e,t)=>{let r=e.includes("top")?1:-1,[s,o]=k()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[ee(r),et(r)];return{animation:t?`${v(s)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${v(o)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},ea=o.memo(({toast:e,position:t,style:r,children:s})=>{let a=e.height?eo(e.position||t||"top-center",e.visible):{opacity:0},i=o.createElement(Q,{toast:e}),l=o.createElement(es,{...e.ariaProps},j(e.message,e));return o.createElement(er,{className:e.className,style:{...a,...r,...e.style}},"function"==typeof s?s({icon:i,message:l}):o.createElement(o.Fragment,null,i,l))});s=o.createElement,c.p=void 0,g=s,f=void 0,b=void 0;var ei=({id:e,className:t,style:r,onHeightUpdate:s,children:a})=>{let i=o.useCallback(t=>{if(t){let r=()=>{s(e,t.getBoundingClientRect().height)};r(),new MutationObserver(r).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,s]);return o.createElement("div",{ref:i,className:t,style:r},a)},el=(e,t)=>{let r=e.includes("top"),s=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:k()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...r?{top:0}:{bottom:0},...s}},en=x`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,ed=({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:s,children:a,containerStyle:i,containerClassName:l})=>{let{toasts:n,handlers:d}=S(r);return o.createElement("div",{id:"_rht_toaster",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...i},className:l,onMouseEnter:d.startPause,onMouseLeave:d.endPause},n.map(r=>{let i=r.position||t,l=el(i,d.calculateOffset(r,{reverseOrder:e,gutter:s,defaultPosition:t}));return o.createElement(ei,{id:r.id,key:r.id,onHeightUpdate:d.updateHeight,className:r.visible?en:"",style:l},"custom"===r.type?j(r.message,r):a?a(r):o.createElement(ea,{toast:r,position:i}))}))}},48546:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>s});let s=(0,r(12907).registerClientReference)(function(){throw Error("Attempted to call the default export of \"C:\\\\Users\\\\gadda\\\\OneDrive\\\\Desktop\\\\Knock Knock\\\\frontend\\\\app\\\\dashboard\\\\developers\\\\page.tsx\" from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"C:\\Users\\gadda\\OneDrive\\Desktop\\Knock Knock\\frontend\\app\\dashboard\\developers\\page.tsx","default")},55184:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>i.a,__next_app__:()=>u,pages:()=>c,routeModule:()=>p,tree:()=>d});var s=r(65239),o=r(48088),a=r(88170),i=r.n(a),l=r(30893),n={};for(let e in l)0>["default","tree","pages","GlobalError","__next_app__","routeModule"].indexOf(e)&&(n[e]=()=>l[e]);r.d(t,n);let d={children:["",{children:["dashboard",{children:["developers",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,48546)),"C:\\Users\\gadda\\OneDrive\\Desktop\\Knock Knock\\frontend\\app\\dashboard\\developers\\page.tsx"]}]},{}]},{layout:[()=>Promise.resolve().then(r.bind(r,83249)),"C:\\Users\\gadda\\OneDrive\\Desktop\\Knock Knock\\frontend\\app\\dashboard\\layout.tsx"],metadata:{icon:[async e=>(await Promise.resolve().then(r.bind(r,46055))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}]},{layout:[()=>Promise.resolve().then(r.bind(r,58014)),"C:\\Users\\gadda\\OneDrive\\Desktop\\Knock Knock\\frontend\\app\\layout.tsx"],"not-found":[()=>Promise.resolve().then(r.t.bind(r,57398,23)),"next/dist/client/components/not-found-error"],forbidden:[()=>Promise.resolve().then(r.t.bind(r,89999,23)),"next/dist/client/components/forbidden-error"],unauthorized:[()=>Promise.resolve().then(r.t.bind(r,65284,23)),"next/dist/client/components/unauthorized-error"],metadata:{icon:[async e=>(await Promise.resolve().then(r.bind(r,46055))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}]}.children,c=["C:\\Users\\gadda\\OneDrive\\Desktop\\Knock Knock\\frontend\\app\\dashboard\\developers\\page.tsx"],u={require:r,loadChunk:()=>Promise.resolve()},p=new s.AppPageRouteModule({definition:{kind:o.RouteKind.APP_PAGE,page:"/dashboard/developers/page",pathname:"/dashboard/developers",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},55511:e=>{"use strict";e.exports=require("crypto")},55591:e=>{"use strict";e.exports=require("https")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},69448:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>c});var s=r(60687),o=r(43210),a=r(16189),i=r(30474),l=r(16396),n=r(32319),d=r(37590);function c(){(0,a.useRouter)();let{user:e}=(0,n.A)(),[t,r]=(0,o.useState)([]),[c,u]=(0,o.useState)(!1),[p,m]=(0,o.useState)(null),[h,x]=(0,o.useState)("list"),[g,f]=(0,o.useState)(!1),[b,v]=(0,o.useState)(""),[y,w]=(0,o.useState)(null),[j,N]=(0,o.useState)(null),[k,C]=(0,o.useState)(null),[_,D]=(0,o.useState)(null),[E,L]=(0,o.useState)(""),[P,$]=(0,o.useState)({name:"",description:"",website_link:"",phone:"",email:"",logo_url:""}),M=async()=>{u(!0),m(null);try{let{data:e,error:t}=await l.N.from("developers").select("*").order("created_at",{ascending:!1});if(t)throw t;r(e||[])}catch(e){m("Failed to load developers. Please try again.")}finally{u(!1)}},q=e=>{let{name:t,value:r}=e.target;$(e=>({...e,[t]:r})),f(!0)},A=()=>P.name.trim()?P.email.trim()?/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(P.email)?P.phone.trim()?P.website_link.trim()?/^https?:\/\/.+/.test(P.website_link)?!!P.description.trim()||(d.oR.error("Description is required",{duration:3e3}),!1):(d.oR.error("Please enter a valid website URL",{duration:3e3}),!1):(d.oR.error("Website link is required",{duration:3e3}),!1):(d.oR.error("Phone number is required",{duration:3e3}),!1):(d.oR.error("Please enter a valid email address",{duration:3e3}),!1):(d.oR.error("Email is required",{duration:3e3}),!1):(d.oR.error("Developer name is required",{duration:3e3}),!1),z=e=>{w(e),$({name:e.name,description:e.description,website_link:e.website_link,phone:e.phone,email:e.email,logo_url:e.logo_url}),D(null),L(e.logo_url||""),x("add")},R=async e=>{u(!0);try{let{error:t}=await l.N.from("developers").delete().eq("id",e);if(t)throw Error(`Failed to delete developer: ${t.message}`);d.oR.success("Developer deleted successfully!",{duration:3e3}),M()}catch(e){d.oR.error(e instanceof Error?e.message:"Failed to delete developer. Please try again.",{duration:3e3})}finally{u(!1),N(null)}},O=async t=>{if(t.preventDefault(),A()&&e){u(!0);try{let t=P.logo_url;if(_){let r=_.name.split(".").pop(),s=`developer-logos/${e.id}-${Date.now()}.${r}`,{error:o}=await l.N.storage.from("developers").upload(s,_,{cacheControl:"3600",upsert:!1});if(o)throw Error(`Failed to upload logo: ${o.message}`);let{data:a}=l.N.storage.from("developers").getPublicUrl(s);t=a.publicUrl}if(y){let{error:e}=await l.N.from("developers").update({name:P.name,description:P.description,website_link:P.website_link,phone:P.phone,email:P.email,logo_url:t}).eq("id",y.id);if(e)throw Error(`Failed to update developer: ${e.message}`);d.oR.success("Developer updated successfully!",{duration:3e3})}else{let{error:r}=await l.N.from("developers").insert({name:P.name,description:P.description,website_link:P.website_link,phone:P.phone,email:P.email,logo_url:t,created_by:e.id});if(r)throw Error(`Failed to create developer: ${r.message}`);d.oR.success("Developer added successfully!",{duration:3e3})}$({name:"",description:"",website_link:"",phone:"",email:"",logo_url:""}),D(null),L(""),f(!1),w(null),M(),setTimeout(()=>x("list"),1200)}catch(e){d.oR.error(e instanceof Error?e.message:"Failed to save developer. Please try again.",{duration:3e3})}finally{u(!1)}}},F=(0,o.useMemo)(()=>b.trim()?t.filter(e=>e.name.toLowerCase().includes(b.toLowerCase())||e.email.toLowerCase().includes(b.toLowerCase())||e.description.toLowerCase().includes(b.toLowerCase())):t,[t,b]);return(0,s.jsxs)("div",{className:"space-y-6",children:[(0,s.jsx)(d.l$,{position:"top-right",toastOptions:{duration:3e3}}),(0,s.jsxs)("div",{className:"flex justify-between items-center",children:[(0,s.jsx)("h1",{className:"text-2xl font-bold text-gray-900",children:"Developers"}),(0,s.jsx)("button",{onClick:()=>{g?window.confirm("You have unsaved changes. Are you sure you want to leave?")&&(x("add"),f(!1),w(null),$({name:"",description:"",website_link:"",phone:"",email:"",logo_url:""}),D(null),L("")):(x("add"),w(null),$({name:"",description:"",website_link:"",phone:"",email:"",logo_url:""}),D(null),L(""))},className:"px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors",children:"Add New Developer"})]}),(0,s.jsxs)("div",{className:"relative flex w-full max-w-xl mx-auto bg-white rounded-xl shadow-md overflow-hidden mb-8",children:[(0,s.jsx)("button",{className:`flex-1 flex items-center justify-center py-3 text-center font-semibold focus:outline-none transition-colors duration-300 z-10 ${"list"===h?"text-blue-600":"text-gray-500 hover:text-blue-600"}`,onClick:()=>{g?window.confirm("You have unsaved changes. Are you sure you want to leave?")&&(x("list"),f(!1)):x("list")},children:(0,s.jsx)("span",{className:"w-full text-center",children:"Developers List"})}),(0,s.jsx)("button",{className:`flex-1 flex items-center justify-center py-3 text-center font-semibold focus:outline-none transition-colors duration-300 z-10 ${"add"===h?"text-blue-600":"text-gray-500 hover:text-blue-600"}`,onClick:()=>{g?window.confirm("You have unsaved changes. Are you sure you want to leave?")&&(x("add"),f(!1)):x("add")},children:(0,s.jsx)("span",{className:"w-full text-center",children:"Add Developer"})})]}),"list"===h&&(0,s.jsxs)("div",{children:[(0,s.jsxs)("div",{className:"relative mb-6",children:[(0,s.jsx)("input",{type:"text",className:"w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",placeholder:"Search developers...",value:b,onChange:e=>v(e.target.value)}),(0,s.jsx)("div",{className:"absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none",children:(0,s.jsx)("svg",{className:"w-5 h-5 text-gray-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:(0,s.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"})})})]}),c?(0,s.jsx)("div",{className:"flex justify-center items-center py-12",children:(0,s.jsx)("div",{className:"animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"})}):p?(0,s.jsx)("div",{className:"mb-6 p-4 rounded-lg bg-red-50 border border-red-200",children:(0,s.jsx)("p",{className:"text-sm text-red-600",children:p})}):0===F.length?(0,s.jsxs)("div",{className:"text-center py-12 bg-white rounded-lg shadow-sm",children:[(0,s.jsx)("svg",{className:"mx-auto h-12 w-12 text-gray-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:(0,s.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"})}),(0,s.jsx)("h3",{className:"mt-2 text-sm font-medium text-gray-900",children:b?`No developers matching "${b}"`:"No developers"}),(0,s.jsx)("p",{className:"mt-1 text-sm text-gray-500",children:b?"Try a different search term or clear your search.":"Get started by adding a new developer."})]}):(0,s.jsx)("div",{className:"grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",children:F.map(e=>(0,s.jsx)("div",{className:"bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden",children:(0,s.jsxs)("div",{className:"p-6",children:[(0,s.jsx)("div",{className:"flex items-center justify-between",children:(0,s.jsxs)("div",{className:"flex items-center space-x-3",children:[e.logo_url?(0,s.jsx)(i.default,{src:e.logo_url,alt:e.name,width:48,height:48,className:"h-12 w-12 rounded-lg object-cover"}):(0,s.jsx)("div",{className:"h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center",children:(0,s.jsx)("span",{className:"text-xl font-medium text-blue-600",children:e.name[0]})}),(0,s.jsxs)("div",{children:[(0,s.jsx)("h3",{className:"text-lg font-medium text-gray-900",children:e.name}),(0,s.jsx)("p",{className:"text-sm text-gray-500",children:e.email})]})]})}),(0,s.jsxs)("div",{className:"mt-4 flex flex-wrap gap-2",children:[e.website_link&&(0,s.jsxs)("a",{href:e.website_link,target:"_blank",rel:"noopener noreferrer",className:"text-blue-600 hover:text-blue-700 flex items-center",children:[(0,s.jsx)("svg",{className:"h-4 w-4 mr-1",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:(0,s.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"})}),"Website"]}),e.phone&&(0,s.jsx)("span",{className:"text-gray-500",children:e.phone})]}),(0,s.jsxs)("div",{className:"mt-6 flex justify-center space-x-2",children:[(0,s.jsx)("button",{className:"px-3 py-1 text-sm border border-blue-300 rounded text-blue-600 hover:bg-blue-50 transition-colors",onClick:()=>C(e),children:"View"}),(0,s.jsx)("button",{className:"px-3 py-1 text-sm border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors",onClick:()=>z(e),children:"Edit"}),(0,s.jsx)("button",{className:"px-3 py-1 text-sm border border-red-300 rounded text-red-600 hover:bg-red-50 transition-colors",onClick:()=>N(e.id),children:"Delete"})]})]})},e.id))})]}),"add"===h&&(0,s.jsx)("div",{children:(0,s.jsxs)("form",{onSubmit:O,className:"space-y-6 max-w-2xl mx-auto",children:[(0,s.jsxs)("div",{className:"flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 p-6 bg-gray-50 rounded-lg",children:[(0,s.jsxs)("div",{className:"relative group",children:[E?(0,s.jsx)("div",{className:"relative w-32 h-32 rounded-lg overflow-hidden ring-4 ring-white shadow-lg transition-transform duration-300 group-hover:scale-105",children:(0,s.jsx)(i.default,{src:E,alt:"Developer Logo",width:128,height:128,className:"object-cover w-full h-full"})}):(0,s.jsx)("div",{className:"w-32 h-32 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center ring-4 ring-white shadow-lg transition-transform duration-300 group-hover:scale-105",children:(0,s.jsx)("svg",{className:"w-12 h-12 text-blue-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:(0,s.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"})})}),(0,s.jsx)("label",{htmlFor:"logo-upload",className:"absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110",children:(0,s.jsxs)("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:[(0,s.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"}),(0,s.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15 13a3 3 0 11-6 0 3 3 0 016 0z"})]})}),(0,s.jsx)("input",{id:"logo-upload",type:"file",accept:"image/*",className:"hidden",onChange:e=>{let t=e.target.files?.[0];if(t){if(t.size>2097152)return void d.oR.error("Logo file size should be less than 2MB",{duration:3e3});D(t),L(URL.createObjectURL(t)),f(!0)}}})]}),(0,s.jsxs)("div",{className:"text-center sm:text-left",children:[(0,s.jsx)("h3",{className:"text-lg font-medium text-gray-900",children:"Developer Logo"}),(0,s.jsx)("p",{className:"text-sm text-gray-500 mt-1",children:"Upload a logo image. JPG, PNG or GIF up to 2MB."})]})]}),(0,s.jsxs)("div",{className:"space-y-6",children:[(0,s.jsxs)("div",{className:"bg-white rounded-lg p-4 transition-all duration-300 hover:bg-gray-50",children:[(0,s.jsx)("label",{htmlFor:"name",className:"block text-sm font-medium text-gray-700 mb-2",children:"Developer Name *"}),(0,s.jsx)("input",{type:"text",id:"name",name:"name",value:P.name,onChange:q,className:"block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300",placeholder:"Enter developer name"})]}),(0,s.jsxs)("div",{className:"bg-white rounded-lg p-4 transition-all duration-300 hover:bg-gray-50",children:[(0,s.jsx)("label",{htmlFor:"email",className:"block text-sm font-medium text-gray-700 mb-2",children:"Email Address *"}),(0,s.jsx)("input",{type:"email",id:"email",name:"email",value:P.email,onChange:q,className:"block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300",placeholder:"Enter email address"})]}),(0,s.jsxs)("div",{className:"bg-white rounded-lg p-4 transition-all duration-300 hover:bg-gray-50",children:[(0,s.jsx)("label",{htmlFor:"phone",className:"block text-sm font-medium text-gray-700 mb-2",children:"Phone Number *"}),(0,s.jsx)("input",{type:"tel",id:"phone",name:"phone",value:P.phone,onChange:q,className:"block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300",placeholder:"Enter phone number"})]}),(0,s.jsxs)("div",{className:"bg-white rounded-lg p-4 transition-all duration-300 hover:bg-gray-50",children:[(0,s.jsx)("label",{htmlFor:"website_link",className:"block text-sm font-medium text-gray-700 mb-2",children:"Website Link *"}),(0,s.jsx)("input",{type:"url",id:"website_link",name:"website_link",value:P.website_link,onChange:q,className:"block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300",placeholder:"https://example.com"})]}),(0,s.jsxs)("div",{className:"bg-white rounded-lg p-4 transition-all duration-300 hover:bg-gray-50",children:[(0,s.jsx)("label",{htmlFor:"description",className:"block text-sm font-medium text-gray-700 mb-2",children:"Description *"}),(0,s.jsx)("textarea",{id:"description",name:"description",value:P.description,onChange:q,rows:4,className:"block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300",placeholder:"Enter developer description"})]})]}),(0,s.jsxs)("div",{className:"flex justify-end space-x-4 pt-4",children:[(0,s.jsx)("button",{type:"button",onClick:()=>{g?window.confirm("You have unsaved changes. Are you sure you want to go back?")&&(x("list"),f(!1),w(null)):(x("list"),w(null))},className:"px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300",children:"Back to Developers"}),(0,s.jsx)("button",{type:"submit",disabled:c,className:"px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg",children:y?c?"Updating...":"Update Developer":c?"Adding...":"Add Developer"})]})]})}),j&&(0,s.jsx)("div",{className:"fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-30 backdrop-blur-sm",children:(0,s.jsxs)("div",{className:"bg-white rounded-lg shadow-lg p-6 max-w-sm w-full",children:[(0,s.jsx)("h3",{className:"text-lg font-semibold mb-4",children:"Delete Developer"}),(0,s.jsx)("p",{className:"mb-6",children:"Are you sure you want to delete this developer? This action cannot be undone."}),(0,s.jsxs)("div",{className:"flex justify-end space-x-4",children:[(0,s.jsx)("button",{className:"px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200",onClick:()=>N(null),children:"Cancel"}),(0,s.jsx)("button",{className:"px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700",onClick:()=>R(j),disabled:c,children:c?"Deleting...":"Delete"})]})]})}),k&&(0,s.jsx)("div",{className:"fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-30 backdrop-blur-sm",children:(0,s.jsxs)("div",{className:"bg-white rounded-lg shadow-lg p-6 max-w-lg w-full",children:[(0,s.jsxs)("div",{className:"flex justify-between items-center mb-4",children:[(0,s.jsx)("h3",{className:"text-xl font-semibold",children:"Developer Details"}),(0,s.jsx)("button",{onClick:()=>C(null),className:"text-gray-500 hover:text-gray-700",children:(0,s.jsx)("svg",{className:"w-6 h-6",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:(0,s.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]}),(0,s.jsxs)("div",{className:"flex items-center mb-6",children:[k.logo_url?(0,s.jsx)(i.default,{src:k.logo_url,alt:k.name,width:80,height:80,className:"h-20 w-20 rounded-lg object-cover"}):(0,s.jsx)("div",{className:"h-20 w-20 rounded-lg bg-blue-100 flex items-center justify-center",children:(0,s.jsx)("span",{className:"text-2xl font-medium text-blue-600",children:k.name[0]})}),(0,s.jsxs)("div",{className:"ml-6",children:[(0,s.jsx)("h4",{className:"text-lg font-medium text-gray-900",children:k.name}),(0,s.jsx)("p",{className:"text-gray-600 mt-1",children:k.email}),(0,s.jsx)("p",{className:"text-gray-600",children:k.phone})]})]}),(0,s.jsxs)("div",{className:"mb-6",children:[(0,s.jsx)("h5",{className:"text-sm font-medium text-gray-500 uppercase tracking-wider mb-2",children:"Description"}),(0,s.jsx)("p",{className:"text-gray-800",children:k.description})]}),(0,s.jsxs)("div",{className:"mb-6",children:[(0,s.jsx)("h5",{className:"text-sm font-medium text-gray-500 uppercase tracking-wider mb-2",children:"Website"}),(0,s.jsxs)("a",{href:k.website_link,target:"_blank",rel:"noopener noreferrer",className:"text-blue-600 hover:text-blue-800 flex items-center",children:[(0,s.jsx)("svg",{className:"h-4 w-4 mr-1",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:(0,s.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"})}),k.website_link]})]}),(0,s.jsx)("div",{className:"flex justify-end",children:(0,s.jsx)("button",{onClick:()=>C(null),className:"px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors",children:"Close"})})]})})]})}},74075:e=>{"use strict";e.exports=require("zlib")},79428:e=>{"use strict";e.exports=require("buffer")},79551:e=>{"use strict";e.exports=require("url")},81630:e=>{"use strict";e.exports=require("http")},81890:(e,t,r)=>{Promise.resolve().then(r.bind(r,48546))},91645:e=>{"use strict";e.exports=require("net")},94735:e=>{"use strict";e.exports=require("events")}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[447,118,658,878,909],()=>r(55184));module.exports=s})();