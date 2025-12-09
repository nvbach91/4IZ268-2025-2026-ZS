import React from "react";
import Dashboard from "./components/Dashboard.jsx";
import Header from "./components/Header.jsx";
import ProfileModal from "./components/ProfileModal.jsx";
import useProfileModal from "./hooks/useProfileModal.jsx";

function App() {
    const {isModalOpen, openModal,closeModal} = useProfileModal();
  return (
      <>
          {isModalOpen && <ProfileModal closeModal={closeModal} />}
          <div className='min-h-screen bg-slate-900'>
              <div className='p-8 flex flex-col gap-16'>
                  <Header openModal={openModal}/>
                  <Dashboard/>
              </div>
          </div>
      </>
  )
}

export default App
