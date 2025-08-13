
import './App.css'
import  {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import NinjaAdventure from './Game';
function App() {

  return (
    <>
     <Routes>
      <Route path='/' element={<NinjaAdventure />} />
     </Routes>
    </>
  )
}

export default App
