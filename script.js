document.addEventListener("DOMContentLoaded", () => {
  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener("click",(e)=>{
      const id = a.getAttribute("href");
      if (id.length>1 && document.querySelector(id)){
        e.preventDefault();
        document.querySelector(id).scrollIntoView({behavior:"smooth", block:"start"});
      }
    });
  });

  // Footer year
  const y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();

  // ----- Form handling (index + contact) -----
  const form = document.getElementById("lead-form") || document.getElementById("contactForm");
  const feedback = document.getElementById("formFeedback");
  if (!form) return;

  // Dev/demo prefill (local hosts or ?demo=1)
  const host = location.hostname;
  const IS_DEV = /^(localhost|127\.0\.0\.1|::1|0\.0\.0\.0)$/.test(host) || host.endsWith(".local") || host==="";
  const DEMO = new URLSearchParams(location.search).get("demo")==="1";
  const nameInput  = form.querySelector("#name");
  const emailInput = form.querySelector("#email");
  if ((IS_DEV||DEMO) && nameInput  && !nameInput.value)  nameInput.value  = "Zane McDermott";
  if ((IS_DEV||DEMO) && emailInput && !emailInput.value) emailInput.value = "zanemc@ymail.com";

  // UTM fields
  const qs = new URLSearchParams(location.search);
  ["utm_source","utm_medium","utm_campaign","utm_term","utm_content"].forEach(k=>{
    const el = document.getElementById(k); if (el) el.value = qs.get(k) || "";
  });

  // Metadata
  const siteUrlEl   = document.getElementById("site_url")   || form.querySelector('input[name="site_url"]');
  const pageTitleEl = document.getElementById("page_title") || form.querySelector('input[name="page_title"]');
  const referrerEl  = document.getElementById("referrer")   || form.querySelector('input[name="referrer"]');
  if (siteUrlEl)   siteUrlEl.value   = location.href;
  if (pageTitleEl) pageTitleEl.value = document.title || "";
  if (referrerEl)  referrerEl.value  = document.referrer || "";
  let submittedAt = document.getElementById("submitted_at");
  if (!submittedAt){
    submittedAt = document.createElement("input");
    submittedAt.type = "hidden"; submittedAt.name = "submitted_at"; submittedAt.id = "submitted_at";
    form.appendChild(submittedAt);
  }
  submittedAt.value = new Date().toISOString();

  // Submit to Formspree
  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    if (feedback){ feedback.textContent = "Sending…"; feedback.style.color = "#6b7280"; }

    try{
      const res = await fetch(form.action, { method:"POST", body:new FormData(form), headers:{ "Accept":"application/json" }});
      if (res.ok){
        const isContactPage = /contact\.html$/.test(location.pathname);
        if (isContactPage){
          setTimeout(()=>location.assign("thank-you.html"), 150);
        } else {
          if (feedback){ feedback.textContent = "Thanks! We’ll be in touch shortly."; feedback.style.color = "#16a34a"; }
          form.reset();
          if ((IS_DEV||DEMO) && nameInput)  nameInput.value  = "Zane McDermott";
          if ((IS_DEV||DEMO) && emailInput) emailInput.value = "zanemc@ymail.com";
          if (siteUrlEl)   siteUrlEl.value   = location.href;
          if (pageTitleEl) pageTitleEl.value = document.title || "";
          if (referrerEl)  referrerEl.value  = document.referrer || "";
          if (submittedAt) submittedAt.value = new Date().toISOString();
        }
        // Optional analytics (safe no-ops)
        window.plausible && plausible("Lead Submit");
        window.gtag && gtag("event","lead_submit",{page_title:document.title,page_path:location.pathname});
      }else{
        let msg="Something went wrong. Please try again.";
        try{ const r=await res.json(); msg=r?.errors?.[0]?.message||msg; }catch{}
        if (feedback){ feedback.textContent = msg; feedback.style.color = "#ef4444"; }
      }
    }catch(err){
      if (feedback){ feedback.textContent = "Network error. Please try again."; feedback.style.color = "#ef4444"; }
      console.error(err);
    }
  });
});
