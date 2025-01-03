// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import CreatePost from './pages/CreatePost'
import PostDetail from './pages/PostDetail'
import Profile from './pages/Profile'
import VerifyEmail from './pages/VerifyEmail'
import EditPost from './pages/EditPost'
import Discover from './pages/Discover'
import Topics from './pages/Topics'
import Ranking from './pages/Ranking'
import Settings from './pages/Settings'
import Messages from './pages/Messages';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/post/:id" element={<PostDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/edit-post/:id" element={<EditPost />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/topics" element={<Topics />} />
              <Route path="/ranking" element={<Ranking />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App