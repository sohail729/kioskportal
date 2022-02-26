import React, { useState, useContext, useEffect } from 'react';
import { AccountContext } from '../../../Accounts';
import { withRouter, Link } from "react-router-dom";
import { MdVideoCall, MdModeEdit, MdSearch, MdAdd, MdRefresh, MdDeleteForever, MdVideoLibrary } from 'react-icons/md';
import { Visibility as VisibilityIcon } from '@material-ui/icons';
import styles from './Listing.module.css';
import Loader from 'react-loader-spinner';
import cryptoRandomString from 'crypto-random-string';
import UserPool from '../../../UserPool';
import axios from 'axios';
import CONSTANTS from '../../../constants/apiContants';

const AWS = require('aws-sdk');

const key = cryptoRandomString({ length: 40, type: 'alphanumeric' });

AWS.config.update({
  region: 'us-east-1',
  'accessKeyId': 'AKIAXSF7D3U5TURU3L75',
  'secretAccessKey': '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'
});

const cognito = new AWS.CognitoIdentityServiceProvider({ region: 'us-east-1' });

function Dashoard(props) {
  const [today] = useState(new Date());
  const [status, setStatus] = useState(false);
  const [userlist, setUserList] = useState([]);
  const { getSession, logout } = useContext(AccountContext);

  //add user variables
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addErrorMessage, setAddErrorMessage] = useState('');
  const [addSuccessMessage, setAddSuccessMessage] = useState('');

  //edit users variables
  const [name, setName] = useState('');
  const [adminUserName, setAdminUserName] = useState('');
  const [userKey, setUserkey] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [loader, setLoader] = useState(false);
  const [ankey, setANKey] = useState(key);

  //add device vars
  const [deviceId, setDeviceId] = useState('');

  //add video
  const [thumbnail, setThumbnail] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');

  //search
  const [keyword, setKeyword] = useState('');
  const [nod, setNod] = useState(1);


  const onSubmit = event => {
    event.preventDefault();
    setLoader(true);
    UserPool.signUp(addEmail, addPassword, [
      { Name: "preferred_username", Value: addName },
    ], null, (err, data) => {
      if (err) {
        setAddSuccessMessage('');
        setLoader(false);
        setAddErrorMessage(err.message);
      } else {
        addUserInDyn(data.userSub)
        setAddSuccessMessage('');
        setLoader(false);
        addUsertoGroup(data.userSub);
      }

    });
  };

  //add user in dynamo
  const addUserInDyn = (username) => {

    const payload = {
      "email": addEmail,
      "name": addName,
      "userkey": ankey,
      "username": username,
      "data": ['awww', 'bwww']
    }

    axios.post('https://hfk5o90w6i.execute-api.us-east-1.amazonaws.com/add_user_stage', payload, { headers: CONSTANTS.headers })
      .then(function (response) {
        if (response.data.code === true) {
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  const addUsertoGroup = (username) => {
    var params = {
      "GroupName": 'users_group',
      "Username": username,
      "UserPoolId": 'us-east-1_lB9QiQUOz',
    };

    cognito.adminAddUserToGroup(params, function (err, data) {
      if (err) {
        setAddSuccessMessage('');
        setAddErrorMessage('Required fields are missing!');
        setLoader(false);
      } else {
        setLoader(false);
        setAddErrorMessage('');
        setAddSuccessMessage('User added successfully!');

        setAddName('');
        setAddEmail('');
        setANKey('');
        setAddPassword('');
      }
    });
  }

  const [dispalyModal, setState] = useState({
    "addUser": 0,
    "editUser": 0,
    "addDevice": 0,
    "addVideo": 0,
    "userName": '',
    "userSingle": '',
    "addUseronPage": 0,
    "editUseronPage": 0,
    "changeAdminPwd": 0,
    "addDeviceId": 0,
    "setDeviceKey": 0,
    "showDevices": 0,
  });

  useEffect(() => {
    getUserList();
    //user listing ends here    
    getSession()
      .then(session => {
        setStatus(true);
        setAdminUserName(session.accessToken.payload.sub)
      })
      .catch(err => {
        props.history.push('/');
      });
  }, [getSession, props.history]);

  const getUserList = async () => {
    const headers = CONSTANTS.headers;
    await axios.get('https://kzjxkpi6b5.execute-api.us-east-1.amazonaws.com/get_user_stage', { headers })
      .then(function (response) {
        setUserList(response.data.response.Items);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  const makeLogout = () => {
    if (window.confirm("Do you really want to logout?") === true) {
      logout();
      props.history.push('/');
    }
  }

  const deleteUser = async (e, username) => {
    const deleteUser = {
      UserPoolId: 'us-east-1_lB9QiQUOz',
      Username: username
    }
    if (window.confirm("Do you really want to delete this?") === true) {
      setLoader(true);
      await cognito.adminDeleteUser(deleteUser).promise();
      await deleteUserInDyn(username);
      await getUserList();
      setLoader(false);
    } else {
    }
  }

  const deleteUserInDyn = async (username) => {
    const payload = {
      'username': username
    }
    await axios.post('https://67gbnv7cnc.execute-api.us-east-1.amazonaws.com/delete_user_stage', payload, { headers: CONSTANTS.headers })
      .then(function (response) {
        if (response.data.code === true) {

        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }


  const CloseIt = () => {
    setName('')
    setEmail('')
    setPassword('')
    setUserkey('')
    setState({
      'addUseronPage': 0,
      'editUseronPage': 0
    });
    getUserList();
  }

  const CloseItAdd = () => {
    setState({
      'addUseronPage': 0,
      'editUseronPage': 0
    });
    getUserList();
  }

  const editUser = (e, username) => {
    setErrorMsg('');
    setState({
      "editUseronPage": 1
    })

    const getSingleUser = {
      UserPoolId: 'us-east-1_lB9QiQUOz',
      Username: username
    }

    cognito.adminGetUser(getSingleUser, (err, data) => {
      if (err) {
        console.log(err)
      } else {
        data.UserAttributes.map((item, index) => (
          <>
            {item.Name === 'preferred_username' ? setName(item.Value) :
              item.Name === 'email' ? setEmail(item.Value) :
                item.Name === 'custom:user_key' ? setUserkey(item.Value) :
                  item.Name === 'sub' ? setUserName(item.Value) : ''
                  }

          </>
        ))
      }
    });
  }

  const updateUser = (e, username) => {
    e.preventDefault()
    if (userKey === '') {
      setErrorMsg('Please fill all the fields!')
      return;
    }
    setLoader(true);
    const updateUser = {
      UserPoolId: 'us-east-1_lB9QiQUOz',
      Username: username,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'preferred_username', Value: name },
      ]
    }

    const updatePassword = {
      Password: password,
      Permanent: true,
      UserPoolId: 'us-east-1_lB9QiQUOz',
      Username: username
    }

    cognito.adminUpdateUserAttributes(updateUser, (err, data) => {
      if (err) {
        setSuccessMsg('')
        if (err.code === 'InvalidParameterException') {
          setErrorMsg('Please fill all the fields!')
        }
      } else {
        updatUserInDyn(username);
        setErrorMsg('')
        setSuccessMsg('User updated successfully!');
      }
      setLoader(false);
    });

    if (password.length > 1) {
      cognito.adminSetUserPassword(updatePassword, (err, data) => {
        if (err) {
          setSuccessMsg('')
          setErrorMsg(err.message)
        }
        setLoader(false);
      });
    }
  }

  //update user in dynamo
  const updatUserInDyn = async (username) => {
    const payload = {
      'email': email,
      'userkey': userKey,
      'name': name,
      'username': username,
      'type': 'update_user'
    }
    await axios.post('https://a82wa9qw8j.execute-api.us-east-1.amazonaws.com/update_user_stage', payload)
      .then(function (response) {
        if (response.data.code === true) {
        } else {
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }


  const addVideo = (e, username) => {
    setThumbnail('');
    setUrl('');
    setDescription('');
    setErrorMsg('');
    setSuccessMsg('');
    setState({
      "addVideo": 1
    });
    setUserName(username);
  }

  const UpdateVideo = async (e) => {
    e.preventDefault()
    setLoader(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      'thumbnail_url': thumbnail,
      'video_url': url,
      'description': description,
      'date': today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate(),
      'username': username
    }

    axios.post('https://3flf3a8pba.execute-api.us-east-1.amazonaws.com/add_video_stage', payload, { headers: CONSTANTS.headers })
      .then(function (response) {
        if (response.status === 200) {
          if (response.data.statusCode === 200) {
            setSuccessMsg(response.data.message);
            setThumbnail('');
            setUrl('');
            setDescription('');
          } else {
            setErrorMsg(response.data.message);
          }
        }
        setLoader(false);
      })
      .catch(function (error) {
        console.log(error);
      });

  }

  const UpdateDevice = () => {
    setLoader(true);
    setErrorMsg('');
    setSuccessMsg('');
    let deviceIds = [];
    for (let i = 0; i < nod; i++) {
      deviceIds.push(cryptoRandomString({ length: 40, type: 'alphanumeric' }));
    }
    const payload = {
      'device_id': deviceIds
    }

    axios.post('https://0dfm44b914.execute-api.us-east-1.amazonaws.com/update_device_stage', payload, { headers: CONSTANTS.headers })
      .then(function (response) {
        if (response.status === 200) {
          if (response.data.statusCode === 200) {
            setSuccessMsg(response.data.message);
          } else {
            setErrorMsg(response.data.message);
          }
        }
        setLoader(false);
      })
      .catch(function (error) {
        setLoader(false);
        setErrorMsg(error);
      });
  }

  const gallery = (e, username, fullname) => {
    setErrorMsg('');
    setSuccessMsg('');
    props.setDeviceId({ 'name': fullname, 'username': username })
    props.history.push('/admin/gallery/key/' + username)
  }

  const [devices, setDevices] = useState('');
  const showDevices = (devices, username) => {
    setErrorMsg('');
    setSuccessMsg('');
    setDevices(devices)
    setUserName(username)
    setState({
      "showDevices": 1
    })
  }

  const deletDevice = (deviceKey, index) => {
    if (window.confirm("Are you sure?") === true) {
      setLoader(true);
      const payload = {
        'type': 'delete_device',
        'device_id': deviceKey,
        'index': index,
        'username': username
      }
      axios.delete('https://x38l6wrf59.execute-api.us-east-1.amazonaws.com/delete_data_stage',
        { data: payload }, { headers: CONSTANTS.headers }
      )
        .then(function (response) {
          console.log(response.data.devices)
          if (response.status === 200) {
            if (response.data.statusCode === 200) {

              setSuccessMsg(response.data.message);

              } else {

             setTimeout(() => {
              setDevices(response.data.devices)
              setErrorMsg(response.data.message);
              setLoader(false);
              if(response.data.devices.length === 0){
                setTimeout(() => {
                  setState({
                    "showDevices": 0
                  })
                  getUserList();
                }, 1000);
                
              }
            }, 2000);
            
            }
          }
        }).catch(function (error) {
          setErrorMsg(error)
          console.log(error);
        });
    }
  }

  const search = (e, type) => {
    e.preventDefault();
    setLoader(true);

    const payload = {
      "type": 'dashboar_users',
      "keyword": keyword
    }

    axios.post('https://xpj5parn7a.execute-api.us-east-1.amazonaws.com/search_stage', payload)
      .then(function (response) {
        if (response.status === 200) {
          if (response.data.statusCode === 200) {
            setUserList(response.data.result);
          } else if (response.data.statusCode === 400) {
            setUserList('')
          } else if (response.data.errorMessage) {
            setErrorMsg('Something went wrong!')
          }
        }
        setLoader(false);
      })
      .catch(function (error) {
        console.log(error);
      });

  }

  const resetSearch = () => {
    getUserList();
    setKeyword('');
  }

  const openAddDevicePopup = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setState({
      'addDevice': 1,
    });
    const key = cryptoRandomString({ length: 40, type: 'alphanumeric' });
    setANKey(key);
    setDeviceId(key);
  }

  const openChangePwdModal = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setState({
      'changeAdminPwd': 1,
    });
  }

  const resetPassword = event => {
    event.preventDefault();
    if ((password || confirmPassword) === '') {
      setSuccessMsg('');
      setErrorMsg('Required fields are missing!');
      return;
    }

    if (password !== confirmPassword) {
      setSuccessMsg('');
      setErrorMsg('Passwords are not the same.');
      return;
    }

    const updatePassword = {
      Password: password,
      Permanent: true,
      UserPoolId: 'us-east-1_lB9QiQUOz',
      Username: adminUserName
    }

    if (password.length > 1) {
      cognito.adminSetUserPassword(updatePassword, (err, data) => {
        if (err) {
          setSuccessMsg('')
          setErrorMsg(err.message)
          return
        }
        setErrorMsg('')
        setSuccessMsg('Password changed successfully!')
      });
    }

  };

  const redirectToDevices = () => {
    props.history.push('/admin/devices');
  }

  const ClearMsgs = () => {
    setErrorMsg('')
    setSuccessMsg('')
  }
  return (


    <div className="admin-video-listing col-md-12 p-0">

      {dispalyModal.addDevice === 1 ?
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Device</h5>

                <button onClick={CloseIt} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">✖</button>
              </div>
              <div className="modal-body">

                {successMsg ? <div className="text-center alert alert-success alert-dismissible fade show" role="alert">
                  {successMsg}
                  <button type="button" onClick={ClearMsgs} className="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div> : ''}

                <div className="form-group">
                  <label htmlFor="Name">Number of Device(s)</label>
                  <input type="Number" min="1" max="99"
                    className="form-control"
                    name="nod"
                    value={nod}
                    onChange={(event) => setNod(event.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <button onClick={UpdateDevice} className="btn btn-primary" >ADD</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        : ''}

      {dispalyModal.showDevices === 1 ?
        <div className="modal modal-devices-key fade show" style={{ display: 'block' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Devices</h5>

                <button onClick={CloseIt} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">✖</button>
              </div>
              <div className="modal-body">

                {errorMsg ? <div className="alert alert-danger">{errorMsg}</div> : ''}
                {successMsg ? <div className="alert alert-success">{successMsg}</div> : ''}

                <div className="table">
                  <div className={`tr ${styles.thead}`}>
                    <div className="th">Device Key</div>
                    <div className="th">Link</div>
                    <div className="th"></div>
                  </div>
                  {
                    devices.length > 0 ?
                      devices.map((item, index) => (

                        <div key={index} className="tr">
                          <div className="td" ><span className="key">{item}</span></div>
                          <div className="td">
                            <Link className="tc" to={'/play/v/' + item} target="_blank">
                              {window.location.origin + '/play/v/' + item}
                            </Link>
                          </div>
                          <div className="td text-right">
                            <span onClick={() => deletDevice(item, index)}><MdDeleteForever className="hover" size="26" fill="#093171" /></span>
                          </div>
                        </div>
                      ))
                      : ''

                  }
                </div>

              </div>
            </div>
          </div>
        </div>
        : ''}

      {dispalyModal.addVideo === 1 ?
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Video</h5>
                <button onClick={CloseIt} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">✖</button>
              </div>
              {errorMsg ? <div className="text-center alert alert-danger alert-dismissible fade show" role="alert">
                {errorMsg}
                <button type="button" onClick={ClearMsgs} className="close" data-dismiss="alert" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div> : ''}
              {successMsg ? <div className="text-center alert alert-success alert-dismissible fade show" role="alert">
                {successMsg}
                <button type="button" onClick={ClearMsgs} className="close" data-dismiss="alert" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div> : ''}
              <div className="modal-body">

                <form onSubmit={UpdateVideo} >
                  <div className="form-group">
                    <label htmlFor="UserKey">Thumbnail *</label>
                    <input type="url"
                      className="form-control"
                      name="thumbnail"
                      placeholder="Enter video thumbnail URL"
                      value={thumbnail}
                      onChange={event => setThumbnail(event.target.value)}
                    />
                  </div>
                  {loader ? <Loader className="loader" type="ThreeDots" color="#093171" height="100" width="100" /> : ''}
                  <div className="form-group">
                    <label htmlFor="UserKey">URL *</label>
                    <input type="url"
                      className="form-control"
                      name="url"
                      placeholder="Enter video URL"
                      value={url}
                      onChange={event => setUrl(event.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="Description">Description</label>
                    <input type="text"
                      className="form-control"
                      name="description"
                      placeholder="Enter video description"
                      value={description}
                      onChange={event => setDescription(event.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <button className="btn btn-primary">SUBMIT</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        : ''}

      {dispalyModal.addDeviceId === 1 ?
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Device ID</h5>

                <button onClick={CloseIt} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">✖</button>
              </div>
              <div className="modal-body">

                {errorMsg ? <div className="alert alert-danger">{errorMsg}</div> : ''}
                {successMsg ? <div className="alert alert-success">{successMsg}</div> : ''}

                <div className="form-group">
                  <label htmlFor="Name">Name</label>
                  <input type="text"
                    className="form-control"
                    name="name"
                    value={name}
                    readOnly
                  />
                </div>
                {loader ? <Loader className="loader" type="ThreeDots" color="#093171" height="100" width="100" /> : ''}
                <div className="form-group">
                  <label htmlFor="UserKey">User Key</label>
                  <input type="text"
                    className="form-control"
                    value={userKey}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="DeviceID">Device ID</label>
                  <input id="DeviceID"
                    type="text"
                    className="form-control"
                    placeholder="Enter Device ID"
                    value={deviceId}
                    onChange={event => setDeviceId(event.target.value)}
                  />
                </div>

                <div className="form-group">
                  <button className="btn btn-primary" onClick={UpdateDevice}>SUBMIT</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        : ''}

      {dispalyModal.editUseronPage === 1 ?
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit User</h5>

                <button onClick={CloseIt} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">✖</button>
              </div>

              <div className="modal-body">

                {errorMsg ? <div className={`alert alert-warning ${errorMsg === 'No Device added for this user.' ? 'warning' : 'danger'} `}>{errorMsg}</div> : ''}
                {successMsg ? <div className="alert alert-success">{successMsg}</div> : ''}

                {loader ? <Loader className="loader" type="ThreeDots" color="#093171" height="100" width="100" /> : ''}
                <form onSubmit={(e) => updateUser(e, username)}>
                  <div className="form-group">
                    <label htmlFor="Username">Name *</label>
                    <input type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      placeholder="Enter your name (i.e Micheal)"
                      value={name}
                      onChange={event => setName(event.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="Useremail">Email *</label>
                    <input type="email"
                      className="form-control"
                      id="Useremail"
                      name="email"
                      placeholder="Enter your email (i.e abc@example.com)"
                      value={email} autoComplete="off"
                      onChange={event => setEmail(event.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="Password">Password</label>
                    <input id="Password" type="password" autoComplete="new-password" className="form-control" placeholder="Enter your password"
                      name="password"
                      onChange={event => setPassword(event.target.value)}
                    />
                  </div>
                  <div className="form-group">

                    <label htmlFor="UserKey">User Key *</label>
                    <input id="UserKey" type="text" className="form-control" placeholder="Enter user key"
                      value={userKey}
                      onChange={event => setUserkey(event.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <button type="submit" className="btn btn-primary">SAVE</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        : ''}

      {dispalyModal.changeAdminPwd === 1 ?
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Change Password</h5>

                <button onClick={CloseIt} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">✖</button>
              </div>

              <div className="modal-body">
                <form onSubmit={resetPassword}>

                  {errorMsg ? <div className="text-center alert alert-danger alert-dismissible fade show" role="alert">
                    {errorMsg}
                    <button type="button" onClick={ClearMsgs} className="close" data-dismiss="alert" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div> : ''}
                  {successMsg ? <div className="text-center alert alert-success alert-dismissible fade show" role="alert">
                    {successMsg}
                    <button type="button" onClick={ClearMsgs} className="close" data-dismiss="alert" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div> : ''}

                  {loader ? <Loader className="loader" type="ThreeDots" color="#093171" height="100" width="100" /> : ''}

                  <div className="form-group">
                    <label htmlFor="Password">Password *</label>
                    <input id="password" type="password" className="form-control" placeholder="Enter your password"
                      name="password"
                      onChange={event => setPassword(event.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="Password">Confirm Password *</label>
                    <input type="password"
                      className="form-control"
                      id="confirmPassword"
                      placeholder="Enter confirm password"
                      value={confirmPassword}
                      onChange={event => setConfirmPassword(event.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <button className="btn btn-primary" type="submit">SAVE</button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>
        : ''}

      {dispalyModal.addUseronPage === 1 ?
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add User</h5>

                <button type="button" className="btn-close dfdf" data-bs-dismiss="modal" aria-label="Close" onClick={CloseItAdd}>✖</button>
              </div>

              <div className="modal-body">
                <div className="text-center" >
                  {addErrorMessage ? <div className="alert alert-danger">{addErrorMessage}</div> : ''}
                  {addSuccessMessage ? <div className="alert alert-success">{addSuccessMessage}</div> : ''}
                </div>
                {loader ? <Loader className="loader" type="ThreeDots" color="#093171" height="100" width="100" /> : ''}

                <form onSubmit={onSubmit} id="addForm">
                  <div className="form-group">
                    <label htmlFor="Name">Name</label>
                    <input type="text"
                      required
                      className="form-control"
                      id="name"
                      placeholder="Enter your name (i.e Micheal)"
                      value={addName}
                      onChange={event => setAddName(event.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="addEmail">Email / Username</label>
                    <input type="text"
                      className="form-control"
                      id="addEmail"
                      placeholder="Enter your name (i.e abc@example.com)"
                      value={addEmail}
                      onChange={event => setAddEmail(event.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="Password">Password</label>
                    <inputa type="password"
                      className="form-control"
                      id="password"
                      placeholder="*****"
                      value={addPassword}
                      onChange={event => setAddPassword(event.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="UserKey">User Key</label>
                    <input id="UserKey" type="text" className="form-control" placeholder="Enter user key"
                      value={ankey}
                      onChange={event => setANKey(event.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <button className="btn btn-primary">SAVE</button>
                  </div>
                </form>

              </div>
            </div>
          </div>
        </div>
        : ''}
      {status ? (
        <div>

          <div className={styles.listing__header}>
            <div className="container">
              <div className="row m-0">
                <div className="col-md-12 text-right pb-2">
                  <button className="btn btn-sm btn-primary py-0" onClick={() => redirectToDevices()}>All Devices</button>
                  <button className="btn btn-sm btn-primary py-0" onClick={() => openChangePwdModal()}>Change Password</button>
                  <button className="btn btn-sm btn-primary py-0" onClick={makeLogout}>Logout</button>
                </div>
              </div>
              <div className="row m-0">
                <h2 className={styles.page_title}>Users</h2>
                <form onSubmit={(e) => search(e, 'search')} className="ml-auto">
                  <div className={`form-group ${styles.search_bar}`}>
                    <div className="input-group">
                      <input type="text"
                        className="form-control"
                        placeholder="Search By Name"
                        value={keyword}
                        onChange={event => setKeyword(event.target.value)}
                      />
                      <span className="input-group-addon hover" onClick={(e) => resetSearch(e, 'reset')}><MdRefresh fill="#000" size="20" /></span>
                      <span className="input-group-addon hover" onClick={(e) => search(e, 'search')} >
                        <MdSearch fill="#000" size="20" />
                      </span>
                    </div>
                  </div>
                </form>

              </div>
            </div>
          </div>

          <div className="container">
            <div className={styles.listing__body}>

              <div className="listing__action">
                <div className="row">
                  <button className={"btn btn-primary ml-auto " + styles.btn_add_user}
                    onClick={openAddDevicePopup}>
                    <MdAdd size="18" />
                    <span>
                      Add Device
                    </span>
                  </button>
                </div>

              </div>

              <div className="table-reponsive">
                <div className={" table " + styles.table_user_listing}>
                  {loader ? <Loader className="loader" type="ThreeDots" color="#093171" height="100" width="100" /> : ''}
                  <div className={`tr ${styles.thead}`}>
                    <div className={`th  ${styles.table_user_listing_th} ${styles.cell__head} `}>USER KEY</div>
                    <div className={`th  ${styles.table_user_listing_th} ${styles.cell__head} `}>FULL NAME</div>
                    <div className={`th  ${styles.table_user_listing_th} ${styles.cell__head} `}>DEVICE(S)</div>
                    <div className={`th  ${styles.table_user_listing_th} ${styles.cell__head} `}>ACTIONS</div>
                  </div>


                  {(userlist.length > 0) ?
                    userlist.map((item, index) => (
                      <div className="tr tbody main" id={index} key={index} >
                        <>
                          <div className={"td  " + styles.table_user_listing_td}>{item.UserKey ?? ''}</div>


                          <div className={"td  " + styles.table_user_listing_td}>
                            {item.FullName ?? ''}
                          </div>

                          <div className={"td  " + styles.table_user_listing_td} id={index}>
                            <div className={`input-group ${styles.device_dropdown} `}>
                              {
                                item.Device_ids && item.Device_ids.length > 0 ?
                                  <select className={`form-control ${styles.device_input} `}>
                                    {
                                      item.Device_ids.map((item2, index2) => (
                                        <option value={item2} key={index2}>{item2}</option>
                                      ))
                                    }
                                  </select>
                                  : ''
                              }


                              {item.Device_ids && item.Device_ids.length ?
                                <span className="input-group-addon p-0 hover"
                                  onClick={(e) => showDevices(item.Device_ids, item.UserName)}
                                >
                                  <VisibilityIcon style={{ color: "#093171", fontSize: 26 }} />
                                </span>
                                : ''}
                            </div>
                          </div>

                          <div className={"td  " + styles.table_user_listing_td} >

                            <MdVideoCall className="hover" size="26" fill="#093171"
                              onClick={(e) => addVideo(e, item.UserName)} />

                            <MdModeEdit className="hover" size="26" fill="#093171"
                              onClick={(e) => editUser(e, item.UserName)} />

                            <MdDeleteForever className="hover" size="26" fill="#093171"
                              onClick={(e) => deleteUser(e, item.UserName)} />

                            <MdVideoLibrary className="hover" size="26" fill="#093171"
                              onClick={(e) => gallery(e, item.UserName, item.FullName)}
                            />

                          </div>



                        </>
                      </div>
                    ))
                    : <div className="tr tbody main" >
                      <div className={"text-center td " + styles.table_user_listing_td}>
                        No Data
                      </div>
                    </div>
                  }

                </div>
              </div>
            </div>

          </div>


        </div>

      ) : <Loader className="loader" type="ThreeDots" color="#093171" height="100" width="100" />}
    </div>
  );
};

export default withRouter(Dashoard);