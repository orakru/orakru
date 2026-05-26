import { useState } from "react";

const SB_URL = "https://euziehksumoyxoewwqcb.supabase.co";
const SB_KEY = "sb_publishable_MSqiiUitK3RToywX5vFW4w_2AJpsxmY";

const SVCS = ["Hair","Barbering","Makeup","Nails","Lashes","Skincare","Medspa","Massage","Brows","Waxing"];
const PRC = ["$50–100","$100–200","$200–300","$300+"];
const SET = ["Salon Suite","Home-Based Studio","Traditional Business Setting","Mobile"];
const VIB = ["Calm & Focused","Fun & Chatty","Professional & Efficient","Creative & Expressive","Laid-back & Flexible","Spiritual & Intentional","Bold & Edgy","Warm & Nurturing"];
const DAY = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const EXP = ["Less than 1 year","1–3 years","3–5 years","5–10 years","10+ years"];
const HAIR = ["Fine / Straight","Wavy","Curly","Coily / Natural","Color-treated","Damaged / Transitioning","Loc'd","Extensions"];

const G = "#6B6B6B", BD = "#D4D0CB";
const serif = "Georgia,'Times New Roman',serif";
const sans = "'Helvetica Neue',Arial,sans-serif";

const Logo = ({sz=56}) => <div style={{fontFamily:serif,fontStyle:"italic",fontSize:sz,color:"#0A0A0A",lineHeight:1}}>Orakru</div>;
const Hr = () => <div style={{height:1,background:BD,margin:"18px 0"}}/>;
const Lbl = ({t}) => <div style={{fontSize:9,letterSpacing:"2.5px",textTransform:"uppercase",color:G,marginBottom:8,fontFamily:sans}}>{t}</div>;

const Btn = ({label,onClick,ghost,disabled}) => (
  <button onClick={onClick} disabled={disabled} style={{display:"block",width:"100%",padding:"15px",background:ghost?"transparent":"#0A0A0A",color:ghost?"#0A0A0A":"#fff",border:ghost?`1.5px solid ${BD}`:"none",fontSize:10,letterSpacing:"3px",textTransform:"uppercase",cursor:disabled?"not-allowed":"pointer",opacity:disabled?.45:1,fontFamily:sans,marginBottom:10}}>
    {label}
  </button>
);

const Input = ({label,val,set,type="text",ph,rows,max}) => (
  <div style={{marginBottom:18}}>
    <Lbl t={label}/>
    {rows
      ? <textarea value={val} onChange={e=>set(e.target.value)} placeholder={ph} maxLength={max} rows={rows} style={{width:"100%",padding:"8px 0",background:"transparent",border:"none",borderBottom:`1.5px solid ${BD}`,fontSize:14,outline:"none",resize:"none",fontFamily:sans,color:"#0A0A0A"}}/>
      : <input type={type} value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={{width:"100%",padding:"8px 0",background:"transparent",border:"none",borderBottom:`1.5px solid ${BD}`,fontSize:14,outline:"none",fontFamily:sans,color:"#0A0A0A"}}/>
    }
    {max && <div style={{textAlign:"right",fontSize:10,color:G}}>{(val||"").length}/{max}</div>}
  </div>
);

const Chips = ({opts,val,set,multi}) => (
  <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:20}}>
    {opts.map(o=>{
      const on = multi?(val||[]).includes(o):val===o;
      return <button key={o} onClick={()=>multi?set(on?(val||[]).filter(x=>x!==o):[...(val||[]),o]):set(on?"":o)} style={{padding:"7px 14px",background:on?"#0A0A0A":"transparent",color:on?"#fff":"#0A0A0A",border:`1.5px solid ${on?"#0A0A0A":BD}`,fontSize:11,cursor:"pointer",fontFamily:sans}}>{o}</button>;
    })}
  </div>
);

const Wrap = ({children}) => (
  <div style={{minHeight:"100vh",background:"#fff",display:"flex",justifyContent:"center"}}>
    <div style={{width:"100%",maxWidth:460,padding:"40px 28px"}}>{children}</div>
  </div>
);

export default function App() {
  const [scr,setScr] = useState("land");
  const [mode,setMode] = useState("signup");
  const [sess,setSess] = useState(null);
  const [role,setRole] = useState(null);
  const [prof,setProf] = useState(null);
  const [busy,setBusy] = useState(false);
  const [err,setErr] = useState("");
  const [em,setEm] = useState(""); const [pw,setPw] = useState("");
  const [ps,setPs] = useState(0); const [cs,setCs] = useState(0);
  const [pro,setPro] = useState({name:"",business_name:"",email:"",instagram:"",city:"",zip:"",services:[],years_experience:"",price_range:"",setting:"",vibe:"",availability:[],preferred_client:"",about_me:""});
  const [cli,setCli] = useState({name:"",email:"",city:"",zip:"",services_needed:[],hair_type:[],budget_range:"",preferred_setting:"",vibe_preference:"",availability:[],about_me:""});
  const sp=(k,v)=>setPro(f=>({...f,[k]:v}));
  const sc=(k,v)=>setCli(f=>({...f,[k]:v}));

  const doAuth = async () => {
    setBusy(true); setErr("");
    try {
      const ep = mode==="signup" ? "/auth/v1/signup" : "/auth/v1/token?grant_type=password";
      const res = await fetch(SB_URL+ep,{method:"POST",headers:{"Content-Type":"application/json","apikey":SB_KEY},body:JSON.stringify({email:em,password:pw})});
      const d = await res.json();
      if(d.error||d.error_description){setErr(d.error_description||d.error?.message||"Error");}
      else {
        const tok=d.access_token, uid=d.user?.id;
        setSess({tok,uid});
        const [pr,cl] = await Promise.all([
          fetch(`${SB_URL}/rest/v1/pros?user_id=eq.${uid}&select=*`,{headers:{"apikey":SB_KEY,"Authorization":`Bearer ${tok}`}}).then(r=>r.json()),
          fetch(`${SB_URL}/rest/v1/clients?user_id=eq.${uid}&select=*`,{headers:{"apikey":SB_KEY,"Authorization":`Bearer ${tok}`}}).then(r=>r.json()),
        ]);
        if(Array.isArray(pr)&&pr.length){setRole("pro");setProf(pr[0]);setScr("dash");}
        else if(Array.isArray(cl)&&cl.length){setRole("client");setProf(cl[0]);setScr("dash");}
        else setScr("role");
      }
    } catch(e){setErr("Something went wrong: "+e.message);}
    setBusy(false);
  };

  const savePro = async()=>{
    setBusy(true);
    await fetch(`${SB_URL}/rest/v1/pros`,{method:"POST",headers:{"Content-Type":"application/json","apikey":SB_KEY,"Authorization":`Bearer ${sess.tok}`,"Prefer":"resolution=merge-duplicates"},body:JSON.stringify({...pro,user_id:sess.uid})});
    setProf(pro);setRole("pro");setScr("dash");setBusy(false);
  };

  const saveCli = async()=>{
    setBusy(true);
    await fetch(`${SB_URL}/rest/v1/clients`,{method:"POST",headers:{"Content-Type":"application/json","apikey":SB_KEY,"Authorization":`Bearer ${sess.tok}`,"Prefer":"resolution=merge-duplicates"},body:JSON.stringify({...cli,user_id:sess.uid})});
    setProf(cli);setRole("client");setScr("dash");setBusy(false);
  };

  const logout = async()=>{
    if(sess?.tok) await fetch(SB_URL+"/auth/v1/logout",{method:"POST",headers:{"Content-Type":"application/json","apikey":SB_KEY,"Authorization":`Bearer ${sess.tok}`}});
    setSess(null);setRole(null);setProf(null);setScr("land");setEm("");setPw("");setPs(0);setCs(0);
  };

  const proSteps = [
    {title:"Let's start with the basics.",valid:pro.name&&pro.email,fields:<><Input label="Your Name" val={pro.name} set={v=>sp("name",v)}/><Input label="Business Name (optional)" val={pro.business_name} set={v=>sp("business_name",v)}/><Input label="Email" val={pro.email} set={v=>sp("email",v)} type="email"/><Input label="Instagram (optional)" val={pro.instagram} set={v=>sp("instagram",v)} ph="@handle"/></>},
    {title:"Where are you based?",valid:pro.city&&pro.zip&&pro.setting,fields:<><Input label="City" val={pro.city} set={v=>sp("city",v)}/><Input label="Zip Code" val={pro.zip} set={v=>sp("zip",v)}/><Lbl t="Your Setting"/><Chips opts={SET} val={pro.setting} set={v=>sp("setting",v)}/></>},
    {title:"What do you do?",valid:pro.services.length>0&&pro.years_experience,fields:<><Lbl t="Services Offered"/><Chips opts={SVCS} val={pro.services} set={v=>sp("services",v)} multi/><Lbl t="Years of Experience"/><Chips opts={EXP} val={pro.years_experience} set={v=>sp("years_experience",v)}/></>},
    {title:"Let's talk money.",valid:pro.price_range,fields:<><Lbl t="Your Typical Price Range"/><Chips opts={PRC} val={pro.price_range} set={v=>sp("price_range",v)}/><p style={{fontSize:12,color:G,lineHeight:1.6,fontFamily:sans}}>Transparency = better matches. Clients who fit your rates, every time.</p></>},
    {title:"What's your vibe?",valid:pro.vibe&&pro.availability.length>0,fields:<><Lbl t="Your Vibe"/><Chips opts={VIB} val={pro.vibe} set={v=>sp("vibe",v)}/><Lbl t="Availability"/><Chips opts={DAY} val={pro.availability} set={v=>sp("availability",v)} multi/></>},
    {title:"Almost done.",valid:pro.about_me.length>0,fields:<><Input label="About Me" val={pro.about_me} set={v=>sp("about_me",v)} ph="Your story, your specialty, what makes working with you different..." rows={5} max={300}/><Input label="Ideal Client (optional)" val={pro.preferred_client} set={v=>sp("preferred_client",v)} ph="Who you work best with..." rows={3}/></>},
  ];

  const clientSteps = [
    {title:"Nice to meet you.",valid:cli.name&&cli.email,fields:<><Input label="Your Name" val={cli.name} set={v=>sc("name",v)}/><Input label="Email" val={cli.email} set={v=>sc("email",v)} type="email"/></>},
    {title:"Where are you located?",valid:cli.city&&cli.zip,fields:<><Input label="City" val={cli.city} set={v=>sc("city",v)}/><Input label="Zip Code" val={cli.zip} set={v=>sc("zip",v)}/></>},
    {title:"What are you looking for?",valid:cli.services_needed.length>0,fields:<><Lbl t="Services Needed"/><Chips opts={SVCS} val={cli.services_needed} set={v=>sc("services_needed",v)} multi/><Lbl t="Hair Type (if applicable)"/><Chips opts={HAIR} val={cli.hair_type} set={v=>sc("hair_type",v)} multi/></>},
    {title:"Budget & setting.",valid:cli.budget_range&&cli.preferred_setting,fields:<><Lbl t="Your Budget"/><Chips opts={PRC} val={cli.budget_range} set={v=>sc("budget_range",v)}/><Lbl t="Preferred Setting"/><Chips opts={SET} val={cli.preferred_setting} set={v=>sc("preferred_setting",v)}/></>},
    {title:"Your vibe.",valid:cli.vibe_preference&&cli.availability.length>0,fields:<><Lbl t="The energy you're looking for"/><Chips opts={VIB} val={cli.vibe_preference} set={v=>sc("vibe_preference",v)}/><Lbl t="Your Availability"/><Chips opts={DAY} val={cli.availability} set={v=>sc("availability",v)} multi/></>},
    {title:"Tell us about yourself.",valid:cli.about_me.length>0,fields:<><Input label="About Me" val={cli.about_me} set={v=>sc("about_me",v)} ph="Who you are, what you've been putting up with, what you actually want..." rows={5} max={300}/></>},
  ];

  if(scr==="land") return <Wrap>
    <div style={{paddingTop:60,paddingBottom:40,minHeight:"90vh",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
      <div>
        <div style={{fontSize:9,letterSpacing:"4px",color:G,marginBottom:18,fontFamily:sans}}>BEAUTY MATCHMAKING · CONNECTICUT</div>
        <Logo sz={66}/>
        <Hr/>
        <div style={{fontFamily:serif,fontSize:26,fontWeight:300,lineHeight:1.5,marginBottom:14}}>leave your beauty situationship. <em>for good.</em></div>
        <p style={{fontSize:14,lineHeight:1.9,color:G,marginBottom:10,fontFamily:sans}}>We match you with a beauty pro who actually fits — your vibe, your budget, your energy. No more wrong chairs. No more guilt tipping. Just your actual perfect match.</p>
        <p style={{fontSize:13,lineHeight:1.7,color:G,fontFamily:sans}}>Personally matched. No algorithm. No fees to join.</p>
      </div>
      <div style={{marginTop:40}}>
        <Btn label="Join Free" onClick={()=>{setMode("signup");setScr("auth");}}/>
        <Btn label="Sign In" ghost onClick={()=>{setMode("login");setScr("auth");}}/>
        <div style={{textAlign:"center",fontSize:9,letterSpacing:"2px",color:G,fontFamily:sans,marginTop:10}}>CT LAUNCHING NOW · @JOINORAKRU</div>
      </div>
    </div>
  </Wrap>;

  if(scr==="auth") return <Wrap>
    <button onClick={()=>setScr("land")} style={{background:"none",border:"none",fontSize:10,letterSpacing:"2px",color:G,cursor:"pointer",marginBottom:28,padding:0,fontFamily:sans}}>← BACK</button>
    <Logo sz={42}/>
    <Hr/>
    <div style={{fontFamily:serif,fontSize:20,fontStyle:"italic",marginBottom:22}}>{mode==="signup"?"Create your account.":"Welcome back."}</div>
    <Input label="Email" val={em} set={setEm} type="email" ph="your@email.com"/>
    <Input label="Password" val={pw} set={setPw} type="password" ph="at least 6 characters"/>
    {err&&<div style={{color:"#c0392b",fontSize:12,marginBottom:12,fontFamily:sans}}>{err}</div>}
    <Btn label={busy?"...":mode==="signup"?"Create Account":"Sign In"} onClick={doAuth} disabled={busy||!em||!pw}/>
    <div style={{textAlign:"center",fontSize:12,color:G,cursor:"pointer",fontFamily:sans}} onClick={()=>setMode(mode==="signup"?"login":"signup")}>
      {mode==="signup"?"Already have an account? Sign in":"New here? Join free"}
    </div>
  </Wrap>;

  if(scr==="role") return <Wrap>
    <Logo sz={42}/>
    <Hr/>
    <div style={{fontFamily:serif,fontSize:22,fontStyle:"italic",marginBottom:6,textAlign:"center"}}>I am a...</div>
    <p style={{fontSize:12,color:G,textAlign:"center",marginBottom:26,fontFamily:sans}}>Choose your role to get started</p>
    {[{r:"pro",t:"Beauty Pro",d:"Stylist, barber, esthetician, nail tech, lash artist — any beauty professional seeking the right clients."},{r:"client",t:"Client",d:"Done with the wrong chair. Ready for a pro who actually gets you."}].map(({r,t,d})=>(
      <button key={r} onClick={()=>{setRole(r);setScr("q");setPs(0);setCs(0);}} style={{width:"100%",padding:"26px 20px",border:`1.5px solid ${BD}`,background:"transparent",cursor:"pointer",textAlign:"left",marginBottom:14,display:"block"}}>
        <div style={{fontFamily:serif,fontSize:24,fontStyle:"italic",marginBottom:6}}>{t}</div>
        <div style={{fontSize:12,color:G,lineHeight:1.6,fontFamily:sans}}>{d}</div>
      </button>
    ))}
  </Wrap>;

  if(scr==="q"&&role==="pro"){
    const s=proSteps[ps];
    return <Wrap>
      <div style={{fontSize:9,letterSpacing:"3px",color:G,marginBottom:10,fontFamily:sans}}>STEP {ps+1} OF {proSteps.length} · PRO PROFILE</div>
      <div style={{display:"flex",gap:4,marginBottom:22}}>{proSteps.map((_,i)=><div key={i} style={{flex:1,height:2,background:i<=ps?"#0A0A0A":"#E8E6E3"}}/>)}</div>
      <div style={{fontFamily:serif,fontSize:22,fontStyle:"italic",marginBottom:20}}>{s.title}</div>
      {s.fields}
      <div style={{display:"flex",gap:10}}>
        {ps>0&&<Btn label="Back" ghost onClick={()=>setPs(p=>p-1)}/>}
        <Btn label={busy?"Saving...":ps===proSteps.length-1?"Complete Profile":"Continue"} onClick={()=>ps===proSteps.length-1?savePro():setPs(p=>p+1)} disabled={!s.valid||busy}/>
      </div>
    </Wrap>;
  }

  if(scr==="q"&&role==="client"){
    const s=clientSteps[cs];
    return <Wrap>
      <div style={{fontSize:9,letterSpacing:"3px",color:G,marginBottom:10,fontFamily:sans}}>STEP {cs+1} OF {clientSteps.length} · CLIENT PROFILE</div>
      <div style={{display:"flex",gap:4,marginBottom:22}}>{clientSteps.map((_,i)=><div key={i} style={{flex:1,height:2,background:i<=cs?"#0A0A0A":"#E8E6E3"}}/>)}</div>
      <div style={{fontFamily:serif,fontSize:22,fontStyle:"italic",marginBottom:20}}>{s.title}</div>
      {s.fields}
      <div style={{display:"flex",gap:10}}>
        {cs>0&&<Btn label="Back" ghost onClick={()=>setCs(p=>p-1)}/>}
        <Btn label={busy?"Saving...":cs===clientSteps.length-1?"Complete Profile":"Continue"} onClick={()=>cs===clientSteps.length-1?saveCli():setCs(p=>p+1)} disabled={!s.valid||busy}/>
      </div>
    </Wrap>;
  }

  if(scr==="dash"){
    const isPro=role==="pro";
    const pairs=isPro?[["Setting",prof.setting],["Price Range",prof.price_range],["Experience",prof.years_experience],["Vibe",prof.vibe]]:[["Budget",prof.budget_range],["Setting",prof.preferred_setting],["Vibe",prof.vibe_preference],["Location",prof.city]];
    return <Wrap>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:26}}>
        <Logo sz={30}/>
        <button onClick={logout} style={{background:"none",border:"none",fontSize:9,letterSpacing:"2px",color:G,cursor:"pointer",fontFamily:sans}}>SIGN OUT</button>
      </div>
      <div style={{fontSize:9,letterSpacing:"3px",color:G,marginBottom:4,fontFamily:sans}}>{isPro?"PRO PROFILE":"CLIENT PROFILE"}</div>
      <div style={{fontFamily:serif,fontSize:28,fontStyle:"italic",marginBottom:4}}>{prof.name}</div>
      {prof.business_name&&<div style={{fontSize:13,color:G,marginBottom:14,fontFamily:sans}}>{prof.business_name}</div>}
      <Hr/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
        {pairs.map(([l,v])=>(
          <div key={l} style={{padding:12,border:`1px solid ${BD}`}}>
            <div style={{fontSize:8,letterSpacing:"2px",color:G,marginBottom:4,fontFamily:sans}}>{l.toUpperCase()}</div>
            <div style={{fontSize:12,fontFamily:sans}}>{v||"—"}</div>
          </div>
        ))}
      </div>
      {prof.about_me&&<><div style={{fontSize:9,letterSpacing:"2.5px",textTransform:"uppercase",color:G,marginBottom:6,fontFamily:sans}}>About</div><p style={{fontSize:13,lineHeight:1.7,color:G,marginBottom:18,fontFamily:sans}}>{prof.about_me}</p></>}
      <Hr/>
      <div style={{textAlign:"center",padding:"20px 0"}}>
        <div style={{fontFamily:serif,fontSize:20,fontStyle:"italic",marginBottom:8}}>{isPro?"Your matches are being curated.":"We're finding your match."}</div>
        <p style={{fontSize:12,color:G,lineHeight:1.7,fontFamily:sans}}>{isPro?"Orakru personally reviews every match. You'll be notified when a client is ready for you.":"Your profile is live. We're handpicking pros in your area. Your perfect match is coming."}</p>
      </div>
    </Wrap>;
  }

  return null;
}
