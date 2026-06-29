import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import WarehouseManagement from './pages/WarehouseManagement.jsx'
import EmployeeDetails from './pages/EmployeeDetails.jsx'
import CreateItem from './pages/CreateItem.jsx'
import GeneratedQRList from './pages/GeneratedQRList.jsx'
import LabelPrinting from './pages/LabelPrinting.jsx'
import ScanResult from './pages/ScanResult.jsx'
import Settings from './pages/Settings.jsx'


const App = () => {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Navigate to="/home" />} />
        <Route path='/home' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/employee' element={<EmployeeDetails />} />
        <Route path='/create-item' element={<CreateItem />} />
        <Route path='/warehouse' element={<WarehouseManagement />} />
        <Route path='/generated-qrs' element={<GeneratedQRList />} />
        <Route path='/labels' element={<LabelPrinting />} />
        <Route path='/settings' element={<Settings />} />
        <Route path='/scan/:id' element={<ScanResult />} />
      </Routes>
    </div>
  )
}

export default App
