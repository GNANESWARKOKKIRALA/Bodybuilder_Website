import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout = ({ isAdmin = false }) => {
  return (
    <div className="min-h-screen bg-dark-950">
      <Sidebar isAdmin={isAdmin} />
      <main className="lg:ml-[280px] min-h-screen pb-20 lg:pb-0">
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
