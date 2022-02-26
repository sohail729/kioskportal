import React, { useState, useEffect, useContext } from 'react';
import { Link, withRouter } from "react-router-dom";
import Loader from 'react-loader-spinner';
import styles from './Device.module.css';
import { AccountContext } from '../../../Accounts';
import {
    LockOutlined as LockOutlinedIcon,
} from '@material-ui/icons';
import axios from 'axios';
import QrReader from 'modern-react-qr-reader'

function Verify(props) {

    const [hideScanner, setHideScanner] = useState(0);
    const [code, setDeviceVerCode] = useState('');
    const [userSess, setUserSession] = useState('');
    const [error, setError] = useState('');
    const [loader, setLoader] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const { getSession } = useContext(AccountContext);

    useEffect(() => {
        getSession()
            .then(session => {
                setUserSession(session);
            }).catch(function (err) {
                props.history.push('/');

            });
    },  [getSession, props.history]);


    const UpdateDeviceWithBtn = (e) => {
        e.preventDefault()
        setLoader(true);
        setError('');
        setSuccessMsg('');
        const payload = {
            'username': userSess.accessToken.payload.sub,
            'device_id': code
        }

        axios.post('https://bmcczd8ow3.execute-api.us-east-1.amazonaws.com/verify_user_device_stage', payload)
            .then(function (response) {
                if (response.status === 200) {
                    if (response.data.statusCode === 200) {
                        setHideScanner(1);
                        setLoader(false);
                        setSuccessMsg(response.data.message);
                        setTimeout(() => {
                            props.setDeviceId({ 'username': userSess.accessToken.payload.sub, 'name': userSess.preferred_username })
                            props.history.push('/users/gallery/key/' + userSess.accessToken.payload.sub);
                        }, 2000);
                    } else {
                        setHideScanner(0);
                        setLoader(false);
                        setError(response.data.message);
                    }
                }
            })
            .catch(function (error) {
                setLoader(false);
                setError(error);
            });
    }



    const handleScan = (data222) => {
        if (data222) {
            setHideScanner(1)
            setError('');
            setSuccessMsg('');
            setLoader(true);
            setDeviceVerCode(data222)

            UpdateDevice(data222)
                .then(data => {
                    if (data.statusCode === 200) {
                        setSuccessMsg(data.message);
                        setTimeout(() => {
                            props.setDeviceId({ 'username': userSess.accessToken.payload.sub, 'name': userSess.preferred_username })
                            props.history.push('/users/gallery/key/' + userSess.accessToken.payload.sub);
                        }, 1000);
                    }
                    if (data.statusCode === 400) {
                        setHideScanner(0);
                        setError(data.message);
                        setLoader(false);
                    }
                })
                .catch(err => {
                    setLoader(false);
                    setError('Something went wrong!');
                })


        }
    }

    const UpdateDevice = async (code) =>
        await new Promise((resolve, reject) => {
            const payload = {
                'username': userSess.accessToken.payload.sub,
                'device_id': code
            }

            axios.post('https://bmcczd8ow3.execute-api.us-east-1.amazonaws.com/verify_user_device_stage', payload).then(function (response) {
                if (response.status === 200) {
                    resolve(response.data)
                }
            })
                .catch(function (error) {
                    reject()
                });
        });

    const goBack = () => {
        window.history.go(-1);
    }
    return (
        <div className={styles.admin_login}>

            {userSess ?
                <div className="card  col-12 col-lg-4 login-card admin-login">

                    <div className="login__header text-center">
                        <h2>Enter Device Key</h2>
                    </div>

                    <div className="form of-h">
                        <p className="text-center">Please scan the QR code for device verification!<br></br><small>Contact support for QR code.</small></p>

                        <div >
                            {hideScanner === 0 ?
                                <QrReader
                                    delay={5000}
                                    facingMode={"environment"}
                                    //   onError={this.handleError}
                                    onScan={handleScan}
                                    style={{ width: '100%' }}
                                />
                                : ''}
                        </div>
                        <form onSubmit={UpdateDeviceWithBtn}>
                            <div className="form-group text-left">
                                <label htmlFor="verification-code">Verification Code</label>
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <LockOutlinedIcon style={{ fontSize: 20 }} />
                                    </span>
                                    <input type="text"
                                        className="form-control"
                                        id="verfication-code"
                                        placeholder="Enter Code"
                                        value={code}
                                        onChange={event => setDeviceVerCode(event.target.value)}

                                    />

                                </div>
                                {successMsg ? <div className="text-center alert alert-success">{successMsg}</div> : ''}
                                {error ? <div className="text-center alert alert-danger">{error}</div> : ''}
                                {loader ? <Loader className="loader" type="ThreeDots" color="#093171" height="100" width="100" /> : ''}
                            </div>
                            <div className="form-group">
                                <button type="submit" className="btn btn-primary" >Verify</button>
                                <button type="submit" className="btn btn-outline-primary" onClick={goBack} >Go Back</button>
                            </div>
                            <div>

                            </div>
                        </form>
                    </div>
                </div>
                : <>  <div className="text-center"> Please Login to Continue <Link to="/">Login</Link></div></>}
        </div>
    )
}

export default withRouter(Verify);