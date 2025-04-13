import { matchPath, Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import GeminiChat from '../components/GeminiChat'

const RootLayout = () => {
	const currentPath = useLocation();
	const isNote = matchPath('/note',currentPath.pathname);
	const isNoteEdit = matchPath('/edit/:id',currentPath.pathname);
	const isNoteAdd = matchPath('/addnote',currentPath.pathname);



  return (
    <div>
      <Navbar/>
      <div className='pt-15'>
        <Outlet />
        {
          isNoteEdit || isNote || isNoteAdd? <GeminiChat/> : <></>
        }
        
      </div>
      <Footer/>
    </div>
  )
}

export default RootLayout