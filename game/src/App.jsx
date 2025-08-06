
import './App.css'
import  {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import JumpGame from './Game'
function App() {

  return (
    <>
     <Routes>
      <Route path='/' element={<JumpGame />} />
     </Routes>
    </>
  )
}

export default App
