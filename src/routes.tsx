import { createBrowserRouter } from 'react-router'
import { RequireAuth } from './auth'
import Layout from './components/Layout'
import Home from './pages/Home'
import DigitalFarmer from './pages/DigitalFarmer'
import HerdBook from './pages/HerdBook'
import Contact from './pages/Contact'
import FarmerDash from './pages/FarmerDash'
import HerdDash from './pages/HerdDash'
import Login from './pages/Login'

function ProtectedFarmer() {
  return (
    <RequireAuth>
      <FarmerDash />
    </RequireAuth>
  )
}

function ProtectedHerd() {
  return (
    <RequireAuth>
      <HerdDash />
    </RequireAuth>
  )
}

export const router = createBrowserRouter([
  { path: '/login', Component: Login },
  { path: '/app/farmer/*', Component: ProtectedFarmer },
  { path: '/app/herdbook/*', Component: ProtectedHerd },
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'digital-farmer', Component: DigitalFarmer },
      { path: 'digital-herd-book', Component: HerdBook },
      { path: 'contact', Component: Contact },
      { path: '*', Component: Home },
    ],
  },
])
