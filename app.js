const stack=document.querySelector('.protocol-stack');
if(stack){requestAnimationFrame(()=>setTimeout(()=>stack.classList.add('aligned'),250));}
const menu=document.querySelector('.menu-button');
const nav=document.querySelector('.site-nav');
if(menu&&nav){menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});}
const scenarios={
  balanced:{title:'Illustrative baseline portfolio',copy:'All four workstreams have enough evidence for a differentiated governance decision.',decision:'Advance with differentiated controls',code:'DECISION-READY',gaps:[null,null,null,null],status:['advance','advance','advance','advance']},
  data:{title:'Data and compliance gap',copy:'Workstream 2 has an unresolved data-governance dependency. Treating it as sprint slippage would hide the actual decision.',decision:'Hold W2; escalate data authority',code:'GOVERNANCE HOLD',gaps:[null,'readiness',null,null],status:['advance','hold','advance','advance']},
  vendor:{title:'External dependency risk',copy:'Workstream 3 cannot commit to the roadmap until vendor delivery, integration ownership, and contingency are explicit.',decision:'Re-plan W3 at dependency boundary',code:'RE-PLAN',gaps:[null,null,'spend',null],status:['advance','advance','escalate','advance']},
  adoption:{title:'Adoption ownership gap',copy:'Workstream 4 is technically credible but lacks an R&D operating owner and change evidence. Production readiness is not adoption readiness.',decision:'Pause W4 for operating ownership',code:'OWNER REQUIRED',gaps:[null,null,null,'adoption'],status:['advance','advance','advance','hold']}
};
function applyScenario(key){
 const s=scenarios[key]; if(!s)return;
 document.querySelectorAll('[data-scenario]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.scenario===key)));
 const t=document.querySelector('#board-title'),c=document.querySelector('#board-copy'),d=document.querySelector('#decision-text'),code=document.querySelector('#decision-code');
 if(t)t.textContent=s.title;if(c)c.textContent=s.copy;if(d)d.textContent=s.decision;if(code)code.textContent=s.code;
 document.querySelectorAll('.workstream').forEach((ws,i)=>{
   ws.classList.remove('status-hold','status-escalate');
   if(s.status[i]==='hold')ws.classList.add('status-hold');
   if(s.status[i]==='escalate')ws.classList.add('status-escalate');
   const status=ws.querySelector('.workstream-status');status.textContent=s.status[i]==='advance'?'Advance with controls':s.status[i]==='hold'?'Hold for evidence':'Escalate dependency';
   ws.querySelectorAll('.mini-row').forEach(row=>{row.classList.toggle('is-gap',row.dataset.field===s.gaps[i]);row.style.setProperty('--v',row.dataset.field===s.gaps[i]?'34%':row.dataset.base);});
 });
}
document.querySelectorAll('[data-scenario]').forEach(b=>b.addEventListener('click',()=>applyScenario(b.dataset.scenario)));
