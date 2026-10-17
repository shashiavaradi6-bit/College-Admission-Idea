import Link from 'next/link';
import { ArrowLeft, ArrowRight, LockKeyhole } from 'lucide-react';
const names: Record<string,string> = {
  'admin/colleges': 'Manage colleges',
  'admin/courses': 'Manage courses',
  'admin/seats': 'Seat records',
  'profile': 'Your profile',
  'deadlines': 'Deadlines',
  'courses': 'Explore courses',
  'settings': 'Settings',
  'admin': 'Administration',
  'applications': 'Application tracker',
  'admission-profile': 'Admission profile',
  'admission-guide': 'Admission guide',
  'compare': 'Compare colleges',
  'forgot-password': 'Reset your password',
  'about': 'About Campus Compass',
  'privacy': 'Privacy',
  'terms': 'Terms of use',
  'register': 'Create your account',
  'saved-colleges': 'Saved colleges',
  'dashboard': 'Your dashboard',
  'chat': 'Admission assistant',
  'cutoff-analysis': 'Cutoff analysis',
  'login': 'Log in',
  'admin/cutoffs': 'Manage cutoffs',
  'college-matches': 'College matches',
  'admin/data-imports': 'Data imports',
  'colleges': 'Explore colleges'
};
export default async function RoutePage({params}:{params:Promise<{slug:string[]}>}) {
 const {slug}=await params; const key=slug.join('/'); const title=names[key] ?? 'College information';
 const privateRoute=['dashboard','profile','admission-profile','college-matches','compare','cutoff-analysis','saved-colleges','applications','deadlines','chat','settings'].includes(key);
 const admin=key.startsWith('admin'); const auth=key==='login'||key==='register'||key==='forgot-password';
 return <main style={{minHeight:'100vh',background:'#f7f7f2',color:'#20333b',fontFamily:'Arial,sans-serif'}}><header style={{padding:'22px 7%',borderBottom:'1px solid #e2e7e1',display:'flex',justifyContent:'space-between'}}><Link href='/' style={{fontWeight:700,color:'#286e59'}}>◉ campuscompass</Link><Link href='/colleges'>Explore colleges →</Link></header><section style={{maxWidth:760,margin:'70px auto',padding:'0 24px'}}><Link href='/' style={{color:'#56796a',fontSize:13}}><ArrowLeft size={14} style={{verticalAlign:'middle'}}/> Home</Link><h1 style={{fontSize:42,letterSpacing:-1.5,margin:'24px 0 10px'}}>{title}</h1>
 {privateRoute?<div style={{marginTop:28,padding:24,background:'white',border:'1px solid #e2e7e1'}}><LockKeyhole size={23}/><h2>Student account setup required</h2><p>This area is reserved for a signed-in student. Supabase credentials and the verified authentication flow are not configured in this development workspace, so private records are not shown or stored here.</p><Link href='/register' style={{color:'#286e59',fontWeight:700}}>Review account setup <ArrowRight size={14} style={{verticalAlign:'middle'}}/></Link></div>:admin?<div style={{marginTop:28,padding:24,background:'white',border:'1px solid #e2e7e1'}}><LockKeyhole size={23}/><h2>Administrator access required</h2><p>Administrative data changes are disabled until server-side role authorization and a connected database are configured.</p><Link href='/' style={{color:'#286e59'}}>Return to discovery</Link></div>:auth?<div style={{marginTop:28,padding:24,background:'white',border:'1px solid #e2e7e1'}}><h2>Authentication is not connected</h2><p>Configure Supabase Auth before collecting account information. This page does not transmit or retain credentials.</p><Link href='/colleges' style={{color:'#286e59',fontWeight:700}}>Continue exploring without an account →</Link></div>:<div style={{marginTop:28,padding:24,background:'white',border:'1px solid #e2e7e1'}}><p>Explore course pathways and college options, then confirm eligibility, fees, current seat availability and deadlines with the official counselling authority.</p><p>Historical or demonstration information is not an admission prediction.</p><Link href='/colleges' style={{color:'#286e59',fontWeight:700}}>Browse colleges →</Link></div>}
 </section></main>
}

