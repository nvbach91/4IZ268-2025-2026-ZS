import Dashboard from "./components/Dashboard.jsx";
import Header from "./components/Header.jsx";

function App() {

  return (
    <>
        <div className='min-h-screen bg-slate-900'>
            <div className='p-8 flex flex-col gap-16'>
            <Header/>
            <Dashboard />
            </div>
        </div>
    </>
  )
}

export default App
