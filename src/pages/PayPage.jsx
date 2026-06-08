import { useState, useEffect } from "react";
import { CATEGORY_META } from "../utils/constants.js";
import { Badge, GlowButton, ScorePill, CategoryTag, SectionTitle, UniqueBadge } from "../components/UI.jsx";

const AI_API = "http://localhost:8000";
const HARDHAT_RPC = "http://127.0.0.1:8545";

const HARDHAT_ACCOUNTS = [
  { name: "Arjun Sharma",    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" },
  { name: "Priya Mehta",     address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" },
  { name: "Rohan Gupta",     address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" },
  { name: "Sneha Patil",     address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906" },
  { name: "Central Canteen", address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65" },
  { name: "Accounts Dept",   address: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc" },
];

const VENDORS = [
  { id:"v1", name:"Central Canteen",   category:"canteen", icon:"🍽", desc:"Main campus canteen",      toIdx:4 },
  { id:"v2", name:"Accounts Dept",     category:"fee",     icon:"🎓", desc:"Tuition & lab fees",       toIdx:5 },
  { id:"v3", name:"Techfest 2025",     category:"event",   icon:"🎟", desc:"Annual tech festival",     toIdx:4 },
  { id:"v4", name:"Library",           category:"library", icon:"📚", desc:"Library & printing",       toIdx:5 },
  { id:"v5", name:"Hostel Block A",    category:"hostel",  icon:"🏠", desc:"Hostel mess & maintenance",toIdx:4 },
  { id:"v6", name:"Campus Stationery", category:"canteen", icon:"✏️", desc:"Books & stationery",       toIdx:5 },
];

let rpcId = 1;
async function rpc(method, params=[]) {
  const r = await fetch(HARDHAT_RPC,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:rpcId++,method,params})});
  const d = await r.json();
  if(d.error) throw new Error(d.error.message);
  return d.result;
}

async function sendRealTx(fromAddr, toAddr, amountCPC) {
  const amountHex = "0x" + Math.floor(amountCPC * 1e15).toString(16);
  await rpc("hardhat_impersonateAccount",[fromAddr]);
  const txHash = await rpc("eth_sendTransaction",[{from:fromAddr,to:toAddr,value:amountHex,gas:"0x5208"}]);
  await rpc("evm_mine",[]);
  const receipt = await rpc("eth_getTransactionReceipt",[txHash]);
  return { txHash, blockNumber: parseInt(receipt.blockNumber,16), gasUsed: parseInt(receipt.gasUsed,16) };
}

async function getBalance(addr) {
  const hex = await rpc("eth_getBalance",[addr,"latest"]);
  return (parseInt(hex,16)/1e15).toFixed(1);
}

function StatusDot({online,label}){
  return(<div style={{display:"flex",alignItems:"center",gap:6}}>
    <div style={{width:8,height:8,borderRadius:"50%",background:online?"#10b981":"#ef4444",animation:online?"pulse 2s infinite":"none"}}/>
    <span style={{fontSize:11,color:online?"#10b981":"#ef4444"}}>{label} {online?"●online":"○offline"}</span>
  </div>);
}

function QRBox({vendor}){
  const size=90,cells=7;
  const pat=vendor?vendor.id.split("").map(c=>c.charCodeAt(0)):[1,2,3];
  return(<div style={{width:size,height:size,borderRadius:8,overflow:"hidden",border:"2px solid #374151",background:"#fff",padding:5}}>
    <svg width={size-10} height={size-10}>
      {Array.from({length:cells}).map((_,r)=>Array.from({length:cells}).map((_,c)=>{
        const v=(pat[(r*cells+c)%pat.length]+r+c)%3===0;
        const cw=(size-10)/cells;
        return v?<rect key={`${r}-${c}`} x={c*cw} y={r*cw} width={cw-1} height={cw-1} fill="#111"/>:null;
      }))}
    </svg>
  </div>);
}

export default function PayPage() {
  const [tab,setTab]=useState("qr");
  const [vendor,setVendor]=useState(null);
  const [senderIdx,setSenderIdx]=useState(0);
  const [recipientIdx,setRecipientIdx]=useState(1);
  const [amount,setAmount]=useState("");
  const [flow,setFlow]=useState("idle"); // idle|ai_scan|ai_done|chain|success|blocked|error
  const [aiRes,setAiRes]=useState(null);
  const [chainRes,setChainRes]=useState(null);
  const [errMsg,setErrMsg]=useState("");
  const [txLog,setTxLog]=useState([]);
  const [aiOnline,setAiOnline]=useState(false);
  const [chainOnline,setChainOnline]=useState(false);
  const [balances,setBalances]=useState({});

  useEffect(()=>{checkAll();const t=setInterval(checkAll,5000);return()=>clearInterval(t);},[]);

  async function checkAll(){
    try{const r=await fetch(`${AI_API}/api/health`,{signal:AbortSignal.timeout(2000)});setAiOnline(r.ok);}catch{setAiOnline(false);}
    try{await rpc("eth_blockNumber");setChainOnline(true);refreshBal();}catch{setChainOnline(false);}
  }

  async function refreshBal(){
    const b={};
    for(let i=0;i<6;i++){try{b[i]=await getBalance(HARDHAT_ACCOUNTS[i].address);}catch{}}
    setBalances(b);
  }

  function reset(){setFlow("idle");setAiRes(null);setChainRes(null);setErrMsg("");setAmount("");setVendor(null);}

  function logTx(entry){setTxLog(p=>[entry,...p.slice(0,49)]);}

  async function runAI(amt,cat,toAddr,toName){
    setFlow("ai_scan");
    const payload={
      from_address:HARDHAT_ACCOUNTS[senderIdx].address,
      from_name:HARDHAT_ACCOUNTS[senderIdx].name,
      to_address:toAddr,to_name:toName,
      amount:Number(amt),category:cat,
      recipient_is_new:false,
      recent_tx_count:txLog.filter(t=>Date.now()-(t.ts||0)<120000&&t.from===HARDHAT_ACCOUNTS[senderIdx].name).length,
      daily_spent_so_far:txLog.filter(t=>t.from===HARDHAT_ACCOUNTS[senderIdx].name&&!t.blocked).reduce((s,t)=>s+t.amount,0),
    };
    const r=await fetch(`${AI_API}/api/fraud-score`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    if(!r.ok) throw new Error("AI service error");
    const data=await r.json();
    setAiRes(data);
    setFlow(data.is_blocked?"blocked":"ai_done");
    if(data.is_blocked){logTx({txId:data.tx_id,from:HARDHAT_ACCOUNTS[senderIdx].name,to:toName,amount:Number(amt),category:cat,fraudScore:data.fraud_score,txHash:null,blockNumber:null,blocked:true,ms:data.processing_time_ms,ts:Date.now()});}
    return data;
  }

  async function runChain(amt,toAddr,ai){
    setFlow("chain");
    const chain=await sendRealTx(HARDHAT_ACCOUNTS[senderIdx].address,toAddr,Number(amt));
    await fetch(`${AI_API}/api/execute-transaction`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tx_id:ai.tx_id,from_address:HARDHAT_ACCOUNTS[senderIdx].address,to_address:toAddr,amount:Number(amt),category:"p2p",fraud_score:ai.fraud_score,is_blocked:false})}).catch(()=>{});
    setChainRes(chain);setFlow("success");refreshBal();
    return chain;
  }

  async function pay(amt,cat,toAddr,toName){
    if(!amt||Number(amt)<=0){setErrMsg("Enter a valid amount");return;}
    try{
      const ai=await runAI(amt,cat,toAddr,toName);
      if(ai.is_blocked) return;
      const chain=await runChain(amt,toAddr,ai);
      logTx({txId:ai.tx_id,from:HARDHAT_ACCOUNTS[senderIdx].name,to:toName,amount:Number(amt),category:cat,fraudScore:ai.fraud_score,txHash:chain.txHash,blockNumber:chain.blockNumber,blocked:false,ms:ai.processing_time_ms,ts:Date.now()});
    }catch(e){setFlow("error");setErrMsg(e.message||"Service offline");}
  }

  const riskBg=r=>r==="critical"?"#1a0a2e":r==="high"?"#1a0a0a":"#0a1a0f";
  const riskBorder=r=>r==="critical"?"#7e22ce":r==="high"?"#991b1b":"#166534";

  return(
    <div style={{padding:"24px 28px 40px"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <SectionTitle sub="Real Isolation Forest AI · Real Hardhat blockchain · Zero simulation">
          Pay &amp; Transfer
        </SectionTitle>
        <div style={{display:"flex",gap:14,alignItems:"center",flexWrap:"wrap"}}>
          <StatusDot online={aiOnline} label="FastAPI AI"/>
          <StatusDot online={chainOnline} label="Hardhat Chain"/>
        </div>
      </div>

      {/* Setup panel when offline */}
      {(!aiOnline||!chainOnline)&&(
        <div style={{background:"#1a1200",border:"1px solid #d97706",borderRadius:12,padding:"14px 18px",marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:700,color:"#fbbf24",marginBottom:10}}>⚡ Start services for real transactions</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {!aiOnline&&<div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#9ca3af",background:"#0a0d16",borderRadius:8,padding:"10px 12px",lineHeight:1.8}}>
              <div style={{color:"#f59e0b",marginBottom:4}}>Terminal 1 — AI Backend</div>
              cd campuschain/backend<br/>
              pip install -r requirements.txt<br/>
              uvicorn main:app --reload --port 8000
            </div>}
            {!chainOnline&&<div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#9ca3af",background:"#0a0d16",borderRadius:8,padding:"10px 12px",lineHeight:1.8}}>
              <div style={{color:"#10b981",marginBottom:4}}>Terminal 2 — Blockchain</div>
              cd campuschain<br/>
              npx hardhat node<br/>
              <div style={{color:"#6b7280",marginTop:4}}># Terminal 3 — Deploy</div>
              npx hardhat run scripts/localSetup.cjs --network localhost
            </div>}
          </div>
        </div>
      )}

      {/* Sender */}
      <div style={{marginBottom:18}}>
        <div style={{fontSize:10,color:"#4b5563",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Paying as</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {HARDHAT_ACCOUNTS.slice(0,4).map((acc,i)=>(
            <button key={i} onClick={()=>setSenderIdx(i)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",borderRadius:10,cursor:"pointer",border:senderIdx===i?"1px solid #6366f1":"1px solid #1f2937",background:senderIdx===i?"#1e1b4b":"#0f1117",fontFamily:"'Inter',sans-serif"}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:"#6366f133",border:"1px solid #6366f166",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#a5b4fc"}}>{acc.name.split(" ").map(w=>w[0]).join("")}</div>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:senderIdx===i?"#a5b4fc":"#9ca3af"}}>{acc.name.split(" ")[0]}</div>
                {chainOnline&&balances[i]&&<div style={{fontSize:10,color:"#10b981",fontFamily:"'Space Mono',monospace"}}>{balances[i]} CPC</div>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {[{id:"qr",l:"📷 QR Smart Pay",b:"Real AI+Chain"},{id:"p2p",l:"🤝 P2P Transfer",b:"Velocity Guard"},{id:"fee",l:"🎓 Fee Auto-Pay",b:"Smart Contract"}].map(t=>(
          <button key={t.id} onClick={()=>{setTab(t.id);reset();}} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 18px",borderRadius:10,cursor:"pointer",border:tab===t.id?"1px solid #4338ca":"1px solid #1f2937",background:tab===t.id?"#1e1b4b":"#0f1117",fontFamily:"'Inter',sans-serif"}}>
            <span style={{fontSize:13,fontWeight:700,color:tab===t.id?"#a5b4fc":"#9ca3af"}}>{t.l}</span>
            {tab===t.id&&<span style={{fontSize:9,padding:"2px 7px",borderRadius:20,background:"#10b98122",color:"#34d399",border:"1px solid #10b98144"}}>{t.b}</span>}
          </button>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
        {/* LEFT form */}
        <div>
          {/* QR Tab */}
          {tab==="qr"&&(
            <div style={{background:"#0f1117",border:"1px solid #1f2937",borderRadius:16,padding:"20px 22px"}}>
              <div style={{fontSize:14,fontWeight:700,color:"#e5e7eb",marginBottom:14}}>Select vendor</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
                {VENDORS.map(v=>(
                  <button key={v.id} onClick={()=>{setVendor(v);reset();}} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",borderRadius:10,cursor:"pointer",textAlign:"left",border:vendor?.id===v.id?`1px solid ${CATEGORY_META[v.category].color}`:"1px solid #1f2937",background:vendor?.id===v.id?CATEGORY_META[v.category].color+"22":"#080b14",fontFamily:"'Inter',sans-serif"}}>
                    <span style={{fontSize:20}}>{v.icon}</span>
                    <div><div style={{fontSize:11,fontWeight:600,color:"#e5e7eb"}}>{v.name}</div><div style={{fontSize:10,color:"#4b5563"}}>{v.desc}</div></div>
                  </button>
                ))}
              </div>
              {vendor&&<div style={{marginBottom:14}}>
                <div style={{fontSize:11,color:"#6b7280",marginBottom:6}}>Amount (CPC=₹) · Avg ₹{CATEGORY_META[vendor.category].avg} · Max ₹{CATEGORY_META[vendor.category].maxSingle.toLocaleString()}</div>
                <input type="number" value={amount} onChange={e=>{setAmount(e.target.value);setFlow("idle");}} placeholder={`e.g. ${CATEGORY_META[vendor.category].avg}`} style={{width:"100%",padding:"10px 14px",borderRadius:10,background:"#080b14",border:"1px solid #374151",color:"#f9fafb",fontSize:15,fontFamily:"'Space Mono',monospace"}}/>
              </div>}

              {flow==="idle"&&vendor&&amount&&<GlowButton onClick={()=>pay(amount,vendor.category,HARDHAT_ACCOUNTS[vendor.toIdx].address,vendor.name)} color="#7c3aed" style={{width:"100%"}}>📷 Scan &amp; Pay — Real AI</GlowButton>}
              {flow==="ai_scan"&&<div style={{background:"#0a0a1a",border:"1px solid #4338ca",borderRadius:10,padding:"14px",textAlign:"center"}}><div style={{fontSize:13,color:"#a5b4fc",marginBottom:4}}>🤖 Isolation Forest scanning...</div><div style={{fontSize:11,color:"#4b5563"}}>Real scikit-learn · FastAPI · localhost:8000</div></div>}
              {flow==="ai_done"&&aiRes&&<div>
                <div style={{background:riskBg(aiRes.risk_level),border:`1px solid ${riskBorder(aiRes.risk_level)}`,borderRadius:10,padding:"14px",marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <span style={{fontSize:13,fontWeight:700,color:"#e5e7eb"}}>Real AI Result</span>
                    <ScorePill score={aiRes.fraud_score}/>
                  </div>
                  <div style={{fontSize:10,color:"#4b5563",marginBottom:8,fontFamily:"'Space Mono',monospace"}}>Model raw: {aiRes.model_raw_score} · {aiRes.processing_time_ms?.toFixed(1)}ms</div>
                  {aiRes.reasons.slice(0,3).map((r,i)=><div key={i} style={{fontSize:11,color:"#fca5a5",marginBottom:3}}>⚠ {r}</div>)}
                  {aiRes.reasons.length===0&&<div style={{fontSize:11,color:"#86efac"}}>✓ Isolation Forest: No anomalies detected</div>}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <GlowButton onClick={()=>runChain(amount,HARDHAT_ACCOUNTS[vendor.toIdx].address,aiRes).then(c=>logTx({txId:aiRes.tx_id,from:HARDHAT_ACCOUNTS[senderIdx].name,to:vendor.name,amount:Number(amount),category:vendor.category,fraudScore:aiRes.fraud_score,txHash:c.txHash,blockNumber:c.blockNumber,blocked:false,ms:aiRes.processing_time_ms,ts:Date.now()}))} color="#10b981" style={{flex:1}}>⛓ Execute on Blockchain</GlowButton>
                  <GlowButton onClick={reset} color="#ef4444" outline style={{flex:1}}>✗ Cancel</GlowButton>
                </div>
              </div>}
              {flow==="chain"&&<div style={{background:"#0a1a0a",border:"1px solid #166534",borderRadius:10,padding:"14px",textAlign:"center"}}><div style={{fontSize:13,color:"#4ade80"}}>⛓ Writing to Hardhat blockchain...</div><div style={{fontSize:11,color:"#4b5563",marginTop:4}}>eth_sendTransaction → evm_mine → receipt</div></div>}
              {flow==="success"&&chainRes&&<div style={{background:"#052e16",border:"1px solid #166534",borderRadius:10,padding:"14px"}}>
                <div style={{fontSize:15,fontWeight:700,color:"#4ade80",marginBottom:10}}>✅ Real Transaction Confirmed!</div>
                {[["Amount",`₹${Number(amount).toLocaleString()} CPC`],["Tx Hash",chainRes.txHash?.slice(0,22)+"..."],["Block",`#${chainRes.blockNumber}`],["Gas",chainRes.gasUsed?.toLocaleString()],["AI Score",`${aiRes?.fraud_score}/100 · ${aiRes?.risk_level}`],["AI Time",`${aiRes?.processing_time_ms?.toFixed(1)}ms`]].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:"#6b7280"}}>{k}</span><span style={{fontSize:11,color:"#e5e7eb",fontFamily:"'Space Mono',monospace"}}>{v}</span></div>
                ))}
                <button onClick={reset} style={{marginTop:10,width:"100%",padding:"7px",borderRadius:8,background:"transparent",border:"1px solid #166534",color:"#4ade80",cursor:"pointer",fontSize:12}}>New payment</button>
              </div>}
              {flow==="blocked"&&aiRes&&<div style={{background:"#1a0a2e",border:"1px solid #7e22ce",borderRadius:10,padding:"14px"}}>
                <div style={{fontSize:14,fontWeight:700,color:"#e879f9",marginBottom:8}}>🚫 Blocked by Isolation Forest</div>
                <div style={{fontSize:12,color:"#a855f7",marginBottom:8}}>Score {aiRes.fraud_score}/100 — threshold: 75. Funds NOT deducted.</div>
                {aiRes.reasons.slice(0,3).map((r,i)=><div key={i} style={{fontSize:11,color:"#f87171",marginBottom:3}}>⚠ {r}</div>)}
                <button onClick={reset} style={{marginTop:10,width:"100%",padding:"7px",borderRadius:8,background:"transparent",border:"1px solid #7e22ce",color:"#e879f9",cursor:"pointer",fontSize:12}}>Try again</button>
              </div>}
              {flow==="error"&&<div style={{background:"#1a0a0a",border:"1px solid #991b1b",borderRadius:10,padding:"12px"}}>
                <div style={{fontSize:12,color:"#f87171",marginBottom:4}}>❌ {errMsg}</div>
                <div style={{fontSize:11,color:"#6b7280"}}>Start both services using the commands above</div>
                <button onClick={reset} style={{marginTop:6,fontSize:11,color:"#f87171",background:"transparent",border:"none",cursor:"pointer"}}>Retry</button>
              </div>}
            </div>
          )}

          {/* P2P Tab */}
          {tab==="p2p"&&(
            <div style={{background:"#0f1117",border:"1px solid #1f2937",borderRadius:16,padding:"20px 22px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <span style={{fontSize:14,fontWeight:700,color:"#e5e7eb"}}>P2P Transfer</span>
                <Badge color="#e879f9" bg="#3b0764" border="#7e22ce">Velocity Guard · Real AI</Badge>
              </div>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,color:"#6b7280",marginBottom:8}}>Send to</div>
                {HARDHAT_ACCOUNTS.slice(0,4).filter((_,i)=>i!==senderIdx).map((acc,_,arr)=>{
                  const realIdx=HARDHAT_ACCOUNTS.indexOf(acc);
                  return(<button key={acc.address} onClick={()=>setRecipientIdx(realIdx)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",marginBottom:6,borderRadius:10,cursor:"pointer",width:"100%",textAlign:"left",border:recipientIdx===realIdx?"1px solid #6366f1":"1px solid #1f2937",background:recipientIdx===realIdx?"#1e1b4b":"#080b14",fontFamily:"'Inter',sans-serif"}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:"#6366f133",border:"1px solid #6366f155",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#a5b4fc"}}>{acc.name.split(" ").map(w=>w[0]).join("")}</div>
                    <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:recipientIdx===realIdx?"#a5b4fc":"#9ca3af"}}>{acc.name}</div><div style={{fontSize:10,color:"#4b5563",fontFamily:"'Space Mono',monospace"}}>{acc.address.slice(0,18)}...</div></div>
                    {chainOnline&&balances[realIdx]&&<span style={{fontSize:11,color:"#10b981",fontFamily:"'Space Mono',monospace"}}>{balances[realIdx]} CPC</span>}
                  </button>);
                })}
              </div>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,color:"#6b7280",marginBottom:6}}>Amount (CPC=₹) · Max ₹1,000</div>
                <input type="number" value={amount} onChange={e=>{setAmount(e.target.value);setFlow("idle");}} placeholder="e.g. 200" style={{width:"100%",padding:"10px 14px",borderRadius:10,background:"#080b14",border:"1px solid #374151",color:"#f9fafb",fontSize:15,fontFamily:"'Space Mono',monospace"}}/>
              </div>
              {flow==="idle"&&amount&&<GlowButton onClick={()=>pay(amount,"p2p",HARDHAT_ACCOUNTS[recipientIdx].address,HARDHAT_ACCOUNTS[recipientIdx].name)} color="#3b82f6" style={{width:"100%"}}>🤝 Send with Real AI Check</GlowButton>}
              {flow==="ai_scan"&&<div style={{background:"#0a0a1a",border:"1px solid #4338ca",borderRadius:10,padding:"12px",textAlign:"center"}}><div style={{fontSize:13,color:"#a5b4fc"}}>🤖 Checking velocity patterns via Isolation Forest...</div></div>}
              {flow==="success"&&chainRes&&<div style={{color:"#4ade80",fontSize:13,fontWeight:700,padding:"12px",background:"#052e16",borderRadius:10}}>✅ Transfer confirmed! Block #{chainRes.blockNumber} · AI Score: {aiRes?.fraud_score}/100<button onClick={reset} style={{display:"block",marginTop:8,fontSize:11,color:"#4ade80",background:"transparent",border:"none",cursor:"pointer"}}>New transfer</button></div>}
              {flow==="blocked"&&<div style={{color:"#e879f9",fontSize:13,fontWeight:700,padding:"12px",background:"#1a0a2e",borderRadius:10,border:"1px solid #7e22ce"}}>🚫 Velocity fraud! Score {aiRes?.fraud_score}/100. Transfer blocked.<button onClick={reset} style={{display:"block",marginTop:8,fontSize:11,color:"#a855f7",background:"transparent",border:"none",cursor:"pointer"}}>Try again</button></div>}
              {flow==="error"&&<div style={{color:"#f87171",fontSize:12,padding:"10px",background:"#1a0a0a",borderRadius:10}}>❌ {errMsg}<button onClick={reset} style={{display:"block",marginTop:6,fontSize:11,color:"#f87171",background:"transparent",border:"none",cursor:"pointer"}}>Retry</button></div>}
            </div>
          )}

          {/* Fee Tab */}
          {tab==="fee"&&(
            <div style={{background:"#0f1117",border:"1px solid #1f2937",borderRadius:16,padding:"20px 22px"}}>
              <div style={{fontSize:14,fontWeight:700,color:"#e5e7eb",marginBottom:14}}>Upcoming fees</div>
              {[
                {name:"Semester Tuition Fee",amount:45000,due:"Dec 31, 2025",status:"pending",icon:"🎓",toIdx:5},
                {name:"Laboratory Charges",  amount:3500, due:"Dec 15, 2025",status:"pending",icon:"🔬",toIdx:5},
                {name:"Library Annual Fee",  amount:500,  due:"Jan 5, 2026", status:"scheduled",icon:"📚",toIdx:5},
                {name:"Hostel Maintenance Q4",amount:1200,due:"Dec 20, 2025",status:"paid",icon:"🏠",toIdx:4},
              ].map(fee=>(
                <div key={fee.name} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid #111827"}}>
                  <span style={{fontSize:20}}>{fee.icon}</span>
                  <div style={{flex:1}}><div style={{fontSize:13,color:"#e5e7eb",fontWeight:500}}>{fee.name}</div><div style={{fontSize:11,color:"#4b5563",marginTop:2}}>Due: {fee.due}</div></div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#f9fafb",fontFamily:"'Space Mono',monospace"}}>₹{fee.amount.toLocaleString()}</div>
                    <div style={{marginTop:4}}>
                      {fee.status==="paid"?<Badge color="#4ade80" bg="#052e16" border="#166534">✓ PAID</Badge>:fee.status==="scheduled"?<Badge color="#93c5fd" bg="#1e3a5f" border="#1e40af">⏰ AUTO</Badge>:<GlowButton color="#6366f1" style={{padding:"4px 12px",fontSize:11}} onClick={()=>{setTab("qr");setVendor(VENDORS[fee.toIdx===5?1:0]);setAmount(String(fee.amount));}}>Pay Now</GlowButton>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT info */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {tab==="qr"&&vendor&&(
            <div style={{background:"#0f1117",border:`1px solid ${CATEGORY_META[vendor.category].color}44`,borderRadius:16,padding:"18px 20px"}}>
              <div style={{fontSize:11,color:"#6b7280",marginBottom:10}}>Vendor QR</div>
              <div style={{display:"flex",gap:14,alignItems:"center"}}>
                <QRBox vendor={vendor}/>
                <div><div style={{fontSize:15,fontWeight:700,color:"#f9fafb"}}>{vendor.name}</div><div style={{fontSize:11,color:"#6b7280",marginTop:3}}>{vendor.desc}</div><div style={{marginTop:6}}><CategoryTag category={vendor.category}/></div><div style={{fontSize:10,color:"#4b5563",marginTop:6,fontFamily:"'Space Mono',monospace"}}>{HARDHAT_ACCOUNTS[vendor.toIdx].address.slice(0,22)}...</div></div>
              </div>
            </div>
          )}
          <div style={{background:"#080c18",border:"1px solid #1e3a5f",borderRadius:16,padding:"18px 20px",flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
              <span style={{fontSize:13,fontWeight:700,color:"#93c5fd"}}>What actually happens</span>
              <UniqueBadge/>
            </div>
            {[
              {n:"1",t:"You tap Pay",             d:"App reads your Hardhat wallet address",         c:"#3b82f6",b:null},
              {n:"2",t:"POST /api/fraud-score",   d:"FastAPI receives transaction data",             c:"#7c3aed",b:"localhost:8000"},
              {n:"3",t:"Isolation Forest runs",   d:"200-tree sklearn model — real ML, not fake",    c:"#f59e0b",b:"Real ML"},
              {n:"4",t:"Score 0–100 returned",    d:"With reasons, raw score, features used",        c:"#10b981",b:null},
              {n:"5",t:"eth_sendTransaction",     d:"JSON-RPC call to Hardhat node port 8545",       c:"#14b8a6",b:"localhost:8545"},
              {n:"6",t:"evm_mine → confirmed",    d:"Real block mined — real tx hash returned",      c:"#a855f7",b:"Real block"},
            ].map(s=>(
              <div key={s.n} style={{display:"flex",gap:10,marginBottom:10,alignItems:"flex-start"}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:s.c+"33",border:`1px solid ${s.c}66`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:s.c,flexShrink:0}}>{s.n}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:12,fontWeight:600,color:"#e5e7eb"}}>{s.t}</span>
                    {s.b&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:4,background:s.c+"22",color:s.c,border:`1px solid ${s.c}44`}}>{s.b}</span>}
                  </div>
                  <div style={{fontSize:11,color:"#6b7280"}}>{s.d}</div>
                </div>
              </div>
            ))}
            <div style={{marginTop:10,padding:"10px 12px",background:"#0a0a1a",borderRadius:8,border:"1px solid #3730a3"}}>
              <div style={{fontSize:11,color:"#a5b4fc"}}>★ AI checks <strong style={{color:"#c7d2fe"}}>BEFORE</strong> blockchain executes. Prevention, not detection. No other campus wallet does this.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Live TX Log */}
      <div style={{background:"#0f1117",border:"1px solid #1f2937",borderRadius:16,overflow:"hidden"}}>
        <div style={{padding:"14px 20px",borderBottom:"1px solid #1f2937",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:"#e5e7eb"}}>Live Transaction Log</div>
            <div style={{fontSize:11,color:"#4b5563",marginTop:2}}>Real blockchain tx hashes · Real AI scores · Real block numbers</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:txLog.length>0?"#10b981":"#374151",animation:txLog.length>0?"pulse 2s infinite":"none"}}/>
            <span style={{fontSize:11,color:"#4b5563"}}>{txLog.length} transactions</span>
          </div>
        </div>
        <div style={{maxHeight:260,overflowY:"auto"}}>
          {txLog.length===0&&<div style={{textAlign:"center",padding:"24px 0",color:"#374151",fontSize:12}}>No transactions yet — make a real payment above</div>}
          {txLog.map((tx,i)=>(
            <div key={i} style={{padding:"10px 16px",borderBottom:"1px solid #111827",background:tx.blocked?"#1a0a2e":i===0?"#0a1a0a":"transparent",animation:i===0?"fadeIn 0.4s ease":"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div><span style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#6b7280"}}>{tx.txId} · </span><span style={{fontSize:12,color:"#e5e7eb",fontWeight:500}}>{tx.from} → {tx.to}</span></div>
                <ScorePill score={tx.fraudScore}/>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                <span style={{fontFamily:"'Space Mono',monospace",fontSize:12,fontWeight:700,color:"#f9fafb"}}>₹{tx.amount.toLocaleString()} CPC</span>
                <CategoryTag category={tx.category}/>
                {tx.txHash&&<span style={{fontSize:9,color:"#4b5563",fontFamily:"'Space Mono',monospace"}}>{tx.txHash.slice(0,20)}...</span>}
                {tx.blockNumber&&<span style={{fontSize:9,color:"#166534",background:"#052e16",padding:"1px 6px",borderRadius:4}}>Block #{tx.blockNumber}</span>}
                {tx.blocked&&<span style={{fontSize:9,color:"#e879f9",background:"#3b0764",padding:"1px 6px",borderRadius:4}}>REVERSED · funds returned</span>}
                {tx.ms&&<span style={{fontSize:9,color:"#374151"}}>AI: {tx.ms.toFixed(0)}ms</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
