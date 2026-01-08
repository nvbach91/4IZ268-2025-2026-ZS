import React from "react";
import Dashboard from "./components/Dashboard.jsx";
import Header from "./components/Header.jsx";
import ProfileModal from "./components/ProfileModal.jsx";
import useProfileModal from "./hooks/useProfileModal.jsx";
import useStoreSettings from "./store/useStoreSettings.jsx";

const arePreferencesValid = (settings) => {
    if (!settings || !settings.preferences) return false;
    const {age, height, weight, sensitivity} = settings.preferences;
    return age && height && weight && sensitivity;
}

function App() {
    const {isModalOpen, openModal, closeModal} = useProfileModal();
    const settings = useStoreSettings((state) => state.settings);
    
    const hasValidPreferences = arePreferencesValid(settings);

    return (
        <>
            {isModalOpen && <ProfileModal closeModal={closeModal} />}
            {/* dashboard pouze pokud jsou preferences */}
            {hasValidPreferences ? (
                <div>
                    <div className='p-8 flex flex-col gap-16'>
                        <Header openModal={openModal}/>
                        <Dashboard/>
                    </div>
                </div>
            ) : (
                <div className='fixed inset-0 bg-gray-900 bg-opacity-50 z-30 flex items-center justify-center'>
                    <div className='text-white text-center'>
                        <h2 className='text-2xl font-bold mb-4'>Setting up your preferences is necessary.</h2>
                        <p className='text-lg'>Please refresh the page and setup your preferences.</p>
                    </div>
                </div>
            )}
        </>
    )
}

export default App
