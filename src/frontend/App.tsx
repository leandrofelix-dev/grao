import { Route, Routes } from 'react-router';
import { Layout } from './components/Layout.js';
import { Feed } from './pages/Feed.js';
import { Admin } from './pages/Admin.js';
import { Upload } from './pages/Upload.js';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>
    </Layout>
  );
}
