import React, { useState, useEffect, useContext } from 'react';
import { Link, withRouter } from "react-router-dom";
import Loader from 'react-loader-spinner';
import styles from './Verify.module.css';
import { AccountContext } from '../../../Accounts';
import {
    LockOutlined as LockOutlinedIcon,
} from '@material-ui/icons';
import axios from 'axios';
import QrReader from 'modern-react-qr-reader'

function Verify(props) {

    const [code, setVerCode] = useState('');
    const [user, setUser] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loader, setLoader] = useState('');
    const { getSession, logout } = useContext(AccountContext);
    const [scan] = useState(props.setScanStatus);


    useEffect(() => {

        getSession()
            .then(session => {
                setUser(session);
            }).catch(function (err) {
                props.history.push('/');
            });



    }, [getSession, props.history]);

    const scanUser = (user) => {
        if (user['sub']) {
            getCurUser(user['sub'])
                .then(userData => {
                    if (userData.result.Item.Verified === 'Yes')
                        props.history.push('/users/verify/device');
                    else
                        setVerCode(user['custom:user_key'])
                })
                .catch(err => {
                    console.error(err);
                    setError(err.message);
                })
        }
    }

    const getCurUser = async (username) =>
        await new Promise((resolve, reject) => {
            const payload = {
                'type': 'user',
                'username': username

            }
            axios.post('https://4uzxj5hhqc.execute-api.us-east-1.amazonaws.com/get_data_stage', payload)
                .then(function (response) {
                    if (response.status === 200) {
                        if (response.data.statusCode === 200) {
                            resolve(response.data);
                        } else if (response.data.statusCode === 400) {
                            reject(response.data.message)
                        } else if (response.data.errorMessage) {
                            reject(response.data.errorMessage)
                        }
                    }
                    setLoader(false);
                })
                .catch(function (error) {
                    reject(error.KeyError)
                });
        });
    if (user && scan) {
        scanUser(user);
    }

    const verify = (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        if (user['custom:user_key'] === code) {
            setError('')
            redirectToDeviceKey()
        } else {
            setError('Wrong code entered!')
        }
    }

    const updateAccStatus = async () => {
        console.log(user['sub'])
        const payload = {
            'type': 'verified',
            'username': user['sub']
        }
        axios.post('https://a82wa9qw8j.execute-api.us-east-1.amazonaws.com/update_user_stage', payload)
            .then(function (response) {
                if (response.status === 200) {
                    if (response.data.statusCode === 200)
                         console.log('success');
                    else
                        console.error('failed');
                } else {
                    console.error('failed');
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    const makeLogout = (e) => {
        e.preventDefault()
        if (window.confirm("Do you really want to logout?") === true) {
            logout();
            props.history.push('/');
        }
        return false;
    }

    const redirectToDeviceKey = async () => {
        setLoader(true);
        updateAccStatus()
        setSuccess('Verfied Successfully!')
        setTimeout(() => {
            props.history.push('/users/gallery/key/' + user['sub'])
        }, 2000);
    }

    const handleScan = data => {
        if (data) {
            setLoader(true);
            setError('')
            setSuccess('')
            setVerCode(data)
            if (user['custom:user_key'] === code) {
                setError('')
                redirectToDeviceKey()
            } else {
                setError('Invalid Code!')
                setLoader(false);
            }
        }
    }
    return (
        <div className={styles.admin_login}>
            {user ?
                <div className="card  col-12 col-lg-4 login-card admin-login">

                    <div className="login__header text-center">
                        <h2>User Verification </h2>
                    </div>

                    <div className="form of-h">
                        <p className="text-center">Please scan the QR code for user verification!<br></br><small>Contact support for QR code.</small></p>
                        <div>
                            <QrReader
                                delay={300}
                                facingMode={"environment"}
                                //   onError={this.handleError}
                                onScan={handleScan}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <form onSubmit={verify}>
                            {loader ? <Loader className="loader" type="ThreeDots" color="#093171" height="100" width="100" /> : ''}
                            {success ? <div className="text-center alert alert-success">{success}</div> : ''}
                            {error ? <div className="text-center alert alert-danger">{error}</div> : ''}

                            <div className="form-group text-left">
                                <label htmlFor="verification-code">Verification Code</label>
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <LockOutlinedIcon style={{ fontSize: 20 }} />
                                    </span>
                                    <input type="text"
                                        className="form-control"
                                        id="verfication-code"
                                        placeholder="xxxxxxxxxxxxxx"
                                        value={code}
                                        onChange={event => setVerCode(event.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <button type="submit" className="btn btn-primary" >Verify</button>
                                <button className="btn btn-outline-primary" onClick={makeLogout}>Logout</button>
                            </div>
                        </form>
                    </div>

                </div>
                : <>Please Login to Continue  <Loader className="loader" type="ThreeDots" color="#093171" height="100" width="100" /> <Link to="/">Login</Link></>}
        </div>
    )
}

export default withRouter(Verify);