import React, { useState, useContext, useEffect } from 'react';
import { AccountContext } from '../../../Accounts';
import { withRouter } from "react-router-dom";
import { MdSearch, MdRefresh, MdDeleteForever } from 'react-icons/md';
import styles from './Listing.module.css';
import Loader from 'react-loader-spinner';
import axios from 'axios';
import CONSTANTS from '../../../constants/apiContants';
import DevicePagination from '../../../components/DevicePagination';

const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-1',
  'accessKeyId': 'AKIAXSF7D3U5TURU3L75',
  'secretAccessKey': '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'
});
const cognito = new AWS.CognitoIdentityServiceProvider({ region: 'us-east-1' });

function Device(props) {
  const [status, setStatus] = useState(false);
  const [deviceList, setDeviceList] = useState([]);
  const { getSession, logout } = useContext(AccountContext);

  //edit users variables
  const [adminUserName, setAdminUserName] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [loader, setLoader] = useState(false);

  //search
  const [keyword, setKeyword] = useState('');

  //Pagination 
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);



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
    getDeviceList();
    getSession()
      .then(session => {
        setStatus(true);
        setAdminUserName(session.accessToken.payload.sub)
      }).catch(err => {
        props.history.push('/');
      });
  }, [getSession, props.history]);

  const getDeviceList = async () => {
    const headers = CONSTANTS.headers;
    const res = await axios.get('https://2a8en13npk.execute-api.us-east-1.amazonaws.com/get_all_devices_stage', { headers })
    setDeviceList(res.data.response.Items);
  };

  // Get current posts
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = deviceList.slice(indexOfFirstItem, indexOfLastItem)

  // Change page
  const paginate = pageNumber => setCurrentPage(pageNumber);

  const makeLogout = () => {
    if (window.confirm("Do you really want to logout?") === true) {
      logout();
      props.history.push('/');
    }
  }


  const CloseIt = () => {
    setState({
      'addUseronPage': 0,
      'editUseronPage': 0
    });
    getDeviceList();
  }

  const search = (e, type) => {
    e.preventDefault();
    setLoader(true);

    const payload = {
      "type": 'all_devices',
      "keyword": keyword
    }

    axios.post('https://xpj5parn7a.execute-api.us-east-1.amazonaws.com/search_stage', payload)
      .then(function (response) {
        if (response.status === 200) {
          if (response.data.statusCode === 200) {
            setDeviceList(response.data.result);
          } else if (response.data.statusCode === 400) {
            setDeviceList('')
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

  const resetSearch = () => {
    getDeviceList();
    setKeyword('');
  }

  const goBack = () => {
    window.history.go(-1);
  }


  const deleteDevice = async (e, device_id, index) => {
    if (window.confirm("Are you sure?") === true) {
      setLoader(true);
      const payload = {
        'type': 'delete_single_device',
        'device_id': device_id,
        'index': index,
      }
      axios.delete('https://x38l6wrf59.execute-api.us-east-1.amazonaws.com/delete_data_stage',
        { data: payload }, { headers: CONSTANTS.headers }
      )
        .then(function (response) {
          if (response.status === 200) {
            setLoader(false);
            setErrorMsg('');
            setSuccessMsg('Device Removed Successfully!');
            getDeviceList()
          }
        }).catch(function (error) {
          setLoader(false);
          setSuccessMsg('');
          setErrorMsg(error)
        });
    }
  }
  return (


    <div className="col-md-12 p-0">


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

                  {errorMsg ? <div className={`alert alert-warning ${errorMsg === 'No Device added for this user.' ? 'warning' : 'danger'} `}>{errorMsg}</div> : ''}
                  {successMsg ? <div className="alert alert-success">{successMsg}</div> : ''}

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

      {status ? (
        <div>

          <div className={styles.listing__header}>
            <div className="container">
              <div className="row">
                <div className="col-md-12">
                  <div className="text-right pb-2">
                    <button className="btn btn-sm btn-primary py-0" onClick={() => openChangePwdModal()}>Change Password</button>
                    <button className="btn btn-sm btn-primary py-0" onClick={makeLogout}>Logout</button>
                  </div>
                </div>
              </div>
              <div className="row">
                <h2 className={` ${styles.page_title} `}>Devices</h2>
                <form onSubmit={(e) => search(e, 'search')} className="ml-auto">
                  <div className={`form-group ${styles.search_bar}`}>
                    <div className="input-group">
                      <input type="text"
                        className="form-control"
                        placeholder="Search By Devices ID"
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
                  <button className={"btn btn-outline-primary ml-auto "} onClick={goBack}>
                    <span> Back</span>
                  </button>
                </div>
              </div>
              <div className="table-reponsive">
                <div className={" table table-all-devices " + styles.table_user_listing}>
                  {loader ? <Loader className="loader" type="ThreeDots" color="#093171" height="100" width="100" /> : ''}


                  <div className={`tr ${styles.thead}`}>
                    <div className={`th  ${styles.table_user_listing_th} ${styles.cell__head} `}>N0.</div>
                    <div className={`th  ${styles.table_user_listing_th} ${styles.cell__head} `}>Device ID</div>
                    <div className={`th   ${styles.table_user_listing_th} ${styles.cell__head} `}>STATUS</div>
                    <div className={`th  ${styles.table_user_listing_th} ${styles.cell__head} `}>ACTIONS</div>
                  </div>
                  {(currentItems.length > 0) ?
                    currentItems.map((item, index) => (
                      <div className="tr tbody main" id={index} key={index} >
                        <>
                          <div className={"td " + styles.table_user_listing_td}>{item.index + 1}</div>
                          <div className={"td  " + styles.table_user_listing_td}>
                            {item.DeviceIds ?? '-'}
                          </div>
                          <div className={"td  " + styles.table_user_listing_td}>
                            {
                              item.IsAttached ?
                                <span className={"text-success"}>Assigned</span>
                                :
                                <span className={"text-secondary"}>Available</span>
                            }
                          </div>
                          <div className={"td  " + styles.table_user_listing_td} >
                            {
                              item.IsAttached ? '' :
                                <MdDeleteForever title="Remove this device" onClick={(e) => deleteDevice(e, item.DeviceIds, index)} className="hover" size="26" fill="#093171" />
                            }
                          </div>

                        </>
                      </div>
                    ))
                    : <div className="tr tbody main" >
                      <div className={"text-center td w5 td-auto " + styles.table_user_listing_td}>
                        No Data
                      </div>
                    </div>
                  }

                  {
                    deviceList.length >= itemsPerPage ?
                      <DevicePagination
                        itemsPerPage={itemsPerPage}
                        totalItems={deviceList.length}
                        paginate={paginate}
                        currentPage={currentPage}
                      />
                      : ''
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

export default withRouter(Device);