import { Link, useLocation } from 'react-router-dom'
import { ArrowUpRight, LogOut } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import VectraLogo from '../../../assets/VectraLogo.png'

const links = [
  { to: '/', label: 'Overview' },
  { to: '/chat', label: 'Workspace' },
  { to: '/credentials', label: 'API keys' },
  { to: '/account', label: 'Account' },
]

const Navbar = () => {
  const { user, loading, logout } = useAuth()
  const location = useLocation()
  const initial = (user?.name || user?.username || 'V').slice(0, 1).toUpperCase()

  return (
    <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between border-b border-white/8 bg-black px-6 py-4 lg:px-16">
      <Link to="/" className="flex items-center">
      <img src={VectraLogo} alt="Vectra Logo" className='h-10 w-auto object-contain sm:h-12'/></Link>
      <nav className="hidden rounded-full border border-white/8 bg-black/20 p-1 md:flex">{links.map((link) => <Link key={link.to} to={link.to} className={`rounded-full px-4 py-2 text-xs transition ${location.pathname === link.to ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white'}`}>{link.label}</Link>)}</nav>
      <div className="flex items-center gap-3">{loading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/15 border-t-white" /> : user ? <><span className="hidden text-xs text-slate-300 sm:inline">{user.name || user.username || 'Workspace'}</span><span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/8 text-xs font-semibold text-white">{initial}</span><button onClick={logout} className="text-white/45 hover:text-white" title="Sign out"><LogOut size={16} /></button></> : <Link to="/login" className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-950">Sign in <ArrowUpRight size={13} /></Link>}</div>
    </header>
  )
}

export default Navbar
