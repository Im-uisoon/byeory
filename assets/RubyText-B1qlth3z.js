import{t as e}from"./SharedController-Bsnoc1D6.js";import{Nt as t,W as n,jt as r,z as i}from"./index-XppDkQXE.js";import"./Shared-CrH2WfNP.js";var a=t(r(),1),o=i(),s=()=>((0,a.useEffect)(()=>(document.body.classList.add(`show-ruby`),()=>{document.body.classList.remove(`show-ruby`)}),[]),(0,o.jsx)(`style`,{children:`
        body:not(.show-ruby) rt {
            display: none;
        }
        body.show-ruby rt {
            display: block;
            color: #ff6b6b;
            font-size: 0.6em;
        }
    `}));const c=({className:t,style:r,gridSize:i})=>(0,o.jsx)(e,{className:t,style:r,label:`루비 문자`,icon:(0,o.jsx)(n,{size:20}),storageKey:`effect-ruby-text`,children:(0,o.jsx)(s,{})});export{c as RubyText};