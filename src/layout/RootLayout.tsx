import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import GeminiChat from '../components/GeminiChat'

const RootLayout = () => {
  return (
    <div>
      <Navbar/>
      <div className='pt-15'>
        <Outlet />
        <GeminiChat/>
      </div>
      <Footer/>
    </div>
  )
}

export default RootLayout