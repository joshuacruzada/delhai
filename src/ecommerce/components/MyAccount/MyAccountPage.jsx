import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { IconUserFilled, IconShoppingBagCheck } from '@tabler/icons-react';
import UpperBar from '../UpperBar'; // Import UpperBar here
import './MyAccountPage.css';

const MyAccountPage = () => {
  const location = useLocation();

  return (
    <div className="account-page-wrapper">
      <UpperBar />

      <div className="account-layout-container">
        <aside className="account-sidebar">
          <ul className="account-sidebar-menu">
            <li className={location.pathname.startsWith('/my-account') ? 'account-menu-item active' : 'account-menu-item'}>
              <Link to="/my-account/profile" className="account-menu-link">
                <IconUserFilled size={20} style={{ marginRight: '8px' }} />
                My Account
              </Link>
              <ul className="account-submenu">
                <li><Link to="/my-account/profile" className="account-submenu-link">Profile</Link></li>
                <li><Link to="/my-account/addresses" className="account-submenu-link">Addresses</Link></li>
                <li><Link to="/my-account/change-password" className="account-submenu-link">Change Password</Link></li>
              </ul>
            </li>

            <li className={location.pathname.startsWith('/my-purchase') ? 'account-menu-item active' : 'account-menu-item'}>
              <Link to="/my-account/my-purchase" className="account-menu-link">
                <IconShoppingBagCheck size={20} style={{ marginRight: '8px' }} />
                My Purchase
              </Link>
            </li>
          </ul>
        </aside>

        <main className="account-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MyAccountPage;
