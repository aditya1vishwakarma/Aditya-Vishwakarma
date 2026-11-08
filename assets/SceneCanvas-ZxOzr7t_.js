import{r as C,S as K,T as ae,M as kt,W as Ce,P as ta,C as Ea,a as La,E as ne,b as te,F as re,j as $,B as Mt,I as je,c as Eo}from"./index-CzC3wG2s.js";import{V as x,S as Lo,Q as qe,O as At,a as j,P as zt,M as Ge,T as Ue,R as ka,b as Da,u as G,c as fe,d as P,B as it,e as $e,F as pe,I as rt,f as J,g as lt,C as io,N as ro,L as Ct,h as Pa,i as Ra,j as Dt,D as Ca,k as Fa,U as _a,l as Oa,m as le,n as Ia,o as _e,p as oa,Z as aa,q as na,r as sa,s as ia,t as Na,v as ja,w as Ga,W as Qt,x as ra,y as lo,z as Ua,A as Wa,E as Ba,G as Ha,H as $a,J as Va,K as ko,X as Ya}from"./react-three-fiber.esm-CFX1t_Xh.js";function Jt(){return Jt=Object.assign?Object.assign.bind():function(t){for(var o=1;o<arguments.length;o++){var a=arguments[o];for(var e in a)({}).hasOwnProperty.call(a,e)&&(t[e]=a[e])}return t},Jt.apply(null,arguments)}var qa=Object.defineProperty,Xa=(t,o,a)=>o in t?qa(t,o,{enumerable:!0,configurable:!0,writable:!0,value:a}):t[o]=a,Za=(t,o,a)=>(Xa(t,o+"",a),a);class Ka{constructor(){Za(this,"_listeners")}addEventListener(o,a){this._listeners===void 0&&(this._listeners={});const e=this._listeners;e[o]===void 0&&(e[o]=[]),e[o].indexOf(a)===-1&&e[o].push(a)}hasEventListener(o,a){if(this._listeners===void 0)return!1;const e=this._listeners;return e[o]!==void 0&&e[o].indexOf(a)!==-1}removeEventListener(o,a){if(this._listeners===void 0)return;const n=this._listeners[o];if(n!==void 0){const i=n.indexOf(a);i!==-1&&n.splice(i,1)}}dispatchEvent(o){if(this._listeners===void 0)return;const e=this._listeners[o.type];if(e!==void 0){o.target=this;const n=e.slice(0);for(let i=0,l=n.length;i<l;i++)n[i].call(this,o);o.target=null}}}var Qa=Object.defineProperty,Ja=(t,o,a)=>o in t?Qa(t,o,{enumerable:!0,configurable:!0,writable:!0,value:a}):t[o]=a,L=(t,o,a)=>(Ja(t,typeof o!="symbol"?o+"":o,a),a);const mt=new ka,Do=new Da,en=Math.cos(70*(Math.PI/180)),Po=(t,o)=>(t%o+o)%o;let tn=class extends Ka{constructor(o,a){super(),L(this,"object"),L(this,"domElement"),L(this,"enabled",!0),L(this,"target",new x),L(this,"minDistance",0),L(this,"maxDistance",1/0),L(this,"minZoom",0),L(this,"maxZoom",1/0),L(this,"minPolarAngle",0),L(this,"maxPolarAngle",Math.PI),L(this,"minAzimuthAngle",-1/0),L(this,"maxAzimuthAngle",1/0),L(this,"enableDamping",!1),L(this,"dampingFactor",.05),L(this,"enableZoom",!0),L(this,"zoomSpeed",1),L(this,"enableRotate",!0),L(this,"rotateSpeed",1),L(this,"enablePan",!0),L(this,"panSpeed",1),L(this,"screenSpacePanning",!0),L(this,"keyPanSpeed",7),L(this,"zoomToCursor",!1),L(this,"autoRotate",!1),L(this,"autoRotateSpeed",2),L(this,"reverseOrbit",!1),L(this,"reverseHorizontalOrbit",!1),L(this,"reverseVerticalOrbit",!1),L(this,"keys",{LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"}),L(this,"mouseButtons",{LEFT:Ge.ROTATE,MIDDLE:Ge.DOLLY,RIGHT:Ge.PAN}),L(this,"touches",{ONE:Ue.ROTATE,TWO:Ue.DOLLY_PAN}),L(this,"target0"),L(this,"position0"),L(this,"zoom0"),L(this,"_domElementKeyEvents",null),L(this,"getPolarAngle"),L(this,"getAzimuthalAngle"),L(this,"setPolarAngle"),L(this,"setAzimuthalAngle"),L(this,"getDistance"),L(this,"getZoomScale"),L(this,"listenToKeyEvents"),L(this,"stopListenToKeyEvents"),L(this,"saveState"),L(this,"reset"),L(this,"update"),L(this,"connect"),L(this,"dispose"),L(this,"dollyIn"),L(this,"dollyOut"),L(this,"getScale"),L(this,"setScale"),this.object=o,this.domElement=a,this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this.getPolarAngle=()=>m.phi,this.getAzimuthalAngle=()=>m.theta,this.setPolarAngle=u=>{let w=Po(u,2*Math.PI),k=m.phi;k<0&&(k+=2*Math.PI),w<0&&(w+=2*Math.PI);let O=Math.abs(w-k);2*Math.PI-O<O&&(w<k?w+=2*Math.PI:k+=2*Math.PI),p.phi=w-k,e.update()},this.setAzimuthalAngle=u=>{let w=Po(u,2*Math.PI),k=m.theta;k<0&&(k+=2*Math.PI),w<0&&(w+=2*Math.PI);let O=Math.abs(w-k);2*Math.PI-O<O&&(w<k?w+=2*Math.PI:k+=2*Math.PI),p.theta=w-k,e.update()},this.getDistance=()=>e.object.position.distanceTo(e.target),this.listenToKeyEvents=u=>{u.addEventListener("keydown",_t),this._domElementKeyEvents=u},this.stopListenToKeyEvents=()=>{this._domElementKeyEvents.removeEventListener("keydown",_t),this._domElementKeyEvents=null},this.saveState=()=>{e.target0.copy(e.target),e.position0.copy(e.object.position),e.zoom0=e.object.zoom},this.reset=()=>{e.target.copy(e.target0),e.object.position.copy(e.position0),e.object.zoom=e.zoom0,e.object.updateProjectionMatrix(),e.dispatchEvent(n),e.update(),r=s.NONE},this.update=(()=>{const u=new x,w=new x(0,1,0),k=new qe().setFromUnitVectors(o.up,w),O=k.clone().invert(),Q=new x,be=new qe,Le=2*Math.PI;return function(){const To=e.object.position;k.setFromUnitVectors(o.up,w),O.copy(k).invert(),u.copy(To).sub(e.target),u.applyQuaternion(k),m.setFromVector3(u),e.autoRotate&&r===s.NONE&&we(ue()),e.enableDamping?(m.theta+=p.theta*e.dampingFactor,m.phi+=p.phi*e.dampingFactor):(m.theta+=p.theta,m.phi+=p.phi);let Se=e.minAzimuthAngle,Me=e.maxAzimuthAngle;isFinite(Se)&&isFinite(Me)&&(Se<-Math.PI?Se+=Le:Se>Math.PI&&(Se-=Le),Me<-Math.PI?Me+=Le:Me>Math.PI&&(Me-=Le),Se<=Me?m.theta=Math.max(Se,Math.min(Me,m.theta)):m.theta=m.theta>(Se+Me)/2?Math.max(Se,m.theta):Math.min(Me,m.theta)),m.phi=Math.max(e.minPolarAngle,Math.min(e.maxPolarAngle,m.phi)),m.makeSafe(),e.enableDamping===!0?e.target.addScaledVector(h,e.dampingFactor):e.target.add(h),e.zoomToCursor&&R||e.object.isOrthographicCamera?m.radius=N(m.radius):m.radius=N(m.radius*f),u.setFromSpherical(m),u.applyQuaternion(O),To.copy(e.target).add(u),e.object.matrixAutoUpdate||e.object.updateMatrix(),e.object.lookAt(e.target),e.enableDamping===!0?(p.theta*=1-e.dampingFactor,p.phi*=1-e.dampingFactor,h.multiplyScalar(1-e.dampingFactor)):(p.set(0,0,0),h.set(0,0,0));let Qe=!1;if(e.zoomToCursor&&R){let Je=null;if(e.object instanceof zt&&e.object.isPerspectiveCamera){const et=u.length();Je=N(et*f);const dt=et-Je;e.object.position.addScaledVector(D,dt),e.object.updateMatrixWorld()}else if(e.object.isOrthographicCamera){const et=new x(F.x,F.y,0);et.unproject(e.object),e.object.zoom=Math.max(e.minZoom,Math.min(e.maxZoom,e.object.zoom/f)),e.object.updateProjectionMatrix(),Qe=!0;const dt=new x(F.x,F.y,0);dt.unproject(e.object),e.object.position.sub(dt).add(et),e.object.updateMatrixWorld(),Je=u.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),e.zoomToCursor=!1;Je!==null&&(e.screenSpacePanning?e.target.set(0,0,-1).transformDirection(e.object.matrix).multiplyScalar(Je).add(e.object.position):(mt.origin.copy(e.object.position),mt.direction.set(0,0,-1).transformDirection(e.object.matrix),Math.abs(e.object.up.dot(mt.direction))<en?o.lookAt(e.target):(Do.setFromNormalAndCoplanarPoint(e.object.up,e.target),mt.intersectPlane(Do,e.target))))}else e.object instanceof At&&e.object.isOrthographicCamera&&(Qe=f!==1,Qe&&(e.object.zoom=Math.max(e.minZoom,Math.min(e.maxZoom,e.object.zoom/f)),e.object.updateProjectionMatrix()));return f=1,R=!1,Qe||Q.distanceToSquared(e.object.position)>d||8*(1-be.dot(e.object.quaternion))>d?(e.dispatchEvent(n),Q.copy(e.object.position),be.copy(e.object.quaternion),Qe=!1,!0):!1}})(),this.connect=u=>{e.domElement=u,e.domElement.style.touchAction="none",e.domElement.addEventListener("contextmenu",Ao),e.domElement.addEventListener("pointerdown",So),e.domElement.addEventListener("pointercancel",Ke),e.domElement.addEventListener("wheel",Mo)},this.dispose=()=>{var u,w,k,O,Q,be;e.domElement&&(e.domElement.style.touchAction="auto"),(u=e.domElement)==null||u.removeEventListener("contextmenu",Ao),(w=e.domElement)==null||w.removeEventListener("pointerdown",So),(k=e.domElement)==null||k.removeEventListener("pointercancel",Ke),(O=e.domElement)==null||O.removeEventListener("wheel",Mo),(Q=e.domElement)==null||Q.ownerDocument.removeEventListener("pointermove",Ft),(be=e.domElement)==null||be.ownerDocument.removeEventListener("pointerup",Ke),e._domElementKeyEvents!==null&&e._domElementKeyEvents.removeEventListener("keydown",_t)};const e=this,n={type:"change"},i={type:"start"},l={type:"end"},s={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6};let r=s.NONE;const d=1e-6,m=new Lo,p=new Lo;let f=1;const h=new x,c=new j,v=new j,g=new j,y=new j,E=new j,M=new j,b=new j,T=new j,S=new j,D=new x,F=new j;let R=!1;const z=[],ce={};function ue(){return 2*Math.PI/60/60*e.autoRotateSpeed}function V(){return Math.pow(.95,e.zoomSpeed)}function we(u){e.reverseOrbit||e.reverseHorizontalOrbit?p.theta+=u:p.theta-=u}function oe(u){e.reverseOrbit||e.reverseVerticalOrbit?p.phi+=u:p.phi-=u}const A=(()=>{const u=new x;return function(k,O){u.setFromMatrixColumn(O,0),u.multiplyScalar(-k),h.add(u)}})(),_=(()=>{const u=new x;return function(k,O){e.screenSpacePanning===!0?u.setFromMatrixColumn(O,1):(u.setFromMatrixColumn(O,0),u.crossVectors(e.object.up,u)),u.multiplyScalar(k),h.add(u)}})(),I=(()=>{const u=new x;return function(k,O){const Q=e.domElement;if(Q&&e.object instanceof zt&&e.object.isPerspectiveCamera){const be=e.object.position;u.copy(be).sub(e.target);let Le=u.length();Le*=Math.tan(e.object.fov/2*Math.PI/180),A(2*k*Le/Q.clientHeight,e.object.matrix),_(2*O*Le/Q.clientHeight,e.object.matrix)}else Q&&e.object instanceof At&&e.object.isOrthographicCamera?(A(k*(e.object.right-e.object.left)/e.object.zoom/Q.clientWidth,e.object.matrix),_(O*(e.object.top-e.object.bottom)/e.object.zoom/Q.clientHeight,e.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),e.enablePan=!1)}})();function U(u){e.object instanceof zt&&e.object.isPerspectiveCamera||e.object instanceof At&&e.object.isOrthographicCamera?f=u:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),e.enableZoom=!1)}function H(u){U(f/u)}function W(u){U(f*u)}function he(u){if(!e.zoomToCursor||!e.domElement)return;R=!0;const w=e.domElement.getBoundingClientRect(),k=u.clientX-w.left,O=u.clientY-w.top,Q=w.width,be=w.height;F.x=k/Q*2-1,F.y=-(O/be)*2+1,D.set(F.x,F.y,1).unproject(e.object).sub(e.object.position).normalize()}function N(u){return Math.max(e.minDistance,Math.min(e.maxDistance,u))}function X(u){c.set(u.clientX,u.clientY)}function Z(u){he(u),b.set(u.clientX,u.clientY)}function ee(u){y.set(u.clientX,u.clientY)}function ge(u){v.set(u.clientX,u.clientY),g.subVectors(v,c).multiplyScalar(e.rotateSpeed);const w=e.domElement;w&&(we(2*Math.PI*g.x/w.clientHeight),oe(2*Math.PI*g.y/w.clientHeight)),c.copy(v),e.update()}function Ie(u){T.set(u.clientX,u.clientY),S.subVectors(T,b),S.y>0?H(V()):S.y<0&&W(V()),b.copy(T),e.update()}function Ne(u){E.set(u.clientX,u.clientY),M.subVectors(E,y).multiplyScalar(e.panSpeed),I(M.x,M.y),y.copy(E),e.update()}function Pe(u){he(u),u.deltaY<0?W(V()):u.deltaY>0&&H(V()),e.update()}function Ze(u){let w=!1;switch(u.code){case e.keys.UP:I(0,e.keyPanSpeed),w=!0;break;case e.keys.BOTTOM:I(0,-e.keyPanSpeed),w=!0;break;case e.keys.LEFT:I(e.keyPanSpeed,0),w=!0;break;case e.keys.RIGHT:I(-e.keyPanSpeed,0),w=!0;break}w&&(u.preventDefault(),e.update())}function ut(){if(z.length==1)c.set(z[0].pageX,z[0].pageY);else{const u=.5*(z[0].pageX+z[1].pageX),w=.5*(z[0].pageY+z[1].pageY);c.set(u,w)}}function de(){if(z.length==1)y.set(z[0].pageX,z[0].pageY);else{const u=.5*(z[0].pageX+z[1].pageX),w=.5*(z[0].pageY+z[1].pageY);y.set(u,w)}}function Re(){const u=z[0].pageX-z[1].pageX,w=z[0].pageY-z[1].pageY,k=Math.sqrt(u*u+w*w);b.set(0,k)}function ht(){e.enableZoom&&Re(),e.enablePan&&de()}function xa(){e.enableZoom&&Re(),e.enableRotate&&ut()}function yo(u){if(z.length==1)v.set(u.pageX,u.pageY);else{const k=Ot(u),O=.5*(u.pageX+k.x),Q=.5*(u.pageY+k.y);v.set(O,Q)}g.subVectors(v,c).multiplyScalar(e.rotateSpeed);const w=e.domElement;w&&(we(2*Math.PI*g.x/w.clientHeight),oe(2*Math.PI*g.y/w.clientHeight)),c.copy(v)}function wo(u){if(z.length==1)E.set(u.pageX,u.pageY);else{const w=Ot(u),k=.5*(u.pageX+w.x),O=.5*(u.pageY+w.y);E.set(k,O)}M.subVectors(E,y).multiplyScalar(e.panSpeed),I(M.x,M.y),y.copy(E)}function bo(u){const w=Ot(u),k=u.pageX-w.x,O=u.pageY-w.y,Q=Math.sqrt(k*k+O*O);T.set(0,Q),S.set(0,Math.pow(T.y/b.y,e.zoomSpeed)),H(S.y),b.copy(T)}function ya(u){e.enableZoom&&bo(u),e.enablePan&&wo(u)}function wa(u){e.enableZoom&&bo(u),e.enableRotate&&yo(u)}function So(u){var w,k;e.enabled!==!1&&(z.length===0&&((w=e.domElement)==null||w.ownerDocument.addEventListener("pointermove",Ft),(k=e.domElement)==null||k.ownerDocument.addEventListener("pointerup",Ke)),za(u),u.pointerType==="touch"?Ma(u):ba(u))}function Ft(u){e.enabled!==!1&&(u.pointerType==="touch"?Aa(u):Sa(u))}function Ke(u){var w,k,O;Ta(u),z.length===0&&((w=e.domElement)==null||w.releasePointerCapture(u.pointerId),(k=e.domElement)==null||k.ownerDocument.removeEventListener("pointermove",Ft),(O=e.domElement)==null||O.ownerDocument.removeEventListener("pointerup",Ke)),e.dispatchEvent(l),r=s.NONE}function ba(u){let w;switch(u.button){case 0:w=e.mouseButtons.LEFT;break;case 1:w=e.mouseButtons.MIDDLE;break;case 2:w=e.mouseButtons.RIGHT;break;default:w=-1}switch(w){case Ge.DOLLY:if(e.enableZoom===!1)return;Z(u),r=s.DOLLY;break;case Ge.ROTATE:if(u.ctrlKey||u.metaKey||u.shiftKey){if(e.enablePan===!1)return;ee(u),r=s.PAN}else{if(e.enableRotate===!1)return;X(u),r=s.ROTATE}break;case Ge.PAN:if(u.ctrlKey||u.metaKey||u.shiftKey){if(e.enableRotate===!1)return;X(u),r=s.ROTATE}else{if(e.enablePan===!1)return;ee(u),r=s.PAN}break;default:r=s.NONE}r!==s.NONE&&e.dispatchEvent(i)}function Sa(u){if(e.enabled!==!1)switch(r){case s.ROTATE:if(e.enableRotate===!1)return;ge(u);break;case s.DOLLY:if(e.enableZoom===!1)return;Ie(u);break;case s.PAN:if(e.enablePan===!1)return;Ne(u);break}}function Mo(u){e.enabled===!1||e.enableZoom===!1||r!==s.NONE&&r!==s.ROTATE||(u.preventDefault(),e.dispatchEvent(i),Pe(u),e.dispatchEvent(l))}function _t(u){e.enabled===!1||e.enablePan===!1||Ze(u)}function Ma(u){switch(zo(u),z.length){case 1:switch(e.touches.ONE){case Ue.ROTATE:if(e.enableRotate===!1)return;ut(),r=s.TOUCH_ROTATE;break;case Ue.PAN:if(e.enablePan===!1)return;de(),r=s.TOUCH_PAN;break;default:r=s.NONE}break;case 2:switch(e.touches.TWO){case Ue.DOLLY_PAN:if(e.enableZoom===!1&&e.enablePan===!1)return;ht(),r=s.TOUCH_DOLLY_PAN;break;case Ue.DOLLY_ROTATE:if(e.enableZoom===!1&&e.enableRotate===!1)return;xa(),r=s.TOUCH_DOLLY_ROTATE;break;default:r=s.NONE}break;default:r=s.NONE}r!==s.NONE&&e.dispatchEvent(i)}function Aa(u){switch(zo(u),r){case s.TOUCH_ROTATE:if(e.enableRotate===!1)return;yo(u),e.update();break;case s.TOUCH_PAN:if(e.enablePan===!1)return;wo(u),e.update();break;case s.TOUCH_DOLLY_PAN:if(e.enableZoom===!1&&e.enablePan===!1)return;ya(u),e.update();break;case s.TOUCH_DOLLY_ROTATE:if(e.enableZoom===!1&&e.enableRotate===!1)return;wa(u),e.update();break;default:r=s.NONE}}function Ao(u){e.enabled!==!1&&u.preventDefault()}function za(u){z.push(u)}function Ta(u){delete ce[u.pointerId];for(let w=0;w<z.length;w++)if(z[w].pointerId==u.pointerId){z.splice(w,1);return}}function zo(u){let w=ce[u.pointerId];w===void 0&&(w=new j,ce[u.pointerId]=w),w.set(u.pageX,u.pageY)}function Ot(u){const w=u.pointerId===z[0].pointerId?z[1]:z[0];return ce[w.pointerId]}this.dollyIn=(u=V())=>{W(u),e.update()},this.dollyOut=(u=V())=>{H(u),e.update()},this.getScale=()=>f,this.setScale=u=>{U(u),e.update()},this.getZoomScale=()=>V(),a!==void 0&&this.connect(a),this.update()}};const on=C.forwardRef(({makeDefault:t,camera:o,regress:a,domElement:e,enableDamping:n=!0,keyEvents:i=!1,onChange:l,onStart:s,onEnd:r,...d},m)=>{const p=G(S=>S.invalidate),f=G(S=>S.camera),h=G(S=>S.gl),c=G(S=>S.events),v=G(S=>S.setEvents),g=G(S=>S.set),y=G(S=>S.get),E=G(S=>S.performance),M=o||f,b=e||c.connected||h.domElement,T=C.useMemo(()=>new tn(M),[M]);return fe(()=>{T.enabled&&T.update()},-1),C.useEffect(()=>(i&&T.connect(i===!0?b:i),T.connect(b),()=>void T.dispose()),[i,b,a,T,p]),C.useEffect(()=>{const S=R=>{p(),a&&E.regress(),l&&l(R)},D=R=>{s&&s(R)},F=R=>{r&&r(R)};return T.addEventListener("change",S),T.addEventListener("start",D),T.addEventListener("end",F),()=>{T.removeEventListener("start",D),T.removeEventListener("end",F),T.removeEventListener("change",S)}},[l,s,r,T,p,v]),C.useEffect(()=>{if(t){const S=y().controls;return g({controls:T}),()=>g({controls:S})}},[t,T]),C.createElement("primitive",Jt({ref:m,object:T,enableDamping:n},d))}),an={uniforms:{resolution:{value:new j(1/1024,1/512)}},fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec2 resolution;
		varying vec2 vUv;

		#define EDGE_STEP_COUNT 6
		#define EDGE_GUESS 8.0
		#define EDGE_STEPS 1.0, 1.5, 2.0, 2.0, 2.0, 4.0
		const float edgeSteps[EDGE_STEP_COUNT] = float[EDGE_STEP_COUNT]( EDGE_STEPS );

		float _ContrastThreshold = 0.0312;
		float _RelativeThreshold = 0.063;
		float _SubpixelBlending = 1.0;

		vec4 Sample( sampler2D  tex2D, vec2 uv ) {

			return texture( tex2D, uv );

		}

		float SampleLuminance( sampler2D tex2D, vec2 uv ) {

			return dot( Sample( tex2D, uv ).rgb, vec3( 0.3, 0.59, 0.11 ) );

		}

		float SampleLuminance( sampler2D tex2D, vec2 texSize, vec2 uv, float uOffset, float vOffset ) {

			uv += texSize * vec2(uOffset, vOffset);
			return SampleLuminance(tex2D, uv);

		}

		struct LuminanceData {

			float m, n, e, s, w;
			float ne, nw, se, sw;
			float highest, lowest, contrast;

		};

		LuminanceData SampleLuminanceNeighborhood( sampler2D tex2D, vec2 texSize, vec2 uv ) {

			LuminanceData l;
			l.m = SampleLuminance( tex2D, uv );
			l.n = SampleLuminance( tex2D, texSize, uv,  0.0,  1.0 );
			l.e = SampleLuminance( tex2D, texSize, uv,  1.0,  0.0 );
			l.s = SampleLuminance( tex2D, texSize, uv,  0.0, -1.0 );
			l.w = SampleLuminance( tex2D, texSize, uv, -1.0,  0.0 );

			l.ne = SampleLuminance( tex2D, texSize, uv,  1.0,  1.0 );
			l.nw = SampleLuminance( tex2D, texSize, uv, -1.0,  1.0 );
			l.se = SampleLuminance( tex2D, texSize, uv,  1.0, -1.0 );
			l.sw = SampleLuminance( tex2D, texSize, uv, -1.0, -1.0 );

			l.highest = max( max( max( max( l.n, l.e ), l.s ), l.w ), l.m );
			l.lowest = min( min( min( min( l.n, l.e ), l.s ), l.w ), l.m );
			l.contrast = l.highest - l.lowest;
			return l;

		}

		bool ShouldSkipPixel( LuminanceData l ) {

			float threshold = max( _ContrastThreshold, _RelativeThreshold * l.highest );
			return l.contrast < threshold;

		}

		float DeterminePixelBlendFactor( LuminanceData l ) {

			float f = 2.0 * ( l.n + l.e + l.s + l.w );
			f += l.ne + l.nw + l.se + l.sw;
			f *= 1.0 / 12.0;
			f = abs( f - l.m );
			f = clamp( f / l.contrast, 0.0, 1.0 );

			float blendFactor = smoothstep( 0.0, 1.0, f );
			return blendFactor * blendFactor * _SubpixelBlending;

		}

		struct EdgeData {

			bool isHorizontal;
			float pixelStep;
			float oppositeLuminance, gradient;

		};

		EdgeData DetermineEdge( vec2 texSize, LuminanceData l ) {

			EdgeData e;
			float horizontal =
				abs( l.n + l.s - 2.0 * l.m ) * 2.0 +
				abs( l.ne + l.se - 2.0 * l.e ) +
				abs( l.nw + l.sw - 2.0 * l.w );
			float vertical =
				abs( l.e + l.w - 2.0 * l.m ) * 2.0 +
				abs( l.ne + l.nw - 2.0 * l.n ) +
				abs( l.se + l.sw - 2.0 * l.s );
			e.isHorizontal = horizontal >= vertical;

			float pLuminance = e.isHorizontal ? l.n : l.e;
			float nLuminance = e.isHorizontal ? l.s : l.w;
			float pGradient = abs( pLuminance - l.m );
			float nGradient = abs( nLuminance - l.m );

			e.pixelStep = e.isHorizontal ? texSize.y : texSize.x;

			if (pGradient < nGradient) {

				e.pixelStep = -e.pixelStep;
				e.oppositeLuminance = nLuminance;
				e.gradient = nGradient;

			} else {

				e.oppositeLuminance = pLuminance;
				e.gradient = pGradient;

			}

			return e;

		}

		float DetermineEdgeBlendFactor( sampler2D  tex2D, vec2 texSize, LuminanceData l, EdgeData e, vec2 uv ) {

			vec2 uvEdge = uv;
			vec2 edgeStep;
			if (e.isHorizontal) {

				uvEdge.y += e.pixelStep * 0.5;
				edgeStep = vec2( texSize.x, 0.0 );

			} else {

				uvEdge.x += e.pixelStep * 0.5;
				edgeStep = vec2( 0.0, texSize.y );

			}

			float edgeLuminance = ( l.m + e.oppositeLuminance ) * 0.5;
			float gradientThreshold = e.gradient * 0.25;

			vec2 puv = uvEdge + edgeStep * edgeSteps[0];
			float pLuminanceDelta = SampleLuminance( tex2D, puv ) - edgeLuminance;
			bool pAtEnd = abs( pLuminanceDelta ) >= gradientThreshold;

			for ( int i = 1; i < EDGE_STEP_COUNT && !pAtEnd; i++ ) {

				puv += edgeStep * edgeSteps[i];
				pLuminanceDelta = SampleLuminance( tex2D, puv ) - edgeLuminance;
				pAtEnd = abs( pLuminanceDelta ) >= gradientThreshold;

			}

			if ( !pAtEnd ) {

				puv += edgeStep * EDGE_GUESS;

			}

			vec2 nuv = uvEdge - edgeStep * edgeSteps[0];
			float nLuminanceDelta = SampleLuminance( tex2D, nuv ) - edgeLuminance;
			bool nAtEnd = abs( nLuminanceDelta ) >= gradientThreshold;

			for ( int i = 1; i < EDGE_STEP_COUNT && !nAtEnd; i++ ) {

				nuv -= edgeStep * edgeSteps[i];
				nLuminanceDelta = SampleLuminance( tex2D, nuv ) - edgeLuminance;
				nAtEnd = abs( nLuminanceDelta ) >= gradientThreshold;

			}

			if ( !nAtEnd ) {

				nuv -= edgeStep * EDGE_GUESS;

			}

			float pDistance, nDistance;
			if ( e.isHorizontal ) {

				pDistance = puv.x - uv.x;
				nDistance = uv.x - nuv.x;

			} else {

				pDistance = puv.y - uv.y;
				nDistance = uv.y - nuv.y;

			}

			float shortestDistance;
			bool deltaSign;
			if ( pDistance <= nDistance ) {

				shortestDistance = pDistance;
				deltaSign = pLuminanceDelta >= 0.0;

			} else {

				shortestDistance = nDistance;
				deltaSign = nLuminanceDelta >= 0.0;

			}

			if ( deltaSign == ( l.m - edgeLuminance >= 0.0 ) ) {

				return 0.0;

			}

			return 0.5 - shortestDistance / ( pDistance + nDistance );

		}

		vec4 ApplyFXAA( sampler2D  tex2D, vec2 texSize, vec2 uv ) {

			LuminanceData luminance = SampleLuminanceNeighborhood( tex2D, texSize, uv );
			if ( ShouldSkipPixel( luminance ) ) {

				return Sample( tex2D, uv );

			}

			float pixelBlend = DeterminePixelBlendFactor( luminance );
			EdgeData edge = DetermineEdge( texSize, luminance );
			float edgeBlend = DetermineEdgeBlendFactor( tex2D, texSize, luminance, edge, uv );
			float finalBlend = max( pixelBlend, edgeBlend );

			if (edge.isHorizontal) {

				uv.y += edge.pixelStep * finalBlend;

			} else {

				uv.x += edge.pixelStep * finalBlend;

			}

			return Sample( tex2D, uv );

		}

		void main() {

			gl_FragColor = ApplyFXAA( tDiffuse, resolution.xy, vUv );

		}`},Y=new x(...K.position),co=new x(...K.target),B=new x().subVectors(co,Y).setY(0).normalize(),uo=P.radToDeg(Math.atan2(B.x,-B.z)),Te={apex:Y.clone().addScaledVector(B,-16),spread:72,reach:340},Pt=(t,o,a=0)=>{const e=t-Te.apex.x,n=o-Te.apex.z,i=e*B.x+n*B.z,l=Math.abs(e*B.z-n*B.x);return i>0&&Math.atan2(l,i)<P.degToRad(Te.spread+a)},It=(t,o,a,e)=>{const n=(t/a)**2+(o/e)**2;return n>=1?0:(1-n)*(1-n)},la=(t,o)=>3.3*It(t-2.5,o+.5,17,13)+7.5*It(t-22,o+52,28,20)+13*It(t-72,o+62,42,32)+.25*Math.sin(t*.11+1.3)*Math.sin(o*.09+.4),nn=la(0,0),ie=(t,o)=>la(t,o)-nn,st=(t,o,a=new x)=>{const n=ie(t+.05,o)-ie(t-.05,o),i=ie(t,o+.05)-ie(t,o-.05);return a.set(-n,2*.05,-i).normalize()};function sn(){const e=Math.atan2(B.x,B.z),n=P.degToRad(Te.spread),i=new Float32Array(14647*3),l=new Float32Array(i.length),s=new x;let r=0;for(let f=0;f<=150;f++){const h=4*Math.pow(Te.reach/4,f/150);for(let c=0;c<=96;c++){const v=e+(c/96*2-1)*n,g=Te.apex.x+Math.sin(v)*h,y=Te.apex.z+Math.cos(v)*h;i[r]=g,i[r+1]=ie(g,y),i[r+2]=y,st(g,y,s),l[r]=s.x,l[r+1]=s.y,l[r+2]=s.z,r+=3}}const d=(()=>{const f=c=>new x(i[c*3],0,i[c*3+2]),h=f(0);return new x().crossVectors(f(97).sub(h),f(1).sub(h)).y>0})(),m=[];for(let f=0;f<150;f++)for(let h=0;h<96;h++){const c=f*97+h,v=c+96+1;d?m.push(c,v,c+1,c+1,v,v+1):m.push(c,c+1,v,c+1,v+1,v)}const p=new it;return p.setAttribute("position",new $e(i,3)),p.setAttribute("normal",new $e(l,3)),p.setIndex(m),p.computeBoundingSphere(),p}const Ro={x:8,z:0},ca=240,rn=420;function Co(t,o){const e=P.degToRad(uo),n=P.degToRad(110),i=[];for(let r=0;r<=240;r++){const d=e+(r/240*2-1)*n,m=Ro.x+t*Math.sin(d),p=Ro.z-t*Math.cos(d);i.push(m,-40,p,m,o(d),p)}const l=[];for(let r=0;r<240;r++){const d=r*2;l.push(d,d+2,d+1,d+1,d+2,d+3)}const s=new it;return s.setAttribute("position",new pe(i,3)),s.setIndex(l),s.computeBoundingSphere(),s}const ln=t=>{const o=t*ca,a=-.8+2.1*Math.sin(t*3+1.1)+1.3*Math.sin(t*8+2.3),e=Math.max(0,Math.sin(o*.9)*Math.sin(o*.37+1))*1.2+Math.abs(Math.sin(o*2.3))*.45;return a+e*(.5+.5*Math.sin(t*12))},cn=t=>6.2+3.7*Math.sin(t*3+.4)+2.5*Math.sin(t*8+2),ve=t=>()=>{t=t+1831565813|0;let o=Math.imul(t^t>>>15,1|t);return o=o+Math.imul(o^o>>>7,61|o)^o,((o^o>>>14)>>>0)/4294967296},un=126,eo=new x(0,1,0),nt=Math.PI*2,Fe=new x,Fo=(t,o,a)=>{const e=1-o;return a.set(0,0,0).addScaledVector(t.a,e*e).addScaledVector(t.c,2*e*o).addScaledVector(t.b,o*o)},_o=(t,o,a)=>a.subVectors(t.c,t.a).multiplyScalar(2*(1-o)).addScaledVector(Fe.subVectors(t.b,t.c),2*o).normalize(),tt=(t,o,a)=>t.clone().lerp(o,.5).addScaledVector(eo,t.distanceTo(o)*a),hn=(t,o)=>{const a=1-P.smoothstep(o,-.3,.95),e=Math.pow(.5+.5*Math.cos(5*t+.7),3);return 1+a*a*(.35+.8*e)};class dn{constructor(){this.positions=[],this.normals=[],this.bark=[],this.index=[]}add(o){const a=this.positions.length/3,e=new x,n=new x,i=new x,l=new x,s=new x,r=new x;_o(o,0,i),l.set(0,1,0),Math.abs(i.y)>.9&&l.set(1,0,0),Fo(o,0,n);let d=0;for(let p=0;p<=o.rings;p++){const f=o.flare?Math.pow(p/o.rings,1.35):p/o.rings;Fo(o,f,e),_o(o,f,i),d+=e.distanceTo(n),n.copy(e),l.addScaledVector(i,-l.dot(i)).normalize(),s.crossVectors(i,l);const h=P.lerp(o.r0,o.r1,Math.pow(f,.85));for(let c=0;c<=o.sides;c++){const v=c/o.sides*nt;r.copy(l).multiplyScalar(Math.cos(v)).addScaledVector(s,Math.sin(v));const g=h*(o.flare?hn(v,e.y):1);this.positions.push(e.x+r.x*g,e.y+r.y*g,e.z+r.z*g),this.normals.push(r.x,r.y,r.z),this.bark.push(d,c/o.sides)}}const m=o.sides+1;for(let p=0;p<o.rings;p++)for(let f=0;f<o.sides;f++){const h=a+p*m+f,c=h+m;this.index.push(h,h+1,c,h+1,c+1,c)}}build(){const o=new it;return o.setAttribute("position",new pe(this.positions,3)),o.setAttribute("normal",new pe(this.normals,3)),o.setAttribute("aBark",new pe(this.bark,2)),o.setIndex(this.index),o.computeBoundingSphere(),o}}function mn(t=ae.seed){const o=ve(t),a=(A,_)=>A+(_-A)*o(),e=new x(...ae.crownCentre),n=new x(...ae.crownRadii),i=[],l=(A,_,I,U)=>{const H=Math.sqrt(1-A*A),W=new x(Math.cos(_)*H*n.x,A*n.y,Math.sin(_)*H*n.z).multiplyScalar(I).add(e);W.x+=a(-.3,.3),W.y+=a(-.25,.25),W.z+=a(-.3,.3),i.push({centre:W,radius:a(...ae.lobeRadius)*U})};l(1,0,.66,.98);for(let A=0;A<5;A++)l(.55,A/5*nt+a(-.25,.25),.75,.97);for(let A=0;A<6;A++)l(-.02,(A+.5)/6*nt+a(-.2,.2),.88,1.04);for(let A=0;A<4;A++)l(-.58,(A+.25)/4*nt+a(-.25,.25),.74,.94);if(i.length>kt)throw new Error(`maple: ${i.length} lobes, shaders hold ${kt}`);const s=[];i.forEach((A,_)=>{const I=new x().subVectors(A.centre,e).normalize(),U=Math.max(3,Math.round(ae.clumpsPerLobe*(A.radius/1.9)**2));for(let H=0;H<U;H++){const W=1-2*(H+.5)/U,he=Math.sqrt(1-W*W),N=H*2.39996+_*1.3+a(-.3,.3),X=new x(Math.cos(N)*he,W,Math.sin(N)*he);if(X.dot(I)<-.35)continue;const Z=A.centre.clone().addScaledVector(X.multiply(Fe.set(1,.82,1)),A.radius*a(.55,.7));i.some((ee,ge)=>ge!==_&&Z.distanceTo(ee.centre)<ee.radius*.7)||s.length<un&&s.push({centre:Z,radius:A.radius*ae.clumpRadius*a(.85,1.15)})}});const r=new dn,d=new x(-.1,ae.forkY,.05),m=ae.trunkRadius*.72;r.add({a:new x(0,-.6,0),c:new x(.14,1.2,-.04),b:d.clone().add(new x(-.03,.35,0)),r0:ae.trunkRadius,r1:m*.82,rings:24,sides:14,flare:!0});const p=d.clone().add(new x(0,-.3,0)),f=(A,_,I)=>{for(let U=0;U<I;U++){const H=new x(a(-1,1),a(-.4,1),a(-1,1)).normalize().add(Fe.subVectors(_.centre,d).setY(0).normalize().multiplyScalar(.6)).normalize(),W=_.centre.clone().addScaledVector(H,_.radius*a(.6,.85));r.add({a:A,c:tt(A,W,.08),b:W,r0:.028,r1:.009,rings:5,sides:5})}},h=(A,_,I)=>{const U=I.centre.clone().addScaledVector(Fe.subVectors(I.centre,A).normalize(),I.radius*.1);r.add({a:A,c:tt(A,U,.12),b:U,r0:_,r1:.03,rings:8,sides:7}),f(U,I,4)},c=i[0],v=i.slice(1).sort((A,_)=>Math.atan2(A.centre.z-d.z,A.centre.x-d.x)-Math.atan2(_.centre.z-d.z,_.centre.x-d.x)),g=[];let y=0;for(const A of[3,3,3,3,3])g.push(v.slice(y,y+A)),y+=A;const E=g.map(A=>A.reduce((_,I)=>_.add(I.centre),new x).divideScalar(A.length)),M=[[0,1],[2,3],[4]];M.forEach((A,_)=>{const I=_===M.length-1,U=A.reduce((Z,ee)=>Z+g[ee].length,0)+(I?1:0),H=A.reduce((Z,ee)=>Z.add(E[ee]),new x).divideScalar(A.length),W=d.clone().lerp(H,.22).addScaledVector(eo,.75+.25*_),he=m*Math.pow(U/(i.length-1),.4)*1.05,N=he*.8;r.add({a:p,c:tt(p,W,.05),b:W,r0:he,r1:N,rings:9,sides:11});const X=W.clone().addScaledVector(Fe.subVectors(W,p).normalize(),-.18);A.forEach(Z=>{const ee=g[Z],ge=d.clone().lerp(E[Z],.6).addScaledVector(eo,.15),Ie=N*Math.pow(ee.length/U,.4),Ne=Ie*.62;r.add({a:X,c:tt(X,ge,.06),b:ge,r0:Ie,r1:Ne,rings:10,sides:9});const Pe=Ne*.85*Math.pow(1/ee.length,.3);ee.forEach(Ze=>h(ge,Pe,Ze))}),I&&(r.add({a:X,c:tt(X,c.centre,.04),b:c.centre.clone(),r0:N*.75,r1:.05,rings:12,sides:9}),f(c.centre,c,4))});const b=[],T=[],S=[],D=[],F=[],R=new x,z=new x,ce=new x,ue=new x,V=e.y-n.y,we=e.y+n.y+.8;i.forEach((A,_)=>{const I=Math.round(ae.cardsPerLobe*(A.radius/1.65)**2);for(let U=0;U<I;U++){const H=new x(a(-1,1),a(-1,1),a(-1,1));if(H.lengthSq()>1||H.lengthSq()<1e-4){U--;continue}H.normalize();const W=A.radius*(.55+.49*Math.pow(o(),.25));R.copy(H).multiplyScalar(W).multiply(Fe.set(1,.82,1)).add(A.centre);let he=!1,N=1/0;if(i.forEach((de,Re)=>{const ht=R.distanceTo(de.centre);Re!==_&&ht<de.radius*.62&&(he=!0),N=Math.min(N,ht-de.radius)}),he)continue;let X=0,Z=1/0;for(let de=0;de<s.length;de++){const Re=R.distanceTo(s[de].centre)/s[de].radius;Re<Z&&(Z=Re,X=de)}z.subVectors(R,A.centre).normalize(),ce.subVectors(R,e).divide(Fe.copy(n).multiply(n)).normalize(),ue.subVectors(R,s[X].centre).normalize();const ee=ue.multiplyScalar(.5).addScaledVector(z,.3).addScaledVector(ce,.2).normalize(),ge=P.smoothstep(N,-.9,.05),Ie=P.smoothstep(R.y,V,we),Ne=ge*(.62+.38*Ie)*(.78+.22*P.smoothstep(Z,.35,1));b.push(R.x,R.y,R.z),T.push(ee.x,ee.y,ee.z);const Pe=o()<.45?o()<.5?0:3:o()<.5?1:2,[Ze,ut]=Pe===0||Pe===3?ae.cardSize.lone:ae.cardSize.spray;S.push(a(Ze,ut),o()*nt,o(),Pe),D.push(Ne,_,X),z.x>.45&&R.z>-.3&&ge>.8&&R.y>3.4&&R.y<7.2&&F.push(R.clone())}}),F.sort((A,_)=>_.x-A.x),F.length=Math.max(1,Math.ceil(F.length*.3));const oe=new rt;return oe.setAttribute("position",new pe([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0],3)),oe.setIndex([0,1,2,0,2,3]),oe.setAttribute("aCenter",new J(new Float32Array(b),3)),oe.setAttribute("aNormal",new J(new Float32Array(T),3)),oe.setAttribute("aLeaf",new J(new Float32Array(S),4)),oe.setAttribute("aShade",new J(new Float32Array(D),3)),oe.instanceCount=b.length/3,oe.boundingSphere=new lt(e.clone(),8),{wood:r.build(),leaves:oe,lobes:i,loose:F}}const to=(t,o)=>{const a=P.degToRad(t),e=new x(-B.z,0,B.x);return new j(Y.x+(B.x*Math.cos(a)+e.x*Math.sin(a))*o,Y.z+(B.z*Math.cos(a)+e.z*Math.sin(a))*o)},ua=t=>{const o=new io(t);return o.colorSpace=ro,o.minFilter=Ct,o.anisotropy=4,o.needsUpdate=!0,o},ze={width:256,height:64,tiles:4},fn=40,Oo=140,pn=240;function vn(t,o,a,e,n,i){const l=11+Math.floor(i()*4),s=i()*Math.PI;for(let r=0;r<l;r++){const d=s+r/l*Math.PI*2,m=e*(.88+.24*i());t.save(),t.translate(o,a),t.scale(1,n),t.rotate(d);const p=t.createLinearGradient(0,0,m,0);p.addColorStop(0,`rgb(190, ${Oo}, 0)`),p.addColorStop(1,`rgb(255, ${Oo}, 0)`),t.fillStyle=p,t.beginPath(),t.ellipse(m*.55,0,m*.5,e*.17,0,0,Math.PI*2),t.fill(),t.restore()}t.fillStyle=`rgb(230, ${pn}, 0)`,t.beginPath(),t.ellipse(o,a,e*.32,e*.32*n,0,0,Math.PI*2),t.fill()}function gn(){const t=document.createElement("canvas");t.width=ze.width,t.height=ze.height;const o=t.getContext("2d"),a=ve(31),e=ze.width/ze.tiles,n=ze.height,i=(s,r,d)=>{o.strokeStyle=`rgb(150, ${fn}, 0)`,o.lineWidth=2.2,o.lineCap="round",o.beginPath(),o.moveTo(s,n),o.quadraticCurveTo(s+d*.4,(n+r)/2,s+d,r),o.stroke()},l=(s,r,d,m,p,f)=>{const h=s*e+r*e;i(h,d,f),vn(o,h+f,d,m,p,a)};return l(0,.5,n*.36,e*.3,1,0),l(1,.5,n*.4,e*.28,.55,2),l(2,.32,n*.5,e*.2,.8,-3),l(2,.66,n*.32,e*.25,.9,2),l(3,.25,n*.56,e*.16,.85,-2),l(3,.52,n*.42,e*.18,.7,1),l(3,.78,n*.6,e*.15,.9,2),ua(t)}const xn=.1,Nt=[.4,.3,.3];function yn(){const t=ve(37),o=ve(41),a=[],e=[],n=[],i=[],l=[],s=new x,r=new x,d=(p,f,h,c,v,g=!1)=>{const y=Math.max(1,Math.round(h*(g?xn:1)));let E=0;for(let M=0;M<h;M++){const b=t()*Math.PI*2,T=c*Math.sqrt(t()),S=p+Math.cos(b)*T,D=f+Math.sin(b)*T;if(!Pt(S,D)||S*S+D*D<4)continue;st(S,D,s),a.push(S,ie(S,D)-.02,D),e.push(s.x,s.y,s.z),n.push(v*(.8+.4*t()),Math.floor(t()*ze.tiles),t(),.8+.4*t()),i.push(E++<y?1:0);const F=g?o():0;l.push(F<Nt[0]?0:F<Nt[0]+Nt[1]?1:2)}};for(let p=0,f=0;p<64&&f<4e3;f++){const h=t()*Math.PI*2,c=Math.sqrt(t())*.88,v=22+Math.cos(h)*c*28,g=-52+Math.sin(h)*c*20;st(v,g,s),r.set(Y.x-v,0,Y.z-g).normalize(),!(!Pt(v,g)||c>.3&&s.dot(r)<.02)&&(d(v,g,10+Math.floor(t()*14),1.6+t()*2.4,.4,!0),p++)}for(let p=0;p<21;p++){const f=P.degToRad(-60+t()*120);d(Math.sin(f)*(7+t()*7)+3,Math.cos(f)*(6+t()*6),4+Math.floor(t()*8),.8+t(),.3)}const m=new rt;return m.setAttribute("position",new pe([-.5,0,0,.5,0,0,.5,1,0,-.5,1,0],3)),m.setIndex([0,1,2,0,2,3]),m.setAttribute("aBase",new J(new Float32Array(a),3)),m.setAttribute("aNormal",new J(new Float32Array(e),3)),m.setAttribute("aFlower",new J(new Float32Array(n),4)),m.setAttribute("aSway",new J(new Float32Array(i),1)),m.setAttribute("aPetal",new J(new Float32Array(l),1)),m.instanceCount=a.length/3,m.boundingSphere=new lt(new x(16,0,-30),90),m}const ye={width:256,height:128,tiles:4};function wn(t,o,a,e,n,i,l){const s=Math.round(i*255),r=n===0?[[.5,.52,.44,.34]]:n===1?[[.5,.48,.38,.38]]:n===2?[[.5,.45,.3,.41]]:[[.34,.55,.3,.31],[.65,.48,.32,.35]];t.fillStyle=`rgb(80, ${s}, 0)`;for(const[h,c,,v]of r){const g=(c+v*.3)*e;t.fillRect(o+h*a-a*.05,g,a*.1,e-g)}const d=new Path2D;for(const[h,c,v,g]of r){const y=l()*6;for(let E=0;E<=72;E++){const M=E/72*Math.PI*2,b=1+.07*Math.sin(M*7+y)+.045*Math.sin(M*13+y*2)+.03*Math.sin(M*19+y*3),T=Math.sin(M)>0?.86:1,S=o+(h+Math.cos(M)*v*b)*a,D=(c+Math.sin(M)*g*b*T)*e;E===0?d.moveTo(S,D):d.lineTo(S,D)}d.closePath()}const m=Math.min(...r.map(([,h,,c])=>h-c))*e,p=Math.max(...r.map(([,h,,c])=>h+c))*e,f=t.createLinearGradient(o+a*.25,m,o+a*.75,p);f.addColorStop(0,`rgb(245, ${s}, 0)`),f.addColorStop(.55,`rgb(170, ${s}, 0)`),f.addColorStop(1,`rgb(95, ${s}, 0)`),t.fillStyle=f,t.fill(d),t.save(),t.clip(d);for(let h=0;h<20;h++){const[c,v,g,y]=r[h%r.length],E=l()<.55,M=o+(c+(l()-(E?.7:.35))*g*1.3)*a,b=(v+(l()-(E?.85:.15))*y*1.2)*e;t.fillStyle=E?`rgb(255, ${s}, 0)`:`rgb(80, ${s}, 0)`,t.globalAlpha=E?.5:.4,t.beginPath(),t.arc(M,b,(.05+.05*l())*a,0,Math.PI*2),t.fill()}t.restore()}function bn(){const t=document.createElement("canvas");t.width=ye.width,t.height=ye.height;const o=t.getContext("2d"),a=ve(41),e=ye.width/ye.tiles;for(let n=0;n<ye.tiles;n++)wn(o,n*e,e,ye.height,n,a(),a);return ua(t)}function Sn(){const t=ve(43),o=[],a=[],e=(s,r,d=!1)=>{if(!Pt(s.x,s.y))return;const m=ie(s.x,s.y);!d&&m>-2.6||ha(s.x,s.y,3)||(o.push(s.x,m-.1,s.y),a.push(r,Math.floor(t()*ye.tiles),t(),.85+.45*t()))};for(let s=-42;s<40;s+=.45+t()*.55){if(s<-8&&t()<.4)continue;const r=186+9*Math.sin(s*.11+.6)+(t()-.5)*12;e(to(s,r),(s>8?5.5:4.8)+t()*t()*5)}for(let s=0;s<4;s++)e(to(-31+t()*7,170+t()*10),4.5+t()*2.5);const n=new j(22,-52),i=new j(n.x-Y.x,n.y-Y.z).normalize();for(let s=0;s<13;s++){const r=n.clone().addScaledVector(i,2+t()*9).add(new j(-i.y,i.x).multiplyScalar((t()-.5)*22));e(r,3.6+t()*1.6,!0)}const l=new rt;return l.setAttribute("position",new pe([-.5,0,0,.5,0,0,.5,1,0,-.5,1,0],3)),l.setIndex([0,1,2,0,2,3]),l.setAttribute("aBase",new J(new Float32Array(o),3)),l.setAttribute("aTree",new J(new Float32Array(a),4)),l.instanceCount=o.length/3,l.boundingSphere=new lt(new x(Y.x+B.x*150,0,Y.z+B.z*150),170),l}const Mn=t=>{const o=t.getAttribute("aBase"),a=t.getAttribute("aTree"),e=new Float32Array(o.count*3);for(let n=0;n<o.count;n++)e.set([o.getX(n),o.getY(n)+a.getX(n),o.getZ(n)],n*3);return e},An=[[-52,158],[-40,150],[-28,134],[-15,96],[-3,108],[8,150],[20,140],[32,122],[44,128]].map(([t,o])=>to(t,o)),ho=[8,8],Ve=(()=>{const t=new Pa(An).getSpacedPoints(27),o=ho[0]+2,a=new Ra().setFromPoints(t).expandByScalar(o),e=t.map(l=>Math.hypot(l.x-Y.x,l.y-Y.z)),n=new Dt(Y.x,Y.z,Math.min(...e)-o,Math.max(...e)+o),i=Math.max(...t.map(l=>ie(l.x,l.y)));return{points:t,box:new Dt(a.min.x,a.min.y,a.max.x,a.max.y),ring:n,level:i}})(),ha=(t,o,a=1)=>{const{points:e}=Ve;let n=1/0;for(let i=0;i<e.length-1;i++){const l=e[i],s=e[i+1].x-l.x,r=e[i+1].y-l.y,d=P.clamp(((t-l.x)*s+(o-l.y)*r)/(s*s+r*r),0,1);n=Math.min(n,Math.hypot(t-l.x-s*d,o-l.y-r*d))}return n<ho[0]+a},Tt={width:256,height:64,tufts:4},{width:Io,height:ke,tufts:oo}=Tt;function zn(){const t=document.createElement("canvas");t.width=Io,t.height=ke;const o=t.getContext("2d"),a=ve(17),e=Io/oo,n=e/128;for(let l=0;l<oo;l++){const s=5+Math.floor(a()*4),r=l*e+e/2;for(let d=0;d<s;d++){const m=s===1?0:d/(s-1)-.5,p=Math.round(a()*255),f=r+m*e*.34+(a()-.5)*8*n,h=ke*(.55+.4*a())*(1-Math.abs(m)*.5),c=m*e*.55+(a()-.5)*16*n,v=f+c,g=ke-h,y=(3.2+a()*2.2)*n,E=(a()-.5)*18*n+c*.25,M=new Path2D;M.moveTo(f-y,ke),M.quadraticCurveTo(f-y*.6+E,ke-h*.55,v,g),M.quadraticCurveTo(f+y*.6+E,ke-h*.55,f+y,ke),M.closePath();const b=o.createLinearGradient(0,ke,0,g);b.addColorStop(0,`rgb(120, ${p}, 0)`),b.addColorStop(1,`rgb(250, ${p}, 0)`),o.fillStyle=b,o.fill(M),o.strokeStyle=`rgb(70, ${p}, 0)`,o.lineWidth=1.6*n,o.lineJoin="round",o.stroke(M)}}const i=new io(t);return i.colorSpace=ro,i.minFilter=Ct,i.anisotropy=4,i.needsUpdate=!0,i}function Tn(t=900){const o=ve(23),a=[],e=[],n=[],i=new x;let l=0;for(let r=0;l<t&&r<t*40;r++){const d=-34+o()*82,m=-26+o()*66,p=Math.exp(-(d*d+m*m)/72),f=P.smoothstep(m,-10,30);if(o()>.05+.6*p+.4*f)continue;l++;const h=1+Math.floor(o()*o()*7),c=.25+.6*o();for(let v=0;v<h;v++){const g=d+(o()-.5)*2*c,y=m+(o()-.5)*2*c;if(g*g+y*y<.55*.55||!Pt(g,y)||ha(g,y))continue;st(g,y,i),a.push(g,ie(g,y)-.03,y),e.push(i.x,i.y,i.z);const E=(.3+.3*o()*o())*(v===0?1.1:.85);n.push(E,Math.floor(o()*oo),o(),.85+.3*o())}}const s=new rt;return s.setAttribute("position",new pe([-.5,0,0,.5,0,0,.5,1,0,-.5,1,0],3)),s.setIndex([0,1,2,0,2,3]),s.setAttribute("aBase",new J(new Float32Array(a),3)),s.setAttribute("aNormal",new J(new Float32Array(e),3)),s.setAttribute("aTuft",new J(new Float32Array(n),4)),s.instanceCount=a.length/3,s.boundingSphere=new lt(new x(7,0,7),60),s}const ct=256,me=ct/2,En=[[0,1],[5,.86],[11,.83],[13.5,.72],[21,.73],[23,.62],[32,.47,!0],[38,.58],[41,.7],[44,.67],[48,.84],[50.5,.81],[56,.97],[63,.83],[67,.8],[70,.69],[76,.66],[78.5,.56],[90,.4,!0],[99,.5],[104,.58],[107,.55],[118,.66],[127,.52],[131,.49],[136,.38],[160,.18,!0]],Ln=[[0,1],[56,.97],[-56,.97],[118,.66],[-118,.66]],kn=t=>{const o=n=>En.map(([i,l,s])=>{const r=1+n*t*P.smoothstep(i,25,60),d=P.degToRad(i*n);return{x:Math.sin(d)*l*r,y:-Math.cos(d)*l*r,round:!!s}}),a=o(1),e=o(-1).slice(1).reverse();return[...a,{x:0,y:.07,round:!0},...e]},Dn=t=>{const o=new Path2D,a=(e,n)=>({x:(e.x+n.x)/2,y:(e.y+n.y)/2});o.moveTo(t[0].x,t[0].y);for(let e=1;e<t.length;e++){const n=t[e];if(!n.round){o.lineTo(n.x,n.y);continue}const i=a(t[e-1],n),l=a(n,t[(e+1)%t.length]);o.lineTo(i.x,i.y),o.quadraticCurveTo(n.x,n.y,l.x,l.y)}return o.closePath(),o};function ao(t,o,a,e,n,i,l=0){const s=Math.round(i*255);t.save(),t.translate(o,a),t.rotate(n),t.scale(e,e),t.lineCap="round",t.strokeStyle=`rgb(150, ${s}, 0)`,t.lineWidth=.05,t.beginPath(),t.moveTo(0,0),t.quadraticCurveTo(.03,.3,-.03,.6),t.stroke();const r=t.createRadialGradient(0,0,0,0,0,1);r.addColorStop(0,`rgb(214, ${s}, 0)`),r.addColorStop(1,`rgb(250, ${s}, 0)`),t.fillStyle=r,t.fill(Dn(kn(l))),t.strokeStyle=`rgb(178, ${s}, 0)`,t.lineWidth=.03,t.beginPath();for(const[d,m]of Ln){const p=P.degToRad(d);t.moveTo(0,0),t.lineTo(Math.sin(p)*m*.86,-Math.cos(p)*m*.86)}t.stroke(),t.restore()}const no=t=>({x:t%2*me,y:ct-(Math.floor(t/2)+1)*me}),No=(t,o,a,e,n)=>{const i=no(o),l=i.x+me*.5,s=i.y+me*.8;a.forEach(r=>{const d=e*.5;ao(t,l+Math.sin(r)*d,s-Math.cos(r)*d,e,r+(n()-.5)*.2,n(),(n()-.5)*.16)})};function Pn(){const t=document.createElement("canvas");t.width=t.height=ct;const o=t.getContext("2d"),a=ve(5),e=no(0);ao(o,e.x+me*.5,e.y+me*.62,me*.58,0,a()),No(o,1,[-.55,.5],me*.36,a),No(o,2,[-.8,.02,.78],me*.32,a);const n=no(3);ao(o,n.x+me*.5,n.y+me*.6,me*.48,.18,a(),.08);const i=new io(t);return i.colorSpace=ro,i.minFilter=Ct,i.anisotropy=4,i.needsUpdate=!0,i}const Rt={size:512,tiles:4},se=Rt.size/2,Rn=[[-26,11.5,9],[6,12.8,11],[27,9.5,13],[-58,10.5,12],[52,11.5,11]],He=380,ft=(t,o)=>{let a=Math.imul(t,374761393)^Math.imul(o,668265263);return a=Math.imul(a^a>>>13,1274126177),((a^a>>>16)>>>0)/4294967296},jt=(t,o)=>{const a=Math.floor(t),e=Math.floor(o),n=t-a,i=o-e,l=n*n*(3-2*n),s=i*i*(3-2*i),r=ft(a,e),d=ft(a+1,e),m=ft(a,e+1),p=ft(a+1,e+1);return r+(d-r)*l+(m-r)*s+(r-d-m+p)*l*s},Cn=(t,o)=>.5*jt(t/14,o/14)+.3*jt(t/6+7,o/6)+.2*jt(t/2.5,o/2.5+3);function Fn(t,o,a,e,n){const i=a+se*.5,l=e+se*.54,s=se*(.25+.04*n()),r=se*(.22+.04*n()),d=[n()*6,n()*6],m=c=>1+.12*Math.sin(2*c+d[0])+.08*Math.sin(3*c+d[1]),p=o.createLinearGradient(a+se*.25,e+se*.25,a+se*.75,e+se*.8);p.addColorStop(0,"rgb(226, 226, 226)"),p.addColorStop(1,"rgb(178, 178, 178)"),o.fillStyle=p,o.fillRect(a,e,se,se);const f=(c,v,g,y,E)=>{const M=t.createRadialGradient(c,v,0,c,v,g);[1,.88,.56,.19,0].forEach((T,S)=>M.addColorStop(S/4,`rgba(255, 255, 255, ${y*T})`)),t.fillStyle=M,t.beginPath(),t.arc(c,v,g,0,Math.PI*2),t.fill();const b=o.createRadialGradient(c-g*.3,v-g*.35,0,c-g*.15,v-g*.2,g);[1,.65,.25,0].forEach((T,S)=>b.addColorStop(S/3,`rgba(255, 255, 255, ${E*T})`)),o.fillStyle=b,o.beginPath(),o.arc(c,v,g,0,Math.PI*2),o.fill()},h=(c,v,g,y)=>{let E=n()*Math.PI*2;Math.sin(E)>.2&&n()<.7&&(E=-E);const M=(c[0]+(c[1]-c[0])*n())*m(E);f(i+Math.cos(E)*s*M,l+Math.sin(E)*r*M,se*(v[0]+(v[1]-v[0])*n()),g,y)};for(let c=0;c<3;c++)f(i+(n()-.5)*s*1.2,l+r*(.4+.15*n()),se*(.15+.05*n()),.5,.15);for(let c=0,v=5+Math.floor(n()*3);c<v;c++){const g=n()*Math.PI*2,y=.45*Math.sqrt(n());f(i+Math.cos(g)*s*y,l+Math.sin(g)*r*y-r*.1,se*(.19+.06*n()),.85,.55)}for(let c=0,v=10+Math.floor(n()*5);c<v;c++)h([.55,.82],[.1,.15],.75,.8);for(let c=0,v=12+Math.floor(n()*7);c<v;c++)h([.82,1],[.04,.07],.6,.7);for(let c=0;c<30;c++)h([.9,1.15],[.025,.05],.22,.4)}function _n(){const t=Rt.size,o=p=>{const f=document.createElement("canvas");f.width=f.height=t;const h=f.getContext("2d",{willReadFrequently:!0});return h.fillStyle=p,h.fillRect(0,0,t,t),h},a=o("#000"),e=o("#000"),n=ve(53);for(let p=0;p<Rt.tiles;p++)Fn(a,e,p%2*se,Math.floor(p/2)*se,n);const i=a.getImageData(0,0,t,t).data,l=e.getImageData(0,0,t,t).data,s=new Uint8Array(t*t*2),{smoothstep:r,lerp:d}=P;for(let p=0;p<t;p++)for(let f=0;f<t;f++){const h=(p*t+f)*4,c=((t-1-p)*t+f)*2;let v=r(i[h]/255,.04,.95),g=l[h]/255;if(v>0){const y=Cn(f,p);v*=d(.25+.75*y,1,r(v,.45,.95)),g+=(y-.5)*.05}s[c]=Math.round(P.clamp(g,0,1)*255),s[c+1]=Math.round(v*255)}const m=new Ca(s,t,t,Fa,_a);return m.minFilter=Ct,m.magFilter=Oa,m.generateMipmaps=!0,m.needsUpdate=!0,m}function On(){const t=ve(59),o=new x(-B.z,0,B.x),a=[];for(const[r,d,m]of Rn){const p=P.degToRad,f=Y.clone().addScaledVector(B,He).addScaledVector(o,Math.tan(p(r))*He).setY(Y.y+Math.tan(p(d))*He),h=Math.tan(p(m))*He,c=m>=11?3:2,v=[];for(let y=0;y<c;y++){const E=(y/(c-1)-.5)*h*(c===2?.3:.5)+(t()-.5)*h*.06,M=1-(E/(h*.5))**2,b=h*.5*(.45+.55*M);for(let T=0,S=6+Math.round(t()*4);T<S;T++){const D=.25+t(),F=b*(.22*D+.12*(t()-.3));v.push({centre:f,offset:new x().addScaledVector(o,E+(t()-.5)*b*.4).setY(F).addScaledVector(B,(t()-.5)*b*.8),size:b*D,turn:t()*Math.PI*2,spin:(t()<.5?-1:1)*(.012+.03*t()),tile:Math.floor(t()*Rt.tiles),height:F})}}const g=Math.max(...v.map(y=>y.height));for(const y of v)y.height/=g;a.push(...v)}a.sort((r,d)=>d.centre.clone().add(d.offset).distanceTo(Y)-r.centre.clone().add(r.offset).distanceTo(Y));const e=[],n=[],i=[],l=[];for(const r of a)e.push(r.centre.x,r.centre.y,r.centre.z),n.push(r.offset.x,r.offset.y,r.offset.z),i.push(r.size,r.turn,r.spin,r.tile),l.push(r.height);const s=new rt;return s.setAttribute("position",new pe([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0],3)),s.setIndex([0,1,2,0,2,3]),s.setAttribute("aCloud",new J(new Float32Array(e),3)),s.setAttribute("aOffset",new J(new Float32Array(n),3)),s.setAttribute("aPuff",new J(new Float32Array(i),4)),s.setAttribute("aHeight",new J(new Float32Array(l),1)),s.instanceCount=a.length,s.boundingSphere=new lt(Y.clone(),He*2),s}const Gt={right:new x(-B.z,0,B.x),span:Math.tan(P.degToRad(70))*He,speed:.6},mo=`
  uniform float uTime;
  uniform float uGust;

  vec3 sway(vec3 p) {
    float h = clamp(p.y / 10.0, 0.0, 1.2);
    // The whole tree leans downwind as a gust builds, and rocks gently about that lean.
    float rock = sin(uTime * 0.83) * 0.55 + sin(uTime * 1.37 + 1.9) * 0.3 + sin(uTime * 2.11 + 0.7) * 0.15;
    float lean = uGust * 0.22 + (0.07 + 0.09 * uGust) * rock;
    vec3 d = vec3(lean, 0.0, -0.18 * lean) * h * h;
    // Limbs and leaf masses: quicker, smaller, and out of step across the crown.
    float reach = clamp(length(p.xz) / 4.0, 0.0, 1.3);
    float phase = dot(p, vec3(0.73, 0.41, 0.57));
    float amp = (0.05 + 0.075 * uGust) * (0.35 + reach) * h;
    d.x += amp * sin(uTime * 2.4 + phase);
    d.y += amp * 0.55 * sin(uTime * 3.1 + phase * 1.31 + 0.8);
    d.z += amp * 0.6 * sin(uTime * 2.0 + phase * 0.77 + 2.1);
    return d;
  }
`,jo=P.clamp,fo=(t,o,a,e=new x)=>{const n=jo(t.y/10,0,1.2),i=Math.sin(o*.83)*.55+Math.sin(o*1.37+1.9)*.3+Math.sin(o*2.11+.7)*.15,l=a*.22+(.07+.09*a)*i;e.set(l,0,-.18*l).multiplyScalar(n*n);const s=jo(Math.hypot(t.x,t.z)/4,0,1.3),r=t.x*.73+t.y*.41+t.z*.57,d=(.05+.075*a)*(.35+s)*n;return e.x+=d*Math.sin(o*2.4+r),e.y+=d*.55*Math.sin(o*3.1+r*1.31+.8),e.z+=d*.6*Math.sin(o*2+r*.77+2.1),e},Go=t=>t*t*(3-2*t),Ut=(t,[o,a])=>o+(a-o)*t();class In{constructor(o){this.rand=o,this.time=0,this.level=0,this.nextAt=Ce.firstGust,this.onGust=null,this.carrying=!1,this.held=!1,this.start=-1,this.from=0,this.hold=2,this.peak=1}get blowing(){return this.start>=0}trigger(){this.begin()}update(o){if(this.time+=o,this.held&&this.start<0&&(this.nextAt=Math.max(this.nextAt,this.time+Ce.afterHold)),this.start<0&&this.time>=this.nextAt&&this.begin(),this.start<0){this.level=0;return}const a=this.time-this.start,{rise:e,fall:n}=Ce;let i;a<e?i=this.from+(1-this.from)*Go(a/e):a<e+this.hold?i=1:a<e+this.hold+n?i=1-Go((a-e-this.hold)/n):(i=0,this.start=-1,this.nextAt=this.time+Ut(this.rand,Ce.calm)),this.level=i*this.peak}begin(){var o;this.peak=Ut(this.rand,Ce.strength),this.from=Math.min(1,this.level/this.peak),this.hold=Ut(this.rand,Ce.hold),this.start=this.time,(o=this.onGust)==null||o.call(this,this.peak)}}const q=(t,o=new x)=>{const a=new Na;return a.setStyle(t,ja),o.set(a.r,a.g,a.b)},Ye=t=>t.map(o=>q(o)),Nn=(t,o)=>{const a=P.degToRad(t+uo),e=P.degToRad(o);return new x(Math.sin(a)*Math.cos(e),Math.sin(e),-Math.cos(a)*Math.cos(e))},jn=(t,o)=>{const a=ta[t];return{uTime:{value:0},uGust:{value:0},uSun:{value:new x(...La).normalize()},uCastSun:{value:new x(...Ea).normalize()},uLobes:{value:Array.from({length:kt},()=>new Dt(0,-1e4,0,.001))},uLeaf:{value:Ye(a.leaf)},uLeafAlt:{value:Ye(a.leafAlt)},uGrass:{value:Ye(a.grass)},uGrassPatch:{value:q(a.grassPatch)},uGrove:{value:Ye(a.grove)},uDusk:{value:o?1:0},uMoonlight:{value:q(ne.moonlight)},uMoonDir:{value:Nn(ne.moon.az,ne.moon.el)},uSheen:{value:q(ne.moon.sheen)},uHaze:{value:q(te.haze)},uDuskHaze:{value:q(ne.haze)}}},Oe=`
  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
  float noise2(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x),
               mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm2(vec2 p) {
    float s = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      s += a * noise2(p);
      p = p * 2.03 + 17.1;
      a *= 0.5;
    }
    return s / 0.9375;
  }
  float hash13(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.zyx + 31.32);
    return fract((p.x + p.y) * p.z);
  }
  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash13(i), hash13(i + vec3(1, 0, 0)), u.x), mix(hash13(i + vec3(0, 1, 0)), hash13(i + vec3(1, 1, 0)), u.x), u.y),
      mix(mix(hash13(i + vec3(0, 0, 1)), hash13(i + vec3(1, 0, 1)), u.x), mix(hash13(i + vec3(0, 1, 1)), hash13(i + vec3(1, 1, 1)), u.x), u.y),
      u.z);
  }
`,po=`
  float gustWave(vec2 p) {
    return smoothstep(0.55, 0.92, noise2(vec2((p.x - uTime * 3.4) * 0.16, p.y * 0.05 + 3.0))) * uGust;
  }
`,Gn=`
  #define RIVER_POINTS ${Ve.points.length}
  uniform vec2 uRiver[RIVER_POINTS];
  uniform vec4 uRiverBox;
  uniform vec4 uRiverRing;
  uniform vec2 uRiverWidth;
  uniform float uRiverLevel;

  vec2 riverAt(vec2 p) {
    float best = 1e9;
    float along = 0.0;
    for (int i = 0; i < RIVER_POINTS - 1; i++) {
      vec2 a = uRiver[i];
      vec2 ab = uRiver[i + 1] - a;
      float t = clamp(dot(p - a, ab) / dot(ab, ab), 0.0, 1.0);
      float d = length(p - a - ab * t);
      if (d < best) {
        best = d;
        along = (float(i) + t) / float(RIVER_POINTS - 1);
      }
    }
    return vec2(best, along);
  }
`,De=`
  vec3 ramp(float x, vec3 c0, vec3 c1, vec3 c2, vec3 c3) {
    vec3 c = mix(c0, c1, smoothstep(0.2, 0.3, x));
    c = mix(c, c2, smoothstep(0.46, 0.56, x));
    return mix(c, c3, smoothstep(0.78, 0.88, x));
  }
`,Ee=`
  uniform float uDusk;
  uniform vec3 uMoonlight;
  uniform vec3 uSheen;
  uniform vec3 uHaze;
  uniform vec3 uDuskHaze;

  float duskLight(float L) {
    return L - 0.25 * uDusk * smoothstep(0.45, 1.0, L);
  }
  vec3 duskTone(vec3 col) {
    return col * mix(vec3(1.0), uMoonlight, uDusk);
  }
  vec3 haze() {
    return mix(uHaze, uDuskHaze, uDusk);
  }
`,Xe=`
  #define MAX_LOBES ${kt}
  uniform vec3 uSun;
  uniform vec3 uMoonDir;
  uniform vec4 uLobes[MAX_LOBES];

  // How far the masses stand between p and a light that way: 0 open to it, 1 behind one.
  float lobeCover(vec3 p, float self, vec3 dir) {
    float cover = 0.0;
    for (int i = 0; i < MAX_LOBES; i++) {
      if (abs(float(i) - self) < 0.5) continue;
      vec4 b = uLobes[i];
      vec3 oc = b.xyz - p;
      float t = dot(oc, dir);
      if (t <= 0.0) continue;
      float miss = length(oc - dir * t) / b.w;
      cover = max(cover, 1.0 - smoothstep(0.62, 0.96, miss));
    }
    return cover;
  }

  float lobeShadow(vec3 p, float self) {
    return 1.0 - 0.78 * lobeCover(p, self, uSun);
  }

  float moonLight(vec3 n, vec3 p, float self) {
    return smoothstep(0.0, 0.85, dot(n, uMoonDir)) * (1.0 - lobeCover(p, self, uMoonDir));
  }
`,vo=`
  uniform vec3 uCastSun;
  uniform vec3 uShadowCentre;
  uniform float uShadowReach;

  float crownShadow(vec2 xz) {
    vec2 rel = xz - uShadowCentre.xz;
    if (dot(rel, rel) > uShadowReach * uShadowReach) return 0.0;
    vec3 q = vec3(xz.x, 0.0, xz.y);
    float edge = (noise2(xz * 2.4) - 0.5) * 0.16 + (noise2(xz * 6.3 + 4.1) - 0.5) * 0.07;
    float cover = 0.0;
    for (int i = 0; i < MAX_LOBES; i++) {
      vec4 b = uLobes[i];
      vec3 oc = b.xyz - q;
      float t = dot(oc, uCastSun);
      if (t <= 0.0) continue;
      float miss = length(oc - uCastSun * t) / b.w + edge;
      cover = max(cover, 1.0 - smoothstep(0.84, 0.9, miss));
    }
    return cover;
  }

  float dapple(vec2 xz) {
    vec2 g = xz / 0.55;
    vec2 cell = floor(g);
    float h = hash12(cell);
    if (h > 0.42) return 0.0;
    vec2 at = 0.22 + 0.56 * vec2(hash12(cell + 7.1), hash12(cell + 3.7));
    float r = (0.08 + 0.1 * hash12(cell + 1.3)) * (0.9 + 0.1 * sin(uTime * 2.2 + h * 40.0));
    return 1.0 - smoothstep(r - 0.03, r, length(fract(g) - at));
  }

  float groundShade(vec2 xz) {
    float shade = crownShadow(xz);
    return shade * (1.0 - 0.85 * dapple(xz) * smoothstep(0.5, 1.0, shade));
  }

  // How much light the grass gets. The hills are gentle and the sun is high,
  // so every slope meets it at much the same angle: stretch what difference
  // there is, so a slope turned toward the sun reads lighter than one turned
  // away — but keep that within the light tones, so only a real shadow is
  // ever painted dark.
  float grassLight(vec3 normal, float shade) {
    float form = smoothstep(0.45, 1.0, dot(normalize(normal), uSun));
    return mix(mix(0.56, 0.9, form), 0.36, 0.8 * shade);
  }
`;function Un(t,o){return new le({uniforms:{...t,uAtlas:{value:o}},side:_e,vertexShader:`
      attribute vec3 aCenter;
      attribute vec3 aNormal;
      attribute vec4 aLeaf;  // size, roll, a random number, atlas tile
      attribute vec3 aShade; // ambient occlusion, which mass, which clump
      uniform float uDusk;
      ${mo}
      ${Xe}
      varying vec2 vUv;
      varying vec3 vLight;
      varying float vRand;
      varying float vClump;
      varying float vMoon;

      void main() {
        vec3 c = aCenter + sway(aCenter);
        // Each card flutters a little about its own centre, more as a gust blows,
        // in step with its neighbours.
        float wave = uTime * (3.2 + aLeaf.z * 0.6) + dot(aCenter, vec3(1.3, 0.9, 1.1)) + aLeaf.z * 1.5;
        float roll = aLeaf.y + sin(wave) * (0.05 + 0.2 * uGust);
        vec2 corner = position.xy;
        vec4 mv = modelViewMatrix * vec4(c, 1.0);
        mv.xy += mat2(cos(roll), sin(roll), -sin(roll), cos(roll)) * corner * aLeaf.x;
        gl_Position = projectionMatrix * mv;

        vUv = (vec2(mod(aLeaf.w, 2.0), floor(aLeaf.w / 2.0)) + corner + 0.5) * 0.5;
        vLight = vec3(dot(aNormal, uSun), lobeShadow(c, aShade.y), aShade.x);
        vRand = aLeaf.z;
        vClump = aShade.z;
        // In the evening, the moon's light on the near side of the crown; less deep among the leaves.
        vMoon = 0.0;
        if (uDusk > 0.0) vMoon = uDusk * aShade.x * moonLight(aNormal, c, aShade.y);
      }
    `,fragmentShader:`
      uniform sampler2D uAtlas;
      uniform vec3 uLeaf[4];
      uniform vec3 uLeafAlt[4];
      varying vec2 vUv;
      varying vec3 vLight;
      varying float vRand;
      varying float vClump;
      varying float vMoon;
      ${De}
      ${Ee}

      void main() {
        vec4 tex = texture2D(uAtlas, vUv);
        vec2 texel = vUv * ${ct.toFixed(1)};
        float mip = max(0.0, 0.5 * log2(max(dot(dFdx(texel), dFdx(texel)), dot(dFdy(texel), dFdy(texel)))));
        if (tex.a * (1.0 + mip * 0.22) < 0.5) discard;

        float direct = clamp((vLight.x + 0.45) / 1.45, 0.0, 1.0) * mix(0.25, 1.0, vLight.y);
        float L = mix(0.2, 1.0, direct) * mix(0.3, 1.0, vLight.z);
        // No two leaves quite alike: a nudge per card, and per leaf within it.
        float id = tex.g;
        L += (id - 0.5) * 0.09 + (vRand - 0.5) * 0.06;
        L = duskLight(L * (0.55 + 0.47 * tex.r));
        float hue = smoothstep(0.5, 0.9, fract(id * 3.7 + vRand * 1.3));
        vec3 col = mix(ramp(L, uLeaf[0], uLeaf[1], uLeaf[2], uLeaf[3]),
                       ramp(L, uLeafAlt[0], uLeafAlt[1], uLeafAlt[2], uLeafAlt[3]), hue);
        // Where the moon catches them, the same colours in a little more light, touched with its pale cool.
        col = mix(duskTone(col) * (1.0 + 0.3 * vMoon), uSheen, 0.06 * vMoon);
        // Which clump this is, in alpha, for the ink pass: leaves are even numbers, anything else 255.
        gl_FragColor = vec4(col, (vClump + 1.0) * 2.0 / 255.0);
      }
    `})}function Wn(t){return new le({uniforms:{...t},vertexShader:`
      ${mo}
      varying vec3 vWorld;
      varying vec3 vNormal;

      void main() {
        vec3 centre = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
        vWorld = (instanceMatrix * vec4(position, 1.0)).xyz + sway(centre);
        vNormal = normalize(mat3(instanceMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
      }
    `,fragmentShader:`
      uniform vec3 uLeaf[4];
      varying vec3 vWorld;
      varying vec3 vNormal;
      ${Oe}
      ${Xe}
      ${De}
      ${Ee}

      void main() {
        float direct = clamp((dot(normalize(vNormal), uSun) + 0.45) / 1.45, 0.0, 1.0) * mix(0.25, 1.0, lobeShadow(vWorld, -1.0));
        // Deep in the crown it's all shade, broken up a little like leaves.
        float L = duskLight(mix(0.2, 1.0, direct) * 0.5 * (0.85 + 0.3 * noise3(vWorld * 2.5)));
        gl_FragColor = vec4(duskTone(ramp(L, uLeaf[0], uLeaf[1], uLeaf[2], uLeaf[3])), 1.0);
      }
    `})}function Bn(t,o){return new le({uniforms:{...t,uAtlas:{value:o},uTint:{value:0},uShadow:{value:1},uBend:{value:.35},uFlutter:{value:0},uSeed:{value:0}},side:_e,vertexShader:`
      uniform float uTime;
      uniform float uBend;
      uniform float uFlutter;
      uniform float uSeed;
      varying vec2 vUv;
      varying vec3 vNormalW;

      void main() {
        vec3 p = position;
        // Cupped along the midrib, and rippling as it's buffeted.
        float k = uBend;
        float ripple = sin(uTime * 9.0 + uSeed * 20.0 + p.y * 5.0) * 0.06 * uFlutter;
        p.z += k * p.x * p.x + ripple * (p.y + 0.5);
        vec3 n = normalize(vec3(-2.0 * k * p.x, -0.3 * ripple, 1.0));
        vNormalW = normalize(mat3(modelMatrix) * n);
        vUv = uv * 0.5;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,fragmentShader:`
      uniform sampler2D uAtlas;
      uniform vec3 uSun;
      uniform vec3 uLeaf[4];
      uniform vec3 uLeafAlt[4];
      uniform float uTint;
      uniform float uShadow;
      varying vec2 vUv;
      varying vec3 vNormalW;
      ${De}
      ${Ee}

      void main() {
        vec4 tex = texture2D(uAtlas, vUv);
        vec2 texel = vUv * ${ct.toFixed(1)};
        float mip = max(0.0, 0.5 * log2(max(dot(dFdx(texel), dFdx(texel)), dot(dFdy(texel), dFdy(texel)))));
        if (tex.a * (1.0 + mip * 0.22) < 0.5) discard;
        vec3 n = normalize(vNormalW) * (gl_FrontFacing ? 1.0 : -1.0);
        float ndl = dot(n, uSun);
        // A leaf is thin: sun on one face shows through the other. Out in the
        // open the whole bright sky lights it too, so it never goes dark.
        float direct = clamp(max(ndl, -ndl * 0.45), 0.0, 1.0) * mix(0.3, 1.0, uShadow);
        float L = duskLight(mix(0.46, 1.02, direct) * (0.55 + 0.47 * tex.r));
        vec3 col = mix(ramp(L, uLeaf[0], uLeaf[1], uLeaf[2], uLeaf[3]),
                       ramp(L, uLeafAlt[0], uLeafAlt[1], uLeafAlt[2], uLeafAlt[3]), uTint);
        // The underside is paler.
        if (!gl_FrontFacing) col = mix(col, uLeafAlt[3], 0.14);
        gl_FragColor = vec4(duskTone(col), 1.0);
      }
    `})}function Hn(t){return new le({uniforms:{...t,uBark:{value:Ye(te.bark)}},vertexShader:`
      attribute vec2 aBark;
      ${mo}
      varying vec3 vWorld;
      varying vec3 vNormal;
      varying vec2 vBark;

      void main() {
        vec4 w = modelMatrix * vec4(position + sway(position), 1.0);
        vWorld = w.xyz;
        vNormal = normalize(mat3(modelMatrix) * normal);
        vBark = aBark;
        gl_Position = projectionMatrix * viewMatrix * w;
      }
    `,fragmentShader:`
      uniform float uTime;
      uniform vec3 uBark[4];
      varying vec3 vWorld;
      varying vec3 vNormal;
      varying vec2 vBark;
      ${Oe}
      ${Xe}
      ${De}
      ${Ee}

      void main() {
        vec3 n = normalize(vNormal);
        float direct = clamp((dot(n, uSun) + 0.3) / 1.3, 0.0, 1.0);
        float sh = lobeShadow(vWorld, -1.0);
        // Flecks of sun that find their way down through the leaves.
        float fleck = smoothstep(0.72, 0.82, noise3(vWorld * 9.0 + vec3(uTime * 0.35, 0.0, uTime * 0.1)));
        sh = max(sh, fleck * 0.45);
        float L = mix(0.22, 1.0, direct * sh);
        // Bark runs in long ridges up the trunk and along every limb.
        L *= 0.86 + 0.26 * noise2(vec2(vBark.y * 24.0, vBark.x * 1.7));
        // Darker where the roots go into the grass.
        L *= mix(0.6, 1.0, smoothstep(-0.15, 0.7, vWorld.y));
        // In the evening, the moon's light on the near side of the trunk and the limbs.
        float moon = 0.0;
        if (uDusk > 0.0) moon = uDusk * moonLight(n, vWorld, -1.0);
        vec3 col = duskTone(ramp(duskLight(L), uBark[0], uBark[1], uBark[2], uBark[3])) * (1.0 + 0.25 * moon);
        gl_FragColor = vec4(mix(col, uSheen, 0.06 * moon), 1.0);
      }
    `})}function $n(t,o,a){return new le({uniforms:{...t,uRiver:{value:Ve.points},uRiverBox:{value:Ve.box},uRiverRing:{value:Ve.ring},uRiverWidth:{value:new j(...ho)},uRiverLevel:{value:Ve.level},uWater:{value:te.water.map(e=>q(e))},uDuskWater:{value:ne.water.map(e=>q(e))},uShadowCentre:{value:o},uShadowReach:{value:a}},vertexShader:`
      varying vec3 vWorld;
      varying vec3 vNormal;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vWorld = w.xyz;
        vNormal = normal;
        gl_Position = projectionMatrix * viewMatrix * w;
      }
    `,fragmentShader:`
      uniform float uTime;
      uniform float uGust;
      uniform vec3 uGrass[4];
      uniform vec3 uGrassPatch;
      uniform vec3 uWater[3];
      uniform vec3 uDuskWater[3];
      varying vec3 vWorld;
      varying vec3 vNormal;
      ${Oe}
      ${po}
      ${Xe}
      ${vo}
      ${Gn}
      ${De}
      ${Ee}

      void main() {
        float shade = groundShade(vWorld.xz);
        float foot = smoothstep(0.4, 1.8, length(vWorld.xz));
        float wave = gustWave(vWorld.xz);

        float L = grassLight(vNormal, shade) * mix(0.72, 1.0, foot);
        float dist = distance(vWorld, cameraPosition);
        float mottle = fbm2(vWorld.xz * 0.09);
        L = duskLight(L + (mottle - 0.5) * 0.09 + wave * 0.12);

        vec3 col = ramp(L, uGrass[0], uGrass[1], uGrass[2], uGrass[3]);
        col = mix(col, uGrassPatch, smoothstep(0.55, 0.8, mottle) * 0.3 * (1.0 - shade));
        col = duskTone(col);

        // The river: water where it runs, a darker line of bank either side, and
        // a glint of sky down its middle — only on the level plain, never up a slope.
        float away = distance(vWorld.xz, uRiverRing.xy);
        if (away > uRiverRing.z && away < uRiverRing.w &&
            all(greaterThan(vWorld.xz, uRiverBox.xy)) && all(lessThan(vWorld.xz, uRiverBox.zw))) {
          vec2 r = riverAt(vWorld.xz);
          float across = mix(uRiverWidth.y, uRiverWidth.x, r.y);
          float level = 1.0 - smoothstep(uRiverLevel + 0.3, uRiverLevel + 0.7, vWorld.y);
          float edge = max(fwidth(r.x), 0.05);
          float bank = (1.0 - smoothstep(0.0, max(0.6, edge * 1.5), abs(r.x - across - 0.35))) * level;
          col = mix(col, col * 0.72, bank * 0.7);
          float water = (1.0 - smoothstep(across - edge, across + edge, r.x)) * level;
          // At night it mirrors the night's sky instead of the day's.
          vec3 wet = mix(mix(uWater[0], uDuskWater[0], uDusk), mix(uWater[1], uDuskWater[1], uDusk), smoothstep(0.0, 0.7, 1.0 - r.x / across));
          wet = mix(wet, mix(uWater[2], uDuskWater[2], uDusk), (1.0 - smoothstep(0.0, across * 0.3, r.x)) * 0.55);
          col = mix(col, wet, water);
        }
        col = mix(col, haze(), smoothstep(30.0, 220.0, dist) * 0.62);
        gl_FragColor = vec4(col, 1.0);
      }
    `})}function Vn(t,o,a,e){return new le({uniforms:{...t,uAtlas:{value:o},uShadowCentre:{value:a},uShadowReach:{value:e}},side:_e,vertexShader:`
      attribute vec3 aBase;
      attribute vec3 aNormal;
      attribute vec4 aTuft; // height, atlas cell, a random number, width
      uniform float uTime;
      uniform float uGust;
      ${Oe}
      ${po}
      ${Xe}
      ${vo}
      varying vec2 vUv;
      varying float vLight;
      varying float vHaze;
      varying float vRand;

      void main() {
        vec3 toEye = cameraPosition - aBase;
        vec3 right = normalize(vec3(toEye.z, 0.0, -toEye.x));
        float h = aTuft.x;
        vec2 c = position.xy;
        float wave = gustWave(aBase.xz);
        float bend = 0.06 + 0.04 * sin(uTime * 1.9 + aBase.x * 0.35 + aBase.z * 0.2) + 0.1 * uGust + 0.45 * wave;
        vec3 p = aBase + right * c.x * h * aTuft.w + vec3(0.0, c.y * h, 0.0);
        p.x += bend * h * c.y * c.y;
        p.y -= 0.3 * bend * bend * h * c.y;
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
        vUv = vec2((aTuft.y + c.x + 0.5) / ${Tt.tufts.toFixed(1)}, c.y);

        vLight = grassLight(aNormal, groundShade(aBase.xz)) + 0.12 * wave;
        vHaze = smoothstep(30.0, 220.0, distance(aBase, cameraPosition)) * 0.62;
        vRand = aTuft.z;
      }
    `,fragmentShader:`
      uniform sampler2D uAtlas;
      uniform vec3 uGrass[4];
      varying vec2 vUv;
      varying float vLight;
      varying float vHaze;
      varying float vRand;
      ${De}
      ${Ee}

      void main() {
        vec4 tex = texture2D(uAtlas, vUv);
        vec2 texel = vUv * vec2(${Tt.width.toFixed(1)}, ${Tt.height.toFixed(1)});
        float mip = max(0.0, 0.5 * log2(max(dot(dFdx(texel), dFdx(texel)), dot(dFdy(texel), dFdy(texel)))));
        if (tex.a * (1.0 + mip * 0.3) < 0.5) discard;
        float L = duskLight(vLight + (tex.r - 0.65) * 0.5 + (tex.g - 0.5) * 0.08 + (vRand - 0.5) * 0.06);
        vec3 col = mix(duskTone(ramp(L, uGrass[0], uGrass[1], uGrass[2], uGrass[3])), haze(), vHaze);
        gl_FragColor = vec4(col, 1.0);
      }
    `})}function Yn(t,o,a,e){return new le({uniforms:{...t,uAtlas:{value:o},uPetal:{value:te.petal.flat().map(n=>q(n))},uEye:{value:te.daisyEye.map(n=>q(n))},uShadowCentre:{value:a},uShadowReach:{value:e},uSwayShare:{value:1}},side:_e,vertexShader:`
      attribute vec3 aBase;
      attribute vec3 aNormal;
      attribute vec4 aFlower; // height, atlas tile, a random number, width
      attribute float aSway;  // 1 for a daisy that sways, 0 for one that stands still
      attribute float aPetal; // its petals: 0 white, 1 pink, 2 yellow
      uniform vec3 uPetal[${te.petal.length*2}]; // each colour in shade, then in sun
      uniform float uTime;
      uniform float uGust;
      // Of the daisies that sway, the share still swaying: all at home, a few beside a pane. Each eases to a stand
      // as the share passes its random number, so the field calms a flower at a time rather than all at once.
      uniform float uSwayShare;
      ${Oe}
      ${po}
      ${Xe}
      ${vo}
      varying vec2 vUv;
      varying float vLight;
      varying float vHaze;
      varying vec3 vPetalShade;
      varying vec3 vPetalSun;

      void main() {
        int k = int(aPetal + 0.5) * 2;
        vPetalShade = uPetal[k];
        vPetalSun = uPetal[k + 1];
        vec3 toEye = cameraPosition - aBase;
        vec3 right = normalize(vec3(toEye.z, 0.0, -toEye.x));
        float h = aFlower.x;
        vec2 c = position.xy;
        float wave = gustWave(aBase.xz);
        float sways = aSway * (1.0 - smoothstep(uSwayShare, uSwayShare + 0.03, aFlower.z));
        float bend = sways * (0.07 * sin(uTime * 2.3 + aFlower.z * 9.0 + aBase.x * 0.4) + 0.08 * uGust + 0.4 * wave);
        vec3 p = aBase + right * c.x * h * aFlower.w + vec3(0.0, c.y * h, 0.0);
        p.x += bend * h * c.y * c.y;
        p.y -= 0.3 * bend * bend * h * c.y;
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
        vUv = vec2((aFlower.y + c.x + 0.5) / ${ze.tiles.toFixed(1)}, c.y);
        vLight = grassLight(aNormal, groundShade(aBase.xz)) + 0.1 * wave;
        vHaze = smoothstep(30.0, 220.0, distance(aBase, cameraPosition)) * 0.62;
      }
    `,fragmentShader:`
      uniform sampler2D uAtlas;
      uniform vec3 uGrass[4];
      uniform vec3 uEye[2];
      varying vec2 vUv;
      varying float vLight;
      varying float vHaze;
      varying vec3 vPetalShade;
      varying vec3 vPetalSun;
      ${De}
      ${Ee}

      void main() {
        vec4 tex = texture2D(uAtlas, vUv);
        vec2 texel = vUv * vec2(${ze.width.toFixed(1)}, ${ze.height.toFixed(1)});
        float mip = max(0.0, 0.5 * log2(max(dot(dFdx(texel), dFdx(texel)), dot(dFdy(texel), dFdy(texel)))));
        if (tex.a * (1.0 + mip * 0.3) < 0.5) discard;
        float L = duskLight(vLight * (0.6 + 0.45 * tex.r));
        float lit = smoothstep(0.35, 0.8, L);
        vec3 col = tex.g < 0.35 ? ramp(L, uGrass[0], uGrass[1], uGrass[2], uGrass[3])
                 : tex.g < 0.75 ? mix(vPetalShade, vPetalSun, lit)
                 : mix(uEye[0], uEye[1], lit);
        // Flowers are too small to ink: 253 in alpha tells the ink pass to leave them be.
        gl_FragColor = vec4(mix(duskTone(col), haze(), vHaze), 253.0 / 255.0);
      }
    `})}function qn(t,o){return new le({uniforms:{...t,uAtlas:{value:o},uEvergreen:{value:Ye(te.evergreen)}},side:_e,vertexShader:`
      attribute vec3 aBase;
      attribute vec4 aTree; // height, atlas tile, how far it turns with the season, width
      varying vec2 vUv;
      varying float vTurn;
      varying float vHaze;

      void main() {
        vec3 toEye = cameraPosition - aBase;
        vec3 right = normalize(vec3(toEye.z, 0.0, -toEye.x));
        vec2 c = position.xy;
        vec3 p = aBase + right * c.x * aTree.x * aTree.w + vec3(0.0, c.y * aTree.x, 0.0);
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
        vUv = vec2((aTree.y + c.x + 0.5) / ${ye.tiles.toFixed(1)}, c.y);
        vTurn = aTree.z;
        vHaze = smoothstep(30.0, 220.0, distance(aBase, cameraPosition)) * 0.48;
      }
    `,fragmentShader:`
      uniform sampler2D uAtlas;
      uniform vec3 uEvergreen[4];
      uniform vec3 uGrove[4];
      varying vec2 vUv;
      varying float vTurn;
      varying float vHaze;
      ${De}
      ${Ee}

      void main() {
        vec4 tex = texture2D(uAtlas, vUv);
        vec2 texel = vUv * vec2(${ye.width.toFixed(1)}, ${ye.height.toFixed(1)});
        float mip = max(0.0, 0.5 * log2(max(dot(dFdx(texel), dFdx(texel)), dot(dFdy(texel), dFdy(texel)))));
        if (tex.a * (1.0 + mip * 0.25) < 0.5) discard;
        float L = duskLight(0.16 + 0.8 * tex.r);
        vec3 col = mix(ramp(L, uEvergreen[0], uEvergreen[1], uEvergreen[2], uEvergreen[3]),
                       ramp(L, uGrove[0], uGrove[1], uGrove[2], uGrove[3]), smoothstep(0.3, 0.6, vTurn));
        gl_FragColor = vec4(mix(duskTone(col), haze(), vHaze), 1.0);
      }
    `})}function Uo(t,o,a){return new le({uniforms:{...t,uColour:{value:q(o)},uMist:{value:a}},side:_e,vertexShader:`
      varying vec3 vWorld;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vWorld = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }
    `,fragmentShader:`
      uniform vec3 uColour;
      uniform float uMist;
      varying vec3 vWorld;
      ${Ee}
      void main() {
        float m = (1.0 - smoothstep(-6.0, 16.0, vWorld.y)) * uMist;
        gl_FragColor = vec4(mix(duskTone(uColour), haze(), m), 1.0);
      }
    `})}function Xn(t){return new le({uniforms:{uZenith:{value:q(te.skyZenith)},uMid:{value:q(te.skyMid)},uHorizon:{value:q(te.skyHorizon)},uBearing:{value:uo},uDusk:t.uDusk,uDuskSky:{value:ne.sky.map(([,o])=>q(o))},uDuskAt:{value:ne.sky.map(([o])=>o)},uStars:{value:new x(ne.stars.patch,ne.stars.share,ne.stars.light)},uFrom:{value:new x},uAlong:{value:new x},uSide:{value:new x},uFall:{value:new Dt}},side:Ia,depthWrite:!1,vertexShader:`
      varying vec3 vDir;
      void main() {
        vDir = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position.z = gl_Position.w;
      }
    `,fragmentShader:`
      #define DUSK_STOPS ${ne.sky.length}
      uniform vec3 uZenith;
      uniform vec3 uMid;
      uniform vec3 uHorizon;
      uniform float uBearing;
      uniform float uDusk;
      uniform vec3 uDuskSky[DUSK_STOPS];
      uniform float uDuskAt[DUSK_STOPS];
      uniform vec3 uStars; // patch, share, light
      uniform vec3 uFrom;  // where a falling star's line starts, the way it runs, and square off it
      uniform vec3 uAlong;
      uniform vec3 uSide;
      uniform vec4 uFall;  // how far along its head is, in degrees; how long its tail; how bright the tail, and the head
      varying vec3 vDir;
      ${Oe}

      // The star in this patch of sky, if it holds one: set anywhere in the
      // patch but near its edge, its size and brightness its own. In degrees,
      // aa being about a pixel's worth.
      float star(vec2 p, float aa) {
        vec2 cell = floor(p / uStars.x);
        if (hash12(cell) > uStars.y) return 0.0;
        vec2 at = (cell + 0.2 + 0.6 * vec2(hash12(cell + 17.3), hash12(cell + 41.9))) * uStars.x;
        float big = hash12(cell + 73.1);
        float r = mix(0.025, 0.07, big * big);
        return mix(0.35, 1.0, big) * (1.0 - smoothstep(r - aa, r + aa, distance(p, at)));
      }

      void main() {
        vec3 d = normalize(vDir);
        float el = degrees(asin(clamp(d.y, -1.0, 1.0)));
        // Azimuth measured from the shot's own line, so the wash keeps its place in the frame.
        float az = mod(degrees(atan(d.x, -d.z)) - uBearing + 540.0, 360.0) - 180.0;
        // Blue soon after the horizon, so the middle of the frame isn't a white haze.
        vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 9.0, el));
        col = mix(col, uZenith, smoothstep(5.0, 38.0, el));
        // The night's, each colour easing into the next as the sky rises.
        vec3 eve = uDuskSky[0];
        for (int i = 1; i < DUSK_STOPS; i++) eve = mix(eve, uDuskSky[i], smoothstep(uDuskAt[i - 1], uDuskAt[i], el));
        col = mix(col, eve, uDusk);
        // The stars come out once the night has come on: fainter toward the
        // hills, where there's more air to see them through.
        float aa = fwidth(el);
        float stars = star(vec2(az, el), aa) * uStars.z * smoothstep(0.6, 1.0, uDusk) * smoothstep(1.0, 10.0, el);
        col = mix(col, vec3(0.92, 0.94, 1.0), stars);
        // A painted wash is never perfectly even.
        col *= 1.0 + (fbm2(vec2(az, el) * 0.05) - 0.5) * 0.05;
        // A star falling: straight, its tail thinning and dimming away behind a
        // small bright head. In degrees, aa being about a pixel's worth.
        if (uFall.z > 0.0) {
          float s = degrees(atan(dot(d, uAlong), dot(d, uFrom)));
          float off = degrees(asin(clamp(dot(d, uSide), -1.0, 1.0)));
          float k = (uFall.x - s) / uFall.y;
          float taper = clamp(1.0 - k, 0.0, 1.0);
          float wide = aa * (0.35 + 0.75 * taper);
          float line = (1.0 - smoothstep(wide, wide + aa, abs(off))) * smoothstep(0.0, aa, s) * smoothstep(0.0, aa, uFall.x - s);
          float r = length(vec2(s - uFall.x, off)) / (aa * 2.0);
          float light = max(line * taper * taper * uFall.z, exp(-r * r) * uFall.w);
          col = mix(col, vec3(0.94, 0.97, 1.0), clamp(light, 0.0, 1.0) * smoothstep(0.6, 1.0, uDusk));
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `})}function Zn(t,o){return new le({uniforms:{uTime:t.uTime,uDusk:t.uDusk,uAtlas:{value:o},uCloud:{value:q(te.cloud)},uCloudShade:{value:q(te.cloudShade)},uDuskCloud:{value:q(ne.cloud)},uDuskCloudShade:{value:q(ne.cloudShade)},uEye:{value:Y},uDriftRight:{value:Gt.right},uDriftSpan:{value:Gt.span},uDriftSpeed:{value:Gt.speed}},transparent:!0,depthWrite:!1,blending:ia,blendSrc:sa,blendDst:na,blendSrcAlpha:aa,blendDstAlpha:oa,vertexShader:`
      attribute vec3 aCloud;
      attribute vec3 aOffset;
      attribute vec4 aPuff;    // size, angle, how fast it turns, atlas tile
      attribute float aHeight; // 0 at the cloud's base, 1 at its top
      uniform float uTime;
      uniform vec3 uEye;
      uniform vec3 uDriftRight;
      uniform float uDriftSpan;
      uniform float uDriftSpeed;
      varying vec2 vUv;
      varying float vHeight;
      varying float vUp;

      void main() {
        // The cloud drifts across the shot with the wind, and comes round again.
        float across = dot(aCloud - uEye, uDriftRight);
        float drifted = mod(across + uTime * uDriftSpeed + uDriftSpan, 2.0 * uDriftSpan) - uDriftSpan;
        vec4 mv = modelViewMatrix * vec4(aCloud + uDriftRight * (drifted - across) + aOffset, 1.0);
        float turn = aPuff.y + uTime * aPuff.z;
        vec2 off = mat2(cos(turn), sin(turn), -sin(turn), cos(turn)) * position.xy;
        mv.xy += off * aPuff.x;
        gl_Position = projectionMatrix * mv;
        vUv = (vec2(mod(aPuff.w, 2.0), floor(aPuff.w / 2.0)) + position.xy + 0.5) * 0.5;
        vHeight = aHeight;
        vUp = off.y;
      }
    `,fragmentShader:`
      uniform sampler2D uAtlas;
      uniform float uDusk;
      uniform vec3 uCloud;
      uniform vec3 uCloudShade;
      uniform vec3 uDuskCloud;
      uniform vec3 uDuskCloudShade;
      varying vec2 vUv;
      varying float vHeight;
      varying float vUp;

      void main() {
        vec4 tex = texture2D(uAtlas, vUv); // r: how light, g: how much cloud
        float light = smoothstep(0.0, 1.0, 0.14 + 0.55 * vHeight + 0.35 * vUp + (tex.r - 0.84) * 2.6);
        // By night the moon lights them as the sun does by day, only dimmer and bluer.
        vec3 col = mix(mix(uCloudShade, uDuskCloudShade, uDusk), mix(uCloud, uDuskCloud, uDusk), light);
        // A clear sky by night: they're gone by the time the stars come out.
        gl_FragColor = vec4(col, tex.g * 0.8 * (1.0 - smoothstep(0.0, 0.6, uDusk)));
      }
    `})}function Kn(){return new le({uniforms:{uHead:{value:0},uTail:{value:0},uOpacity:{value:0},uWidth:{value:2.6},uRes:{value:new j(1,1)},uColour:{value:q(te.streak)}},transparent:!0,depthWrite:!1,side:_e,blending:ia,blendSrc:sa,blendDst:na,blendSrcAlpha:aa,blendDstAlpha:oa,vertexShader:`
      attribute vec3 aNext;
      attribute float aSide;
      attribute float aU;
      uniform float uHead;
      uniform float uTail;
      uniform float uWidth;
      uniform vec2 uRes;
      varying float vU;
      varying float vSide;

      void main() {
        vec4 c0 = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vec4 c1 = projectionMatrix * modelViewMatrix * vec4(aNext, 1.0);
        vec2 s0 = c0.xy / c0.w * uRes;
        vec2 s1 = c1.xy / c1.w * uRes;
        vec2 t = normalize(s1 - s0 + vec2(1e-5, 0.0));
        float k = clamp((aU - uTail) / max(uHead - uTail, 1e-4), 0.0, 1.0);
        float w = uWidth * pow(sin(3.14159 * k), 0.6) * (0.55 + 0.45 * k);
        c0.xy += vec2(-t.y, t.x) * aSide * w / uRes * c0.w;
        gl_Position = c0;
        vU = aU;
        vSide = aSide;
      }
    `,fragmentShader:`
      uniform float uHead;
      uniform float uTail;
      uniform float uOpacity;
      uniform vec3 uColour;
      varying float vU;
      varying float vSide;

      void main() {
        if (vU > uHead || vU < uTail) discard;
        float edge = 1.0 - smoothstep(0.35, 1.0, abs(vSide));
        gl_FragColor = vec4(uColour, uOpacity * edge);
      }
    `})}const da=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;function Qn(){return new le({uniforms:{tColor:{value:null},tDepth:{value:null},uRes:{value:new j(1,1)},uDpr:{value:1},uNear:{value:.5},uFar:{value:1500},uWeight:{value:1},uThreshold:{value:new j(.01,.05)},uFade:{value:new j(70,260)},uInk:{value:q(te.ink)},uClumpLine:{value:.24},uClumpShadow:{value:.09},uClumpReach:{value:3.5}},depthTest:!1,depthWrite:!1,vertexShader:da,fragmentShader:`
      #include <packing>
      uniform sampler2D tColor;
      uniform sampler2D tDepth;
      uniform vec2 uRes;
      uniform float uDpr;
      uniform float uNear;
      uniform float uFar;
      uniform float uWeight;
      uniform vec2 uThreshold;
      uniform vec2 uFade;
      uniform vec3 uInk;
      uniform float uClumpLine;
      uniform float uClumpShadow;
      uniform float uClumpReach;
      varying vec2 vUv;
      ${Oe}

      float depthAt(vec2 uv) {
        return -perspectiveDepthToViewZ(texture2D(tDepth, uv).x, uNear, uFar);
      }

      // What a pixel shows, from its alpha: an even number for a clump of the
      // crown, 253 for flowers, which go uninked, and 255 for anything else.
      float clumpAt(vec2 uv) {
        return floor(texture2D(tColor, uv).a * 255.0 + 0.5);
      }
      bool isLeaf(float id) {
        return id < 252.5 && mod(id, 2.0) < 0.5;
      }

      // How far the centre stands proud of the pair either side of it.
      float proud(vec2 uv, vec2 o, float iz, float z) {
        return (iz - 0.5 * (1.0 / depthAt(uv + o) + 1.0 / depthAt(uv - o))) * z;
      }

      // Paper: a fine tooth, and long faint fibres.
      vec3 paper(vec3 col, vec2 css) {
        float tooth = hash12(floor(css));
        float fibre = noise2(css * vec2(0.012, 0.09));
        return col * (1.0 - 0.028 * (tooth - 0.5) - 0.02 * (fibre - 0.5));
      }

      void main() {
        vec3 col = texture2D(tColor, vUv).rgb;
        vec2 css = gl_FragCoord.xy / uDpr;
        vec2 wob = (vec2(noise2(css * 0.045), noise2(css * 0.045 + 19.7)) - 0.5) * 1.6 * uDpr / uRes;
        vec2 uv = vUv + wob;
        vec2 px = uWeight * uDpr / uRes;
        float z = depthAt(uv);
        // Open sky stands proud of nothing and holds no leaves: there's no ink
        // to find there, only paper — and it's nearly half the frame.
        if (z > 0.9 * uFar) {
          gl_FragColor = vec4(paper(col, css), 1.0);
          return;
        }
        float iz = 1.0 / z;
        float edge = max(
          max(proud(uv, vec2(px.x, 0.0), iz, z), proud(uv, vec2(0.0, px.y), iz, z)),
          max(proud(uv, px * 0.7071, iz, z), proud(uv, vec2(px.x, -px.y) * 0.7071, iz, z)));

        float fade = 1.0 - 0.9 * smoothstep(uFade.x, uFade.y, z);
        vec3 ink = mix(uInk, col * 0.4, 0.5);

        // Inside the crown: where a clump overlaps one behind it, a faint line
        // along its edge, and the slightest shadow it lays on that one — most
        // below it, as the light comes from above.
        float me = clumpAt(uv);
        if (isLeaf(me)) {
          vec2 reach = uClumpReach * uDpr / uRes;
          float overlap = 0.0;
          float shadow = 0.0;
          for (int i = 0; i < 8; i++) {
            float a = float(i) * 0.7853982;
            vec2 dir = vec2(cos(a), sin(a));
            vec2 near = uv + dir * px;
            float other = clumpAt(near);
            if (isLeaf(other) && abs(other - me) > 0.5 && depthAt(near) > z + 0.3) overlap = 1.0;
            vec2 far = uv + dir * reach;
            other = clumpAt(far);
            if (isLeaf(other) && abs(other - me) > 0.5 && depthAt(far) < z - 0.3) shadow += 0.08 + 0.3 * max(dir.y, 0.0);
          }
          col *= 1.0 - uClumpShadow * smoothstep(0.0, 0.6, shadow) * fade;
          col = mix(col, ink, uClumpLine * overlap * fade);
        }

        // Every form against what's behind it: the strong line.
        float line = smoothstep(uThreshold.x, uThreshold.y, edge);
        float weight = mix(0.55, 0.92, smoothstep(0.06, 0.3, edge)) * fade;
        if (abs(me - 253.0) < 0.5) weight = 0.0;
        col = mix(col, ink, line * weight);

        gl_FragColor = vec4(paper(col, css), 1.0);
      }
    `})}function Jn(){return new le({uniforms:{tDiffuse:{value:null},resolution:{value:new j(1,1)}},depthTest:!1,depthWrite:!1,vertexShader:da,fragmentShader:an.fragmentShader})}const{first:es,every:ts,flight:os,linger:Wo,length:as,slant:ns,tail:ss}=ne.shootingStars,Bo={land:.05,crown:.04},Wt=.92,is=32,ot=([t,o])=>t+Math.random()*(o-t),xe=new x,Bt=new x,Ho=new x,at=new x,Ht=new x,$o=new x,$t=new x,rs=(t,o,a,e,n,i)=>{const l=n-a,s=i-e,r=P.clamp(((t-a)*l+(o-e)*s)/(l*l+s*s),0,1);return Math.hypot(t-a-l*r,o-e-s*r)};class ls{constructor(o,a,e){this.sky=o,this.land=a,this.lobes=e,this.falling=!1,this.span=0,this.time=0,this.flies=0,this.next=0,this.waiting=!1}path(o){o.updateMatrixWorld();let a=-1;for(const l of this.land)for(let s=0;s<l.length;s+=3)xe.set(l[s],l[s+1],l[s+2]).project(o),xe.z<1&&Math.abs(xe.x)<1.05&&xe.y>a&&(a=xe.y);const e=o.aspect,n=a+2*Bo.land;Ho.setFromMatrixColumn(o.matrixWorld,0);const i=this.lobes.map(l=>(xe.copy(l.centre).project(o),Bt.copy(l.centre).addScaledVector(Ho,l.radius).project(o),{x:xe.x*e,y:xe.y,r:Math.hypot((Bt.x-xe.x)*e,Bt.y-xe.y)+2*Bo.crown}));for(let l=0;l<is;l++){const s=2*ot(as)*Math.min(1,e),r=P.degToRad(ot(ns)),d=Math.cos(r)*s*(Math.random()<.5?-1:1),m=Math.sin(r)*s*(Math.random()<.5?-1:1),p=Wt*e,f=-p+Math.random()*2*p,h=n+Math.random()*(Wt-n),c=f+d,v=h+m;if(!(Math.abs(c)>p||v>Wt||v<n)&&!i.some(g=>rs(g.x,g.y,f,h,c,v)<g.r))return{from:[f/e,h],to:[c/e,v]}}return null}launch(o){const a=this.path(o);return a?(at.set(a.from[0],a.from[1],.5).unproject(o).sub(o.position).normalize(),Ht.set(a.to[0],a.to[1],.5).unproject(o).sub(o.position).normalize(),$t.crossVectors(at,Ht).normalize(),$o.crossVectors($t,at).normalize(),this.sky.uFrom.value.copy(at),this.sky.uAlong.value.copy($o),this.sky.uSide.value.copy($t),this.span=P.radToDeg(at.angleTo(Ht)),this.flies=ot(os),this.time=0,this.falling=!0,a):null}update(o,a,e,n){e?this.waiting||(this.waiting=!0,this.next=ot(es)):this.waiting=!1,this.falling?this.fly(o):this.waiting&&n&&(this.next-=o)<=0&&(this.next=ot(ts),this.launch(a),this.falling&&this.fly(0))}fly(o){this.time+=o;const a=this.sky.uFall.value,e=this.time/this.flies;if(this.time>=this.flies+Wo){this.falling=!1,a.set(0,0,0,0);return}const n=P.smoothstep,i=this.span*Math.min(1,e),l=n(e,0,.12)*(1-n(this.time,this.flies,this.flies+Wo)),s=n(e,0,.12)*(1-n(e,.7,1));a.set(i,this.span*ss,l,s)}}const Vo=Math.PI*2,so=new x(0,0,1),Yo=new x(0,1,0),pt=t=>Math.min(1,Math.max(0,t)),Vt=t=>t*t*(3-2*t),ma=-13,fa=[[.45,.3],[.6,.95],[.05,1.3],[-.45,.9],[-.15,.3],[.75,.02]],qo=[[[1.8,.15],[3.6,.05],[5.4,.25],[7,.2]],[[1.8,.25],[3.6,.7],[5.2,1.3],[6.6,1.8]],[[1.7,.15],[3.2,.5],[4.2,1.05],[4.7,1.6],[4.45,1.95],[4.05,1.8]],[[1.8,-.2],[3.6,-.55],[5.4,-.7],[7,-.6]]],pa=(t,o)=>{const a=(Math.random()-.5)*1.6;o(t,a-.3),o(t*.72,a*.7+.25),o(t*.45,a*.4-.1),o(t*.2,.08)},va=(t,o,a)=>{const e=qo[Math.floor(Math.random()*qo.length)],n=.85+.35*Math.random(),i=.75+.5*Math.random();for(const[l,s]of e)a(t+l*n,o+s*i)},go=(t,o)=>{const a=new Ua(t,!1,"centripetal"),e=(t.length-1)*24;a.arcLengthDivisions=e;const n=a.getLengths(e);return{curve:a,at:o.map(i=>n[i*24])}},cs=(t,o)=>{const a=[],e=(Math.random()-.25)*.24,n=(f,h)=>a.push(new x(t.x+f,t.y+h,t.z+Math.max(0,f)*e));pa(ma-t.x,n),n(-1.4,-.04);const i=a.length;n(0,0),n(1.3,.22);let l=2.4;const s=.4;if(o){const f=1.05+.4*Math.random();for(const[h,c]of fa)n(l+h*f,s+c*f);l+=1.2*f}n(l+1.4,s+(Math.random()-.5)*.4);const r=a.length-1;va(l+1.4,s,n);const{curve:d,at:[m,p]}=go(a,[i,r]);return{curve:d,start:m,release:p}},us=t=>{const o=new x(t.x-.8,t.y+1,t.z+.3),a=[],e=(n,i)=>a.push(new x(o.x+n,o.y+i,o.z));return pa(ma-o.x,e),e(-1.2,-.1),e(0,0),e(1.8,.1),va(1.8,.1,e),go(a,[]).curve},hs=t=>{for(let o=0;o<6;o++){const a=Math.random(),e=a<.55,n=a>=.88,i=e?3+Math.random()*13:n?-6+Math.random()*12:-14-Math.random()*26,l=e?1.2+Math.random():n?11.5+Math.random()*2:1.5+Math.random()*3.5,s=v=>n?l:ie(v,i)+l,r=e?-26+Math.random()*10:-50+Math.random()*14,d=(e?30+Math.random()*12:40+Math.random()*15)/8,m=Math.random()*6,p=Math.random()<.3?3+Math.floor(Math.random()*3):-1,f=[];for(let v=0;v<=8;v++){const g=r+d*v,y=s(g)+Math.sin(v*.9+m)*.35;if(f.push(new x(g,y,i+Math.sin(g*.15+m)*.8)),v!==p)continue;const E=.9+.5*Math.random();for(const[M,b]of fa)f.push(new x(g+M*E,y+b*E,f[f.length-1].z))}const{curve:h}=go(f,[]);if(h.getSpacedPoints(48).every(v=>t.every(g=>v.distanceTo(g.centre)>g.radius+Mt.clearance)))return h}return null},vt=180;class ds{constructor(){this.material=Kn(),this.active=!1,this.geometry=new it,this.t=0,this.length=1,this.opacity=.82;const o=vt+1,a=new Float32Array(o*2),e=new Float32Array(o*2);for(let i=0;i<o;i++)a[i*2]=-1,a[i*2+1]=1,e[i*2]=e[i*2+1]=i/vt;const n=[];for(let i=0;i<vt;i++)n.push(i*2,i*2+1,i*2+2,i*2+1,i*2+3,i*2+2);this.geometry.setAttribute("position",new $e(new Float32Array(o*6),3)),this.geometry.setAttribute("aNext",new $e(new Float32Array(o*6),3)),this.geometry.setAttribute("aSide",new $e(a,1)),this.geometry.setAttribute("aU",new $e(e,1)),this.geometry.setIndex(n),this.mesh=new lo(this.geometry,this.material),this.mesh.frustumCulled=!1,this.mesh.visible=!1,this.mesh.renderOrder=2}launch(o,a,e,n=.82){const i=o.getSpacedPoints(vt),l=this.geometry.attributes.position.array,s=this.geometry.attributes.aNext.array;i.forEach((r,d)=>{const m=i[d+1]??r.clone().multiplyScalar(2).sub(i[d-1]);for(let p=0;p<2;p++){const f=(d*2+p)*3;l[f]=r.x,l[f+1]=r.y,l[f+2]=r.z,s[f]=m.x,s[f+1]=m.y,s[f+2]=m.z}}),this.geometry.attributes.position.needsUpdate=!0,this.geometry.attributes.aNext.needsUpdate=!0,this.length=o.getLength(),this.opacity=n,this.t=-a,this.material.uniforms.uWidth.value=e,this.active=!0}update(o){if(!this.active)return;this.t+=o;const a=this.t*re.streakSpeed,e=Math.min(this.length,Math.max(0,a)),n=Math.min(this.length,Math.max(0,a-re.streakLength)),i=this.material.uniforms;i.uHead.value=e/this.length,i.uTail.value=n/this.length,i.uOpacity.value=this.opacity,this.mesh.visible=e-n>.01,n>=this.length&&(this.active=!1,this.mesh.visible=!1)}}const ms=.55,Xo=1.6,gt=new x,Et=new qe,xt=new x,fs=new qe,ps=(t,o,a)=>{let e=0;for(const n of o){const i=n.x-t.x,l=n.y-t.y,s=n.z-t.z,r=i*a.x+l*a.y+s*a.z;if(r<=0)continue;const d=Math.hypot(i-a.x*r,l-a.y*r,s-a.z*r)/n.w;e=Math.max(e,1-P.smoothstep(d,.62,.96))}return 1-.78*e},Zo=(t,o,a)=>a.setFromUnitVectors(so,t).premultiply(Et.setFromAxisAngle(t,o));class vs{constructor(o,a,e){this.phase="idle",this.landedAt=0,this.clock=0,this.hang=new x,this.curve=null,this.length=1,this.release=1,this.s=0,this.speed=0,this.offset=new x,this.pos=new x,this.base=new x,this.vel=new x,this.quat=new qe,this.hold=new qe,this.spinAxis=new x(1,0,0),this.swing=0,this.swingAmp=0,this.swingDir=new x(1,0,0),this.yaw=0,this.size=1,this.material=Bn(a,e),this.mesh=new lo(o,this.material),this.mesh.visible=!1,this.mesh.frustumCulled=!1}launch(o,a,e,n,i){this.phase="waiting",this.clock=-i,this.hang.copy(o),this.curve=a,this.length=a.getLength(),this.release=n,this.s=e,this.speed=0,this.size=.88+.24*Math.random(),this.spinAxis.set(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize(),this.material.uniforms.uTint.value=Math.random(),this.material.uniforms.uSeed.value=Math.random()}fadeOut(){this.phase==="rest"&&(this.phase="fade",this.clock=0)}update(o,a,e,n){if(this.phase==="idle")return;this.clock+=o;let i=1,l=0,s=1;switch(this.phase){case"waiting":if(this.clock<0)break;this.hold.copy(e.quaternion).multiply(Et.setFromAxisAngle(so,(Math.random()-.5)*1.6)),this.phase="tug",this.clock=0;case"tug":{s=0,fo(this.hang,a.time,a.level,this.pos).add(this.hang);const d=Math.sin(this.clock*26)*.32*Math.min(1,this.clock*4);this.quat.copy(this.hold).multiply(Et.setFromAxisAngle(so,d)),l=.6,this.clock>=ms&&(this.phase="ride",this.clock=0,this.offset.copy(this.pos).sub(this.curve.getPointAt(Math.min(1,this.s/this.length),gt)));break}case"ride":{const d=re.rideSpeed*(.35+.65*pt(a.level/.6));this.speed+=(d-this.speed)*(1-Math.exp(-o*2.5)),this.s+=this.speed*o;const m=Math.min(1,this.s/this.length);this.curve.getPointAt(m,this.pos).addScaledVector(this.offset,1-Vt(pt(this.clock/.6))),s=Vt(pt(this.clock/1.4)),this.spinAxis.applyAxisAngle(Yo,o*.7).normalize(),this.quat.multiply(Et.setFromAxisAngle(this.spinAxis,o*(2.4+3*a.level))).normalize(),l=1,(this.s>=this.release||a.level<.18&&this.clock>2)&&(this.phase="fall",this.clock=0,this.curve.getTangentAt(m,this.vel).multiplyScalar(this.speed),this.base.copy(this.pos),this.swing=0,this.swingAmp=0,this.swingDir.set(1,0,(Math.random()-.5)*1.2).normalize(),this.yaw=Math.random()*Vo);break}case"fall":{gt.set(re.drift*(.5+a.level),-.85,0),this.vel.lerp(gt,1-Math.exp(-o*1.4)),this.base.addScaledVector(this.vel,o),this.swingAmp=Math.min(1,this.swingAmp+o/1.8),this.swing+=o*Vo/re.swingPeriod;const d=Math.sin(this.swing)*this.swingAmp;this.pos.copy(this.base).addScaledVector(this.swingDir,re.swingWidth*d),this.pos.y+=re.swingLift*d*d,this.yaw+=o*.45,xt.subVectors(e.position,this.pos).normalize().multiplyScalar(.7).add(Yo).addScaledVector(this.swingDir,-.85*d).normalize(),this.quat.slerp(Zo(xt,this.yaw,fs),1-Math.exp(-o*(.8+3*this.swingAmp))),l=.35;const m=ie(this.pos.x,this.pos.z);this.pos.y<m+.12&&(this.pos.y=m+.12,st(this.pos.x,this.pos.z,xt).lerp(gt.subVectors(e.position,this.pos).normalize(),.45).normalize(),Zo(xt,this.yaw,this.hold),this.phase="rest",this.clock=0,this.landedAt=a.time);break}case"rest":this.quat.slerp(this.hold,1-Math.exp(-o*6)),this.clock>re.restFor&&this.fadeOut();break;case"fade":if(i=1-Vt(pt(this.clock/Xo)),this.pos.y-=o*.03,this.clock>=Xo){this.phase="idle",this.mesh.visible=!1;return}break}this.mesh.visible=this.phase!=="waiting",this.mesh.position.copy(this.pos),this.mesh.quaternion.copy(this.quat),this.mesh.scale.setScalar(P.lerp(re.size,re.flyingSize,s)*this.size*i);const r=this.material.uniforms;r.uFlutter.value+=(l-r.uFlutter.value)*(1-Math.exp(-o*4)),r.uShadow.value=ps(this.pos,n.uLobes.value,n.uSun.value)}}const gs=({model:t,wind:o,uniforms:a,atlas:e})=>{const n=G(h=>h.gl),i=G(h=>h.scene),l=G(h=>h.camera),s=G(h=>h.size.width),r=G(h=>h.size.height),d=C.useMemo(()=>new Ga(1,1,6,6),[]),m=C.useMemo(()=>Array.from({length:8},()=>new ds),[]),p=C.useMemo(()=>({next:6+Math.random()*4}),[]),f=C.useMemo(()=>Array.from({length:10},()=>new vs(d,a,e)),[d,a,e]);return C.useEffect(()=>()=>{d.dispose(),m.forEach(h=>{h.mesh.geometry.dispose(),h.material.dispose()}),f.forEach(h=>h.material.dispose())},[d,m,f]),C.useEffect(()=>{m.forEach(h=>h.material.uniforms.uRes.value.set(s/2,r/2))},[m,s,r]),C.useEffect(()=>{var g;const h=[m[0].mesh,f[0].mesh],c=new Qt(1,1,{depthTexture:new ra(1,1)}),v=n.getRenderTarget();h.forEach(y=>y.visible=!0),n.setRenderTarget(c),n.render(i,l),n.setRenderTarget(v),h.forEach(y=>y.visible=!1),(g=c.depthTexture)==null||g.dispose(),c.dispose()},[n,i,l,m,f]),C.useEffect(()=>(o.onGust=()=>{var v,g;const h=Math.random()<re.twoLeafChance?2:1;let c=null;for(let y=0;y<h;y++){const E=f.find(R=>R.phase==="idle");if(!E||t.loose.length===0)break;const M=t.loose[Math.floor(Math.random()*t.loose.length)],b=fo(M,o.time,o.level).add(M),{curve:T,start:S,release:D}=cs(b,Math.random()<re.loopChance),F=y*.9;(v=m.find(R=>!R.active))==null||v.launch(T,F,y?1.8:2.5),E.launch(M,T,S,D,F+S/re.streakSpeed),c??(c=b)}c&&((g=m.find(y=>!y.active))==null||g.launch(us(c),.25,1.9))},()=>{o.onGust=null}),[o,t,f,m]),fe((h,c)=>{const v=Math.min(c,.05);if(o.held&&(p.next=Math.max(p.next,o.time+Ce.afterHold)),o.time>=p.next){const[M,b]=Mt.every;p.next=o.time+M+Math.random()*(b-M);const T=Math.random()<Mt.pairChance?2:1;for(let S=0;S<T;S++){const D=hs(t.lobes),F=m.find(z=>!z.active);if(!D||!F)break;const R=D.getPointAt(.6).distanceTo(Y);F.launch(D,S*.7,2.4*P.clamp(34/R,.85,1.15),Mt.opacity)}}for(const M of m)M.update(v);let g=0,y=null,E=!1;for(const M of f)M.update(v,o,l,a),(M.phase==="tug"||M.phase==="ride")&&(E=!0),M.phase==="rest"&&(g++,(!y||M.landedAt<y.landedAt)&&(y=M));g>re.maxResting&&(y==null||y.fadeOut()),o.carrying=E}),$.jsxs($.Fragment,{children:[m.map((h,c)=>$.jsx("primitive",{object:h.mesh},`streak${c}`)),f.map((h,c)=>$.jsx("primitive",{object:h.mesh},`leaf${c}`))]})},xs=()=>{const t=G(s=>s.gl),o=G(s=>s.scene),a=G(s=>s.camera),e=G(s=>s.size.width),n=G(s=>s.size.height),i=G(s=>s.viewport.dpr),l=C.useMemo(()=>{const s=new Qt(1,1,{depthTexture:new ra(1,1)}),r=new Qt(1,1,{depthBuffer:!1}),d=Qn();d.uniforms.tColor.value=s.texture,d.uniforms.tDepth.value=s.depthTexture,d.uniforms.uWeight.value=je.weight,d.uniforms.uThreshold.value.set(...je.threshold),d.uniforms.uFade.value.set(...je.fade),d.uniforms.uClumpLine.value=je.clumpLine,d.uniforms.uClumpShadow.value=je.clumpShadow,d.uniforms.uClumpReach.value=je.clumpShadowWidth;const m=Jn();m.uniforms.tDiffuse.value=r.texture;const p=new it;p.setAttribute("position",new pe([-1,-1,0,3,-1,0,-1,3,0],3)),p.setAttribute("uv",new pe([0,0,2,0,0,2],2));const f=new lo(p,d);f.frustumCulled=!1;const h=new Wa;return h.add(f),{painted:s,inked:r,ink:d,smooth:m,geometry:p,quad:f,post:h,camera:new At(-1,1,1,-1,0,1)}},[]);return C.useEffect(()=>()=>{var s;(s=l.painted.depthTexture)==null||s.dispose(),l.painted.dispose(),l.inked.dispose(),l.ink.dispose(),l.smooth.dispose(),l.geometry.dispose()},[l]),C.useLayoutEffect(()=>{const s=Math.max(1,Math.round(e*i)),r=Math.max(1,Math.round(n*i));l.painted.setSize(s,r),l.inked.setSize(s,r),l.ink.uniforms.uRes.value.set(s,r),l.ink.uniforms.uDpr.value=i,l.smooth.uniforms.resolution.value.set(1/s,1/r)},[l,e,n,i]),fe(()=>{l.ink.uniforms.uNear.value=a.near,l.ink.uniforms.uFar.value=a.far,t.setRenderTarget(l.painted),t.render(o,a),l.quad.material=l.ink,t.setRenderTarget(l.inked),t.render(l.post,l.camera),l.quad.material=l.smooth,t.setRenderTarget(null),t.render(l.post,l.camera)},1),null},xo=new x().subVectors(co,Y),ys=xo.length();xo.normalize();const ws=t=>{const o=1-P.smoothstep(t,.6,1.6),a=co.clone().lerp(new x(...K.narrowTarget),o),e=a.clone().addScaledVector(xo,-ys*(1+(K.drawBack-1)*o)),n=1-P.smoothstep(t,...K.phone.aspect),i=new x(...K.phone.target),l=new x(...K.phone.position).sub(i).multiplyScalar(Math.max(1,K.phone.framedFor/t)).add(i);return a.lerp(i,n),e.lerp(l,n),e.y=Math.max(e.y,ie(e.x,e.z)+K.minEyeHeight),{position:e,target:a,phone:n}},Lt=new x(...ae.crownCentre),Yt=ae.crownRadii[0]+ae.lobeRadius[1],qt={fill:.62,minBack:.12,maxFov:50},bs=1400,Xt=t=>Math.tan(P.degToRad(t)/2),Ss=t=>t<.5?4*t*t*t:1-(-2*t+2)**3/2,Ms=(t,o)=>{const a=(t.x-Te.apex.x)*B.x+(t.z-Te.apex.z)*B.z,e=o.x*B.x+o.z*B.z;return e>.001?Math.max(0,(a-3)/e):0},Ae=new zt,Ko=new x(0,ie(0,0),0),As=2.5,zs=1.1,Ts=18,Es=(t,o,a)=>{if(a>=1)return t;const e=t.target.clone().sub(t.position).normalize(),n=t.position.clone(),i=qt.fill*a*o,l=n.distanceTo(Lt),s=Math.min(Math.max(l*qt.minBack,Yt/(i*Xt(t.fov))-l),Ms(n,e));n.addScaledVector(e,-s),n.y=Math.max(n.y,ie(n.x,n.z)+K.minEyeHeight);const r=n.distanceTo(Lt),d=Yt/(r*Xt(t.fov))>i?Math.min(qt.maxFov,P.radToDeg(2*Math.atan(Yt/(r*i)))):t.fov;Ae.fov=d,Ae.aspect=o,Ae.filmOffset=0,Ae.position.copy(n),Ae.lookAt(t.target),Ae.updateMatrixWorld(),Ae.updateProjectionMatrix();const m=Lt.clone().project(Ae).x,p=-(a-1-m)*Xt(d)*o*Ae.getFilmWidth();return{position:n,target:t.target.clone(),fov:d,shift:p}},Qo=t=>({position:t.position.clone(),target:t.target.clone(),fov:t.fov,shift:t.shift}),Ls=(t,o,a,e)=>{t.position.lerpVectors(o.position,a.position,e),t.target.lerpVectors(o.target,a.target,e),t.fov=P.lerp(o.fov,a.fov,e),t.shift=P.lerp(o.shift,a.shift,e)},ga=()=>{var t;return((t=window.matchMedia)==null?void 0:t.call(window,"(prefers-reduced-motion: reduce)").matches)??!1},ks=({free:t,fov:o,clear:a,motion:e})=>{const n=G(h=>h.camera),i=G(h=>h.size.width),l=G(h=>h.size.height),s=i/l,r=C.useMemo(()=>ws(s),[s]),d=C.useMemo(()=>({position:r.position,target:r.target,fov:P.lerp(o,K.phone.fov,r.phone),shift:0}),[r,o]),m=C.useMemo(()=>Es(d,s,a),[d,s,a]),p=C.useRef({now:null,from:null,start:0,size:""});C.useLayoutEffect(()=>{const h=p.current,c=`${i}x${l}`;n.near=.5,n.far=1500,n.aspect=s,!h.now||c!==h.size||t||ga()?(h.now=Qo(m),h.from=null):(h.from=Qo(h.now),h.start=performance.now()),h.size=c,e.moving=!!h.from,t?(n.fov=d.fov,n.filmOffset=0):(n.position.copy(h.now.position),n.lookAt(h.now.target),n.fov=h.now.fov,n.filmOffset=h.now.shift),n.updateProjectionMatrix()},[n,i,l,s,d,m,t,e]),fe(()=>{if(t){const v=ie(n.position.x,n.position.z)+K.minEyeHeight;n.position.y<v&&(n.position.y=v);return}const h=p.current;if(!h.from||!h.now)return;const c=Math.min(1,(performance.now()-h.start)/bs);Ls(h.now,h.from,m,Ss(c)),c>=1&&(h.from=null,e.moving=!1),n.position.copy(h.now.position),n.lookAt(h.now.target),n.fov=h.now.fov,n.filmOffset=h.now.shift,n.updateProjectionMatrix()},-2);const f=C.useMemo(()=>{const h=r.position.clone().sub(r.target),c=Math.atan2(h.x,h.z),v=Math.acos(h.y/h.length()),g=P.degToRad;return{azimuth:[c-g(K.freeTurn),c+g(K.freeTurn)],polar:[v-g(K.freeTilt),Math.min(Math.PI/2+.02,v+g(K.freeTilt))],distance:[h.length()*K.freeReach[0],h.length()*K.freeReach[1]]}},[r]);return t?$.jsx(on,{makeDefault:!0,target:r.target,enableDamping:!0,enablePan:!1,dampingFactor:.08,minAzimuthAngle:f.azimuth[0],maxAzimuthAngle:f.azimuth[1],minPolarAngle:f.polar[0],maxPolarAngle:f.polar[1],minDistance:f.distance[0],maxDistance:f.distance[1]}):null},Ds=({wind:t,stars:o,motion:a,drawn:e,paused:n})=>{const i=G(s=>s.frameloop);C.useEffect(()=>{if(i!=="never")return;let s=0,r=-1/0;const d=m=>{n&&e.frames>=2&&!a.moving||(s=requestAnimationFrame(d),!(m-r<1e3/(t.carrying||a.moving||o.falling?Eo.full:Eo.calm)-2)&&(r=m,ko(m/1e3)))};return s=requestAnimationFrame(d),()=>cancelAnimationFrame(s)},[t,o,a,e,n,i]);const l=G(s=>s.size);return C.useEffect(()=>{if(!n||i!=="never"||e.frames<2)return;const s=requestAnimationFrame(r=>ko(r/1e3));return()=>cancelAnimationFrame(s)},[l,n,i,e]),null},yt=new x,wt=new x,Zt=new x,bt=new x,Jo=new x,Kt=new j,We=new j,Be=new j,St=new j,ea=new j,Ps=(t,o,a)=>{St.subVectors(a,o);const e=P.clamp(St.dot(ea.subVectors(t,o))/Math.max(St.lengthSq(),1e-6),0,1);return ea.copy(o).addScaledVector(St,e).distanceTo(t)},Rs=.05,Cs=.4,Fs=.8,_s=(t,o,a)=>{fe((e,n)=>{t.update(Math.min(n,1/20)),a.uTime.value=t.time,a.uGust.value=t.level;for(let i=0;i<o.lobes.length;i++){const l=o.lobes[i];fo(l.centre,t.time,t.level,yt).add(l.centre),a.uLobes.value[i].set(yt.x,yt.y,yt.z,l.radius)}},-1)},Os=(t,o)=>{const a=C.useMemo(()=>{const e=ta[o],n=[],i=(l,s)=>s.forEach((r,d)=>n.push([l[d],q(r)]));return i(t.uLeaf.value,e.leaf),i(t.uLeafAlt.value,e.leafAlt),i(t.uGrass.value,e.grass),i([t.uGrassPatch.value],[e.grassPatch]),i(t.uGrove.value,e.grove),{pairs:n,settled:!1}},[t,o]);fe((e,n)=>{if(a.settled)return;const i=1-Math.exp(-Math.min(n,1/20)*2.2);let l=0;for(const[s,r]of a.pairs)s.lerp(r,i),l=Math.max(l,s.distanceToSquared(r));if(l<1e-7){for(const[s,r]of a.pairs)s.copy(r);a.settled=!0}})},Is=(t,o)=>{const a=C.useRef(t.uDusk.value);fe((e,n)=>{const i=o?1:0;if(a.current===i)return;const l=Math.min(n,1/20)/ne.turn;a.current=i>a.current?Math.min(i,a.current+l):Math.max(i,a.current-l),t.uDusk.value=P.smoothstep(a.current,0,1)})},Ns=({season:t,dusk:o=!1,freeCamera:a=!1,fov:e=K.fov,clear:n=1,still:i=!1,paused:l=!1,onReady:s,handle:r})=>{const d=G(b=>b.camera),m=G(b=>b.gl),p=G(b=>b.get),f=C.useRef(t).current,h=C.useRef(o).current,c=C.useMemo(()=>{const b=mn(),T=Pn(),S=zn(),D=gn(),F=bn(),R=_n(),z=jn(f,h),ce=z.uCastSun.value,ue=N=>N.clone().addScaledVector(ce,-N.y/ce.y),V=ue(b.lobes.reduce((N,X)=>N.add(X.centre),new x).divideScalar(b.lobes.length)),we=Math.max(...b.lobes.map(N=>{const X=ue(N.centre);return Math.hypot(X.x-V.x,X.z-V.z)+N.radius/ce.y})),oe=new Ba(new Ha(1,1),Wn(z),b.lobes.length),A=new $a;b.lobes.forEach((N,X)=>{const Z=N.radius*.66;oe.setMatrixAt(X,A.makeScale(Z,Z*.82,Z).setPosition(N.centre))}),oe.frustumCulled=!1;const _=sn(),I=Sn(),U=Co(ca,ln),H=Co(rn,cn),W=Xn(z),he=[_,U,H].map(N=>N.getAttribute("position").array);return{model:b,atlas:T,tuftAtlas:S,daisyAtlas:D,groveAtlas:F,puffAtlas:R,cores:oe,uniforms:z,drawn:{frames:0},motion:{moving:!1},wind:new In(Math.random),stars:new ls(W.uniforms,[...he,Mn(I)],b.lobes),geometry:{ground:_,tufts:Tn(),daisies:yn(),grove:I,clouds:On(),nearRidge:U,farRidge:H,sky:new Va(600,48,24)},material:{leaves:Un(z,T),wood:Hn(z),ground:$n(z,V,we+.5),tufts:Vn(z,S,V,we+.5),daisies:Yn(z,D,V,we+.5),grove:qn(z,F),clouds:Zn(z,R),nearRidge:Uo(z,te.ridgeNear,.42),farRidge:Uo(z,te.ridgeFar,.55),sky:W}}},[f,h]);C.useEffect(()=>()=>{c.model.wood.dispose(),c.model.leaves.dispose(),c.atlas.dispose(),c.tuftAtlas.dispose(),c.daisyAtlas.dispose(),c.groveAtlas.dispose(),c.puffAtlas.dispose(),c.cores.geometry.dispose(),c.cores.dispose(),c.cores.material.dispose(),Object.values(c.geometry).forEach(b=>b.dispose()),Object.values(c.material).forEach(b=>b.dispose())},[c]),C.useEffect(()=>{m.setClearColor(te.skyHorizon)},[m]),C.useEffect(()=>{if(!r)return;const{wind:b}=c;return r.current={gust:()=>b.trigger(),shootingStar:()=>c.stars.launch(p().camera),nextGust:()=>b.blowing?0:Math.max(0,b.nextAt-b.time),view:()=>{const{camera:T,controls:S}=p(),D=(S==null?void 0:S.target)??null;return{position:T.position,target:D,fov:T.fov}},frames:()=>c.drawn.frames,treeAt:(T,S)=>{const{camera:D,gl:F}=p(),R=F.domElement.getBoundingClientRect(),z=(ue,V)=>(wt.copy(ue).project(D),V.set(R.left+(wt.x+1)/2*R.width,R.top+(1-wt.y)/2*R.height),wt.z<1);Kt.set(T,S),Jo.setFromMatrixColumn(D.matrixWorld,0);for(let ue=0;ue<c.model.lobes.length;ue++){const V=c.uniforms.uLobes.value[ue];if(Zt.set(V.x,V.y,V.z),!!z(Zt,We)&&(bt.copy(Zt).addScaledVector(Jo,V.w*zs),z(bt,Be),Kt.distanceTo(We)<=We.distanceTo(Be)))return!0}bt.set(ae.trunkRadius*As,0,0).add(Ko),z(Ko,We),z(bt,Be);const ce=Math.max(Ts,We.distanceTo(Be));return z(Lt,Be),Ps(Kt,We,Be)<=ce}},()=>{r.current=null}},[r,c,p]),_s(c.wind,c.model,c.uniforms),Os(c.uniforms,t),Is(c.uniforms,o),C.useEffect(()=>{c.wind.held=i},[c,i]);const v=C.useRef(i);v.current=i,fe((b,T)=>{const S=c.material.daisies.uniforms.uSwayShare,D=v.current?Rs:1;if(S.value===D)return;const F=Math.min(T,1/20)*(D<S.value?Cs:Fs);S.value=D<S.value?Math.max(D,S.value-F):Math.min(D,S.value+F)});const g=C.useRef(s);g.current=s;const y=C.useRef(!1);fe(()=>{var b;y.current||c.drawn.frames<2||(y.current=!0,(b=g.current)==null||b.call(g))},2);const E=C.useRef(null);fe(()=>{var b;(b=E.current)==null||b.position.copy(d.position),c.drawn.frames++});const M=C.useRef(null);return fe((b,T)=>{const S=c.uniforms.uDusk.value;M.current&&(M.current.visible=S<1),c.stars.update(Math.min(T,1/10),d,S===1,!v.current&&!c.motion.moving&&!ga())}),$.jsxs($.Fragment,{children:[$.jsx(Ds,{wind:c.wind,stars:c.stars,motion:c.motion,drawn:c.drawn,paused:l}),$.jsx(ks,{free:a,fov:e,clear:n,motion:c.motion}),$.jsx("mesh",{ref:E,geometry:c.geometry.sky,material:c.material.sky,renderOrder:1,frustumCulled:!1}),$.jsx("mesh",{ref:M,geometry:c.geometry.clouds,material:c.material.clouds}),$.jsx("mesh",{geometry:c.geometry.farRidge,material:c.material.farRidge}),$.jsx("mesh",{geometry:c.geometry.nearRidge,material:c.material.nearRidge}),$.jsx("mesh",{geometry:c.geometry.ground,material:c.material.ground}),$.jsx("mesh",{geometry:c.geometry.grove,material:c.material.grove}),$.jsx("mesh",{geometry:c.geometry.tufts,material:c.material.tufts}),$.jsx("mesh",{geometry:c.geometry.daisies,material:c.material.daisies}),$.jsx("mesh",{geometry:c.model.wood,material:c.material.wood}),$.jsx("primitive",{object:c.cores}),$.jsx("mesh",{geometry:c.model.leaves,material:c.material.leaves}),$.jsx(gs,{model:c.model,wind:c.wind,uniforms:c.uniforms,atlas:c.atlas}),$.jsx(xs,{})]})},Bs=t=>$.jsx(Ya,{flat:!0,frameloop:"never",dpr:[1,1.5],gl:{antialias:!1,depth:!1,stencil:!1,powerPreference:"default"},style:{position:"absolute",inset:0},children:$.jsx(Ns,{...t})});export{Bs as default};
