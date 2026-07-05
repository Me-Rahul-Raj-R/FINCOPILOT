import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Users, TrendingUp, Activity, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import Card from "../components/Card.jsx";
import Badge from "../components/Badge.jsx";
import StatTile from "../components/StatTile.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { useToast } from "../lib/ToastContext.jsx";

const av = n => ["var(--teal)","var(--gold)","var(--coral)","var(--violet)","var(--amber)"][n.charCodeAt(0)%5];
const initials = n => n.split(" ").map(p=>p[0]).slice(0,2).join("").toUpperCase();

export default function AdminPanel() {
  const { user } = useAuth();
  const toast = useToast();
  const [overview, setOverview] = useState(null);
  const [ud, setUd] = useState({ data:[], pagination:{page:1,pageSize:10,total:0,totalPages:1} });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  function loadAll(pg=page) {
    api.adminOverview().then(setOverview).catch(e=>toast.error(e.message));
    api.adminUsers(pg,10).then(setUd).catch(e=>toast.error(e.message)).finally(()=>setLoading(false));
  }

  useEffect(()=>loadAll(1),[]);
  useEffect(()=>{ api.adminUsers(page,10).then(setUd).catch(()=>{}); },[page]);

  async function toggleRole(u) {
    const next = u.role==="admin"?"user":"admin";
    setBusyId(u.id);
    try {
      await api.setUserRole(u.id, next);
      toast.success(`${u.name} is now ${next==="admin"?"an admin":"a regular user"}`);
      loadAll(page);
    } catch(err){ toast.error(err.message); }
    finally{ setBusyId(null); }
  }

  const { data:users, pagination:pag } = ud;

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Admin · Platform-wide view</span>
          <h1 className="page-title">Admin <span className="gradient-text">Panel</span></h1>
          <p className="page-sub">Cross-user analytics and role management. Regular users only see their own data — this view aggregates everyone's.</p>
        </div>
        <button className="btn btn-ghost" onClick={()=>loadAll(page)} style={{display:"flex",alignItems:"center",gap:7}}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {overview && (
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="grid grid-4" style={{marginBottom:22}}>
          <StatTile label="Total Users" value={overview.totalUsers} foot={`${overview.admins} admin(s)`} accent="var(--gold)" icon={Users} />
          <StatTile label="Applications Scored" value={overview.totalLoans} foot={`${overview.highRiskLoans} High risk`} accent="var(--teal)" icon={TrendingUp} />
          <StatTile label="Transactions Monitored" value={overview.totalTxns} foot={`${overview.blockedTxns} blocked/held`} accent="var(--coral)" icon={Activity} />
          <StatTile label="KYC Approval Rate" value={overview.kycApprovalRate} formatter={v=>`${v}%`} foot={`${overview.totalKyc} total attempts`} accent="var(--teal)" icon={ShieldAlert} />
        </motion.div>
      )}

      <Card title="Users" subtitle="Promote or demote accounts · You can't change your own role"
        right={<span className="tag-chip">{pag.total} total</span>}>
        {loading ? (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[1,2,3].map(i=><div key={i} className="skeleton" style={{height:54}} />)}
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="ledger">
                <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Joined</th><th></th></tr></thead>
                <tbody>
                  {users.map(u=>(
                    <motion.tr key={u.id} initial={{opacity:0}} animate={{opacity:1}}>
                      <td>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{ width:32,height:32,borderRadius:"50%",flexShrink:0,background:av(u.name),color:"var(--bg-base)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:11 }}>
                            {initials(u.name)}
                          </div>
                          <div>
                            <div style={{fontWeight:500,fontSize:13}}>{u.name}</div>
                            {u.id===user.id && <span style={{fontSize:10,color:"var(--text-muted)"}}>← you</span>}
                          </div>
                        </div>
                      </td>
                      <td className="mono" style={{fontSize:12}}>{u.email}</td>
                      <td><Badge tone={u.role}>{u.role}</Badge></td>
                      <td style={{color:"var(--text-muted)",fontSize:12}}>{new Date(u.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"2-digit"})}</td>
                      <td>
                        {u.id!==user.id && (
                          <button className="btn btn-ghost btn-sm" style={{display:"flex",alignItems:"center",gap:5}} disabled={busyId===u.id} onClick={()=>toggleRole(u)}>
                            <ShieldAlert size={12} />
                            {busyId===u.id?"Saving…":u.role==="admin"?"Demote":"Promote"}
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {users.length===0 && <EmptyState icon={Users} title="No users yet" sub="Sign up from the public registration page." />}
            </div>

            {pag.totalPages>1 && (
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:14}}>
                <span style={{fontSize:12,color:"var(--text-muted)"}}>Page {pag.page} of {pag.totalPages}</span>
                <div style={{display:"flex",gap:6}}>
                  <button className="btn btn-ghost btn-sm" disabled={page<=1} onClick={()=>setPage(p=>p-1)}><ChevronLeft size={14}/></button>
                  {Array.from({length:Math.min(5,pag.totalPages)},(_,i)=>i+1).map(p=>(
                    <button key={p} className="btn btn-ghost btn-sm" style={{background:p===page?"var(--bg-overlay)":"transparent",color:p===page?"var(--text-primary)":"var(--text-muted)"}} onClick={()=>setPage(p)}>{p}</button>
                  ))}
                  <button className="btn btn-ghost btn-sm" disabled={page>=pag.totalPages} onClick={()=>setPage(p=>p+1)}><ChevronRight size={14}/></button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
