import React, { useState, useContext, useEffect } from 'react';
import { AccountContext } from '../../../Accounts';
import { withRouter } from "react-router-dom";
import Loader from 'react-loader-spinner';
import styles from './Login.module.css';
import '../../common/LoginForm.css';
import axios from 'axios';

import {
    AccountCircle as AccountCircleIcon,
    LockOutlined as LockOutlinedIcon,
    Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon
} from '@material-ui/icons';


function Login(props) {
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [errorCode, setErrorCode] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loader, setLoader] = useState(false);
    const { authenticate } = useContext(AccountContext);
    const { getSession, logout } = useContext(AccountContext);

    const [passwordShown, setPasswordShown] = useState(false);

    const togglePasswordVisiblity = () => {
        setPasswordShown(passwordShown ? false : true);
    };


    useEffect(() => {
        getSession()
            .then(session => {
                setLoading(false)
                if (session) {
                    if (session.accessToken.payload["cognito:groups"][0] === 'admin_group') {
                        props.history.push('/admin/dashboard');
                    }
                    else if (session.accessToken.payload["cognito:groups"][0] === 'users_group') {
                        props.history.push('/users/gallery/key/' + session.accessToken.payload.sub)
                    }
                }
            }).catch(function (err) {
                logout();
                setLoading(false)
            });
    }, [getSession, logout, props.history]);

    if (loading) {
        return <Loader className="loader" type="ThreeDots" color="#093171" height="100" width="100" />
    }
    const onSubmit = event => {
        event.preventDefault();
        setLoader(true);
        authenticate(email, password)
            .then(data => {
                if (data.newPasswordRequired === true) {
                    redirecToChangePws(data)
                }
                if (data.onSuccess === true) {
                    setErrorMessage('')
                    setSuccessMsg('Login Successful! Please wait...')
                    getCurUser(data.accessToken.payload.sub)
                        .then(userData => {
                            if (data.accessToken.payload["cognito:groups"][0] === 'admin_group')
                                props.history.push('/admin/dashboard');
                            else if (userData.result.Item.Verified === 'Yes') {
                                props.history.push('/users/gallery/key/' + data.accessToken.payload.sub)
                            }
                            else
                                props.history.push('/users/verify');
                        })
                        .catch(err => {
                            setErrorMessage(err.message);
                            setLoader(false);
                        })
                }
                setLoader(false);
            })
            .catch(err => {
                setErrorCode(err.code)
                if (err.code === 'UserNotConfirmedException') {
                    setErrorMessage('Your email is unverified!');
                }
                else if (err.code === 'NotAuthorizedException') {
                    setErrorMessage('Incorrect username or password!');
                }
                else if (err.code === 'InvalidParameterException') {
                    setErrorMessage('Please fill required fields!');
                }
                setLoader(false);
            })
    };

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
                            setErrorMessage(response.data.message)
                        } else if (response.data.errorMessage) {
                            setErrorMessage('Something went wrong!')
                        }
                    }
                    setLoader(false);
                })
                .catch(function (error) {
                    setErrorMessage(error.KeyError)
                });
        });


    const redirecToChangePws = (data) => {
        props.setRole('admin');
        props.seNewPwd(true);
        props.setUser(data);

        props.history.push('/admin/change-password');
    };

    const redirectToChangePassword = (e) => {
        e.preventDefault()
        props.history.push('/users/forget-password');
    }

    const redirectToRegister = () => {
        props.history.push('/admin/register');
    }

    return (
        <div className={styles.admin_login}>
            <div className="card  col-12 col-lg-4 login-card admin-login">

                <div className="login__header text-center">
                    <h2>Sign In</h2>
                    <p>Let's setup to your account!</p>
                </div>

                <div className="form of-h">
                    {errorMessage ? <div className="alert alert-danger">{errorMessage}
                        {errorCode === 'UserNotConfirmedException' ? <a href="/user/email/verify"> Click here to verify.</a> : ''}
                    </div> : ''}
                    {successMsg ? <div className="alert alert-success">{successMsg}</div> : ''}
                    <form onSubmit={onSubmit}>
                        <div className="form-group text-left">
                            <label htmlFor="email">Email *</label>
                            <div className="input-group">
                                <span className="input-group-addon">
                                    <AccountCircleIcon style={{ fontSize: 20 }} />
                                </span>
                                <input type="email"
                                    className="form-control"
                                    id="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={event => setEmail(event.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group text-left">
                            <label htmlFor="password">Password *</label>
                            <div className="input-group">
                                <span className="input-group-addon">
                                    <LockOutlinedIcon style={{ fontSize: 20 }} />
                                </span>
                                <input
                                    type={passwordShown ? "text" : "password"}
                                    className="form-control"
                                    id="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={event => setPassword(event.target.value)}
                                />
                                <span className={styles.addon_icon} onClick={togglePasswordVisiblity}>
                                    {passwordShown ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </span>
                            </div>
                            <button className="forgot_password" onClick={(e) => redirectToChangePassword(e)} >Forgot Password ?</button>
                        </div>

                        <div className="form-check"></div>


                        <div className="btn-group btn-block" role="group">
                            <button type="submit" className="btn btn-primary">Sign In</button>&nbsp;
                            <button type="button" onClick={redirectToRegister} className="btn btn-outline-primary">Register</button>
                        </div>


                        {loader ? <Loader className="loader" type="ThreeDots" color="#093171" height="100" width="100" /> : ''}
                    </form>
                </div>
            </div>

        </div>
    )
}

export default withRouter(Login);