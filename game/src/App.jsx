
import './App.css'
import {Router, Route} from "react-router-dom"
import JumpGame from './Game'
function App() {

  return (
    <>
     <Router>
      <Route path='/' element={<JumpGame />} />
     </Router>
    </>
  )
}

export default App
