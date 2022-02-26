import React, { useState } from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import { Account } from "./Accounts";

// Admin
import AdminLogin from './views/admin/login/Login';
import AdminRegister from './views/admin/register/Register';
import AdminDashboard from './views/admin/dashboard/Dashboard';
import AdminDevices from './views/admin/device/Device';
import Gallery from './views/admin/gallery/Gallery';

import GalleryUser from './views/users/gallery/GalleryUser';
import ChangePassword from './views/admin/change-password/ChangePassword';
import ForgetPassword from './views/users/forget-password/ForgetPassword';
import Play from './views/users/play-video/Play';
import Verify from './views/users/verify/Verify';
import EmailVerify from './views/users/verify/email/EmailVerify';
import Device from './views/users/device/Device';

function App() {
  const [role, setRole] = useState(null);
  const [deviceId, setDeviceId] = useState('');
  const [userName] = useState('');
  const [time] = useState(100);

  return (
    <Router>
      <Account>
        <div className="App">

          <div className="wrapper d-flex align-items-center flex-column">
            <Switch>

              <Route path="/" exact={true}>
                <AdminLogin  />
              </Route>

              <Route path="/users/dashboard" exact={true}>
                <AdminLogin  />
              </Route>

              <Route path="/users/verify/device" exact={true}>
                <Device setDeviceId={setDeviceId} />
              </Route>

              <Route path="/users/verify" exact={true}>
                <Verify />
              </Route>

              <Route path="/users/scan/true" exact={true}>
                <Verify setScanStatus={true} />
              </Route>

              <Route path="/users/forget-password" exact={true}>
                <ForgetPassword />
              </Route>

              <Route path="/admin/change-password" exact={true}>
                <ChangePassword setRole={setRole} />
              </Route>
              <Route path="/admin/register" exact={true}>
                <AdminRegister role={role} />
              </Route>

              <Route path="/user/email/verify" exact={true}>
                <EmailVerify role={role} />
              </Route>

              <Route path="/admin/dashboard" exact={true}>
                <AdminDashboard setRole={setRole} time={time} setDeviceId={setDeviceId} />
              </Route>

              <Route path="/admin/devices" exact={true}>
                <AdminDevices setRole={setRole}  time={time} setDeviceId={setDeviceId} />
              </Route>

              <Route path="/admin/gallery/key/:deviceId" exact={true}>
                <Gallery deviceId={deviceId} />
              </Route>

              <Route path="/play/v/:deviceId" exact={true}>
                <Play deviceId={deviceId} />
              </Route>

              <Route path="/users/gallery/key/:userName" exact={true}>
                <GalleryUser userName={userName} />
              </Route>
            </Switch>
          </div>
        </div>
      </Account>
    </Router>
  );
}

export default App;
