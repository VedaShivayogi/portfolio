// Custom cursor
const cursor=document.getElementById('cursor');
const ring=document.getElementById('cursor-ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cursor.style.left=mx+'px';cursor.style.top=my+'px'});
(function animRing(){rx+=(mx-rx)*.12;ry+=(my-ry)*.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(animRing)})();

// Nav scroll
const nav=document.getElementById('nav');
const backTop=document.getElementById('backTop');
window.addEventListener('scroll',()=>{
  nav.classList.toggle('scrolled',scrollY>60);
  if(backTop)backTop.classList.toggle('show',scrollY>400);
});

// Mobile menu
const toggle=document.getElementById('menuToggle');
const mob=document.getElementById('mobileMenu');
toggle?.addEventListener('click',()=>mob.classList.toggle('open'));
mob?.querySelectorAll('.mobile-link').forEach(l=>l.addEventListener('click',()=>mob.classList.remove('open')));

// Reveal
const revObs=new IntersectionObserver(entries=>{
  entries.forEach((e,i)=>{
    if(e.isIntersecting){
      setTimeout(()=>{
        e.target.classList.add('visible');
        e.target.querySelectorAll('.bar-fill').forEach(b=>b.classList.add('animate'));
      },i*60);
      revObs.unobserve(e.target);
    }
  });
},{threshold:.08});
document.querySelectorAll('.reveal').forEach(el=>revObs.observe(el));

// Counter
const cObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const el=e.target,target=+el.dataset.target;let cur=0;
      const step=Math.ceil(target/40);
      const t=setInterval(()=>{cur=Math.min(cur+step,target);el.textContent=cur;if(cur>=target)clearInterval(t)},35);
      cObs.unobserve(el);
    }
  });
},{threshold:.5});
document.querySelectorAll('.stat-big[data-target]').forEach(el=>cObs.observe(el));

// Filter
document.querySelectorAll('.f-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.f-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const f=btn.dataset.filter;
    document.querySelectorAll('.proj-card').forEach(c=>{
      const cat=c.dataset.cat||'';
      c.classList.toggle('hidden',f!=='all'&&!cat.includes(f));
    });
  });
});

// Form
document.getElementById('contactForm')?.addEventListener('submit',e=>{
  e.preventDefault();
  const btn=e.target.querySelector('button[type="submit"]');
  btn.innerHTML='Message Sent! &nbsp;<i class="fas fa-check"></i>';
  btn.style.background='#059669';
  setTimeout(()=>{btn.innerHTML='Send Message &nbsp;<i class="fas fa-paper-plane"></i>';btn.style.background='';e.target.reset()},3000);
});

// ===== SCROLL PROGRESS =====
const prog=document.getElementById('scroll-progress');
window.addEventListener('scroll',()=>{
  const pct=(scrollY/(document.body.scrollHeight-innerHeight))*100;
  prog.style.width=pct+'%';
});

// ===== THREE.JS 3D BACKGROUND =====
(function(){
  const canvas=document.getElementById('three-canvas');
  if(!canvas||!window.THREE)return;
  const W=innerWidth,H=innerHeight;
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(W,H);
  renderer.setClearColor(0x000000,0);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(60,W/H,0.1,1000);
  camera.position.z=30;

  // Floating icosahedra
  const geos=[
    new THREE.IcosahedronGeometry(1.2,0),
    new THREE.OctahedronGeometry(1.0,0),
    new THREE.TetrahedronGeometry(0.9,0),
    new THREE.IcosahedronGeometry(0.6,0),
    new THREE.OctahedronGeometry(0.7,0),
  ];
  const mats=[
    new THREE.MeshBasicMaterial({color:0xc8f135,wireframe:true,transparent:true,opacity:0.18}),
    new THREE.MeshBasicMaterial({color:0x7c6af7,wireframe:true,transparent:true,opacity:0.15}),
    new THREE.MeshBasicMaterial({color:0x00d4aa,wireframe:true,transparent:true,opacity:0.14}),
    new THREE.MeshBasicMaterial({color:0xc8f135,wireframe:true,transparent:true,opacity:0.12}),
    new THREE.MeshBasicMaterial({color:0x9b8fff,wireframe:true,transparent:true,opacity:0.13}),
  ];
  const meshes=[];
  for(let i=0;i<22;i++){
    const gi=i%geos.length;
    const m=new THREE.Mesh(geos[gi],mats[gi].clone());
    m.position.set(
      (Math.random()-0.5)*60,
      (Math.random()-0.5)*50,
      (Math.random()-0.5)*20-5
    );
    const s=0.3+Math.random()*1.4;
    m.scale.setScalar(s);
    m.userData={
      rx:(.002+Math.random()*.004)*(Math.random()<.5?1:-1),
      ry:(.003+Math.random()*.005)*(Math.random()<.5?1:-1),
      floatSpeed:.0005+Math.random()*.001,
      floatOffset:Math.random()*Math.PI*2,
      baseY:m.position.y
    };
    scene.add(m);
    meshes.push(m);
  }

  // Particle dots
  const ptGeo=new THREE.BufferGeometry();
  const ptCount=200;
  const positions=new Float32Array(ptCount*3);
  for(let i=0;i<ptCount;i++){
    positions[i*3]=(Math.random()-0.5)*80;
    positions[i*3+1]=(Math.random()-0.5)*60;
    positions[i*3+2]=(Math.random()-0.5)*30-10;
  }
  ptGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const ptMat=new THREE.PointsMaterial({color:0xc8f135,size:0.15,transparent:true,opacity:0.5});
  const points=new THREE.Points(ptGeo,ptMat);
  scene.add(points);

  // Mouse parallax
  let mouseX=0,mouseY=0;
  document.addEventListener('mousemove',e=>{
    mouseX=(e.clientX/innerWidth-.5)*2;
    mouseY=(e.clientY/innerHeight-.5)*2;
  });

  let t=0;
  function animate(){
    requestAnimationFrame(animate);
    t+=0.01;
    meshes.forEach(m=>{
      m.rotation.x+=m.userData.rx;
      m.rotation.y+=m.userData.ry;
      m.position.y=m.userData.baseY+Math.sin(t*m.userData.floatSpeed*100+m.userData.floatOffset)*2;
    });
    points.rotation.y+=0.0003;
    camera.position.x+=(mouseX*4-camera.position.x)*0.04;
    camera.position.y+=(-mouseY*3-camera.position.y)*0.04;
    renderer.render(scene,camera);
  }
  animate();

  window.addEventListener('resize',()=>{
    renderer.setSize(innerWidth,innerHeight);
    camera.aspect=innerWidth/innerHeight;
    camera.updateProjectionMatrix();
  });
})();

// ===== 3D CARD TILT (proj + cert) =====
function addTilt(selector){
  document.querySelectorAll(selector).forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`translateY(-10px) rotateX(${-y*10}deg) rotateY(${x*10}deg) scale(1.03)`;
    });
    card.addEventListener('mouseleave',()=>{
      card.style.transform='';
    });
  });
}
addTilt('.proj-card');
addTilt('.cert-card');
addTilt('.skill-block');

// ===== 3D PHOTO TILT =====
const orbit=document.getElementById('profileOrbit');
if(orbit){
  document.addEventListener('mousemove',e=>{
    const cx=innerWidth/2,cy=innerHeight/2;
    const x=(e.clientX-cx)/cx;
    const y=(e.clientY-cy)/cy;
    orbit.style.transform=`rotateY(${x*14}deg) rotateX(${-y*10}deg)`;
  });
}

// ===== STAGGERED CARD ENTRY ANIMATIONS =====
const cardObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const cards=e.target.querySelectorAll('.proj-card:not(.hidden),.cert-card');
      cards.forEach((c,i)=>{
        setTimeout(()=>{
          c.classList.add('anim-in');
        },i*70);
      });
      cardObs.unobserve(e.target);
    }
  });
},{threshold:0.05});
document.querySelectorAll('.proj-grid,.certs-grid').forEach(el=>cardObs.observe(el));

// ===== FLOATING DOM PARTICLES IN HERO =====
(function spawnParticles(){
  const hero=document.getElementById('home');
  if(!hero)return;
  const colors=['#c8f135','#7c6af7','#00d4aa','#9b8fff','#f472b6'];
  function makeParticle(){
    const p=document.createElement('div');
    p.className='particle';
    const size=2+Math.random()*5;
    p.style.cssText=`
      width:${size}px;height:${size}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      left:${Math.random()*100}%;
      animation-duration:${6+Math.random()*8}s;
      animation-delay:${Math.random()*4}s;
      filter:blur(${Math.random()>.5?1:0}px);
      box-shadow:0 0 ${size*2}px currentColor;
    `;
    hero.appendChild(p);
    setTimeout(()=>p.remove(),(14+Math.random()*8)*1000);
  }
  for(let i=0;i<18;i++)setTimeout(makeParticle,i*300);
  setInterval(makeParticle,800);
})();

// ===== TAG HOVER 3D RIPPLE =====
document.querySelectorAll('.tag,.skill-pill,.proj-tags span').forEach(tag=>{
  tag.addEventListener('click',function(e){
    const r=this.getBoundingClientRect();
    const ripple=document.createElement('span');
    ripple.style.cssText=`
      position:absolute;border-radius:50%;
      background:rgba(200,241,53,0.3);
      width:60px;height:60px;
      left:${e.clientX-r.left-30}px;top:${e.clientY-r.top-30}px;
      transform:scale(0);transition:transform .5s,opacity .5s;
      pointer-events:none;z-index:10;
    `;
    this.style.position='relative';this.style.overflow='hidden';
    this.appendChild(ripple);
    requestAnimationFrame(()=>{ripple.style.transform='scale(3)';ripple.style.opacity='0'});
    setTimeout(()=>ripple.remove(),500);
  });
});
