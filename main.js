/* =========================================================
   Shared interactions — nav, reveal, counters, lightbox
   ========================================================= */
(function(){
  "use strict";

  /* ---- Nav scroll state ---- */
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if(!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ---- Active link by filename ---- */
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a=>{
    const href = (a.getAttribute('href')||'').toLowerCase();
    if(href === page || (page==='' && href==='index.html')) a.classList.add('active');
  });

  /* ---- Mobile menu ---- */
  const burger = document.querySelector('.burger');
  const menu = document.querySelector('.mobile-menu');
  if(burger && menu){
    burger.addEventListener('click', ()=>{
      const open = menu.classList.toggle('open');
      burger.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
      menu.classList.remove('open');burger.classList.remove('open');document.body.style.overflow='';
    }));
  }

  /* ---- Reveal on scroll ---- */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revs = document.querySelectorAll('.reveal, .line-grow');
  if(reduce){
    revs.forEach(el=>el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, {threshold:.12, rootMargin:'0px 0px -8% 0px'});
    revs.forEach(el=>io.observe(el));
  }

  /* ---- Counters ---- */
  const counters = document.querySelectorAll('[data-count]');
  const fmt = (n, dec) => {
    return dec>0 ? n.toFixed(dec) : Math.round(n).toLocaleString('vi-VN');
  };
  const runCount = (el)=>{
    const target = parseFloat(el.dataset.count);
    const dec = (el.dataset.dec)?parseInt(el.dataset.dec):0;
    const dur = 1500; const t0 = performance.now();
    const step = (t)=>{
      const p = Math.min((t-t0)/dur,1);
      const eased = 1-Math.pow(1-p,3);
      el.textContent = fmt(target*eased, dec);
      if(p<1) requestAnimationFrame(step); else el.textContent = fmt(target,dec);
    };
    requestAnimationFrame(step);
  };
  if(counters.length){
    if(reduce){ counters.forEach(el=>el.textContent = fmt(parseFloat(el.dataset.count), el.dataset.dec?parseInt(el.dataset.dec):0)); }
    else{
      const cio = new IntersectionObserver((entries)=>{
        entries.forEach(e=>{ if(e.isIntersecting){ runCount(e.target); cio.unobserve(e.target); }});
      },{threshold:.5});
      counters.forEach(el=>cio.observe(el));
    }
  }

  /* ---- Parallax (subtle, [data-par]) ---- */
  if(!reduce){
    const pars = document.querySelectorAll('[data-par]');
    if(pars.length){
      let ticking=false;
      const upd=()=>{
        const vh = window.innerHeight;
        pars.forEach(el=>{
          const r = el.getBoundingClientRect();
          const speed = parseFloat(el.dataset.par)||.08;
          const off = (r.top + r.height/2 - vh/2) * -speed;
          el.style.transform = `translate3d(0,${off.toFixed(1)}px,0)`;
        });
        ticking=false;
      };
      window.addEventListener('scroll',()=>{ if(!ticking){requestAnimationFrame(upd);ticking=true;} },{passive:true});
      upd();
    }
  }

  /* ---- Lightbox ---- */
  const items = document.querySelectorAll('[data-lightbox]');
  if(items.length){
    const lb = document.createElement('div');
    lb.className='lightbox';
    lb.innerHTML = `
      <button class="lb-close" aria-label="Đóng">&times;</button>
      <button class="lb-nav lb-prev" aria-label="Trước">&#8249;</button>
      <figure class="lb-fig"><img alt=""><figcaption></figcaption></figure>
      <button class="lb-nav lb-next" aria-label="Sau">&#8250;</button>`;
    document.body.appendChild(lb);
    const lbImg = lb.querySelector('img');
    const lbCap = lb.querySelector('figcaption');
    const list = Array.from(items);
    let idx = 0;
    const show = (i)=>{
      idx = (i+list.length)%list.length;
      const el = list[idx];
      const src = el.dataset.lightbox;
      const cap = el.dataset.caption || el.getAttribute('alt') || '';
      lbImg.style.opacity=0;
      const im = new Image();
      im.onload=()=>{ lbImg.src=src; lbImg.style.opacity=1; };
      im.src=src;
      lbCap.textContent = cap;
    };
    const open=(i)=>{ show(i); lb.classList.add('open'); document.body.style.overflow='hidden'; };
    const close=()=>{ lb.classList.remove('open'); document.body.style.overflow=''; };
    list.forEach((el,i)=>{ el.style.cursor='zoom-in'; el.addEventListener('click',()=>open(i)); });
    lb.querySelector('.lb-close').addEventListener('click',close);
    lb.querySelector('.lb-next').addEventListener('click',()=>show(idx+1));
    lb.querySelector('.lb-prev').addEventListener('click',()=>show(idx-1));
    lb.addEventListener('click',(e)=>{ if(e.target===lb) close(); });
    document.addEventListener('keydown',(e)=>{
      if(!lb.classList.contains('open')) return;
      if(e.key==='Escape') close();
      if(e.key==='ArrowRight') show(idx+1);
      if(e.key==='ArrowLeft') show(idx-1);
    });
  }

  /* ---- Year ---- */
  document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());

})();
