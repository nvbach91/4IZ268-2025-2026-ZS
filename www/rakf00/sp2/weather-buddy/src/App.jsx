import Dashboard from "./features/dashboard/Dashboard.jsx";
import Header from "./components/Header.jsx";

function App() {

  return (
    <>
        <div className='min-h-screen bg-slate-900'>
            <div className='p-8 flex flex-col gap-8'>
            <Header/>
            <Dashboard />
            </div>
        </div>
    </>
  )
}

export default App
