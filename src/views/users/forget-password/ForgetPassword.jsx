import React, { useState } from 'react';
import { withRouter } from "react-router-dom";
import Loader from 'react-loader-spinner';
import styles from './ForgetPassword.module.css';
import { CognitoUser } from "amazon-cognito-identity-js";
import Pool from "../../../UserPool";
import {
    AccountCircle as AccountCircleIcon,
    LockOutlined as LockOutlinedIcon,
    Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon, VpnKey as vCode
} from '@material-ui/icons';

function ForgetPassword(props) {

    const [stage, setStage] = useState(1); // 1 = email stage, 2 = code stage
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loader, setLoader] = useState(false);

    const [passwordShown, setPasswordShown] = useState(false);
    const togglePasswordVisiblity = () => {
        setPasswordShown(passwordShown ? false : true);
    };

    const [CpasswordShown, setCPasswordShown] = useState(false);
    const toggleCPasswordVisiblity = () => {
        setCPasswordShown(CpasswordShown ? false : true);
    };

    const getUser = () => {
        return new CognitoUser({
            Username: email.toLowerCase(),
            Pool
        });
    };

    const sendCode = event => {
        event.preventDefault();
        setLoader(true);
        getUser().forgotPassword({
            onSuccess: data => {
                setError('');
                console.log("onSuccess:", data);
            },
            onFailure: err => {
                setSuccess('');
                setLoader(false);
                setError('Missing required field.');
            },
            inputVerificationCode: data => {
                setError('');
                setLoader(false);
                setStage(2);
            }
        });
    };

    const resetPassword = event => {
        event.preventDefault();
        setLoader(true);
        if (password !== confirmPassword) {
            setSuccess('');
            setError('Passwords are not the same.');
            setLoader(false);
            return;
        }

        getUser().confirmPassword(code, password, {
            onSuccess: data => {
                makeVarsNull();
                setError('');
                setSuccess('Password changed successfully!');
                setLoader(false);
                redirectToLogin();
            },
            onFailure: err => {
                setSuccess('');
                console.error("onFailure:", err);
                setError('Wrong code entered.');
                setLoader(false);
            }
        });
    };

    const redirectToLogin = () => {
        makeVarsNull();
        props.history.push('/');
    }

    const redirectToForgetPassword = () => {
        makeVarsNull();
        setStage(1);
    }

    const makeVarsNull = () => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError('');
    }

    return (
        <div className={styles.admin_login}>
            <div className="card  col-12 col-lg-4 login-card admin-login">

                <div className="login__header text-center">
                    <h2>{stage === 1 ? 'Forget Password' : 'Reset New Password'}</h2>
                </div>

                <div className="form of-h">
                    {stage === 1 && (
                        <form onSubmit={sendCode}>
                            {error ? <div className="text-center alert alert-danger">{error}</div> : ''}
                            {success ? <div className="text-center alert alert-success">{success}</div> : ''}
                            <div className="form-group text-left">
                                <label htmlFor="Username">Email</label>
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <AccountCircleIcon style={{ fontSize: 20 }} />
                                    </span>
                                    <input type="email"
                                        className="form-control"
                                        id="Username"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={event => setEmail(event.target.value)}
                                    />
                                </div>
                                {loader ? <Loader className="loader" type="ThreeDots" color="#093171" height="100" width="100" /> : ''}
                            </div>
                            <div className="form-group">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >Send verification code
                                </button>
                            </div>
                            <div className="form-group">
                                <button
                                    type="submit"
                                    className="btn btn-outline-primary"
                                    onClick={redirectToLogin}
                                >Back to login
                                </button>
                            </div>
                        </form>
                    )}

                    {stage === 2 && (
                        <form onSubmit={resetPassword}>

                            {error ? <div className="text-center alert alert-danger">{error}</div> : ''}
                            {success ? <div className="text-center alert alert-success">{success}</div> : ''}

                            <div className="form-group text-left">
                                <label htmlFor="Username">Code</label>
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <vCode style={{ fontSize: 20 }} />
                                    </span>
                                    <input type="code"
                                        className="form-control"
                                        id="code"
                                        placeholder="Verification Code here (i.e 443***)"
                                        value={code}
                                        onChange={event => setCode(event.target.value)}
                                    />
                                </div>
                            </div>
                            {loader ? <Loader className="loader" type="ThreeDots" color="#093171" height="100" width="100" /> : ''}

                            <div className="form-group text-left">
                                <label htmlFor="Username">Password</label>
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <LockOutlinedIcon style={{ fontSize: 20 }} />
                                    </span>
                                    <input type={passwordShown ? "text" : "password"}
                                        className="form-control"
                                        id="password"
                                        placeholder="******"
                                        value={password}
                                        onChange={event => setPassword(event.target.value)}
                                    />
                                    <span className={styles.addon_icon} onClick={togglePasswordVisiblity}>
                                        {passwordShown ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </span>
                                </div>
                            </div>

                            <div className="form-group text-left">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <div className="input-group">
                                    <span className="input-group-addon">
                                        <LockOutlinedIcon style={{ fontSize: 20 }} />
                                    </span>
                                    <input type={CpasswordShown ? "text" : "password"}
                                        className="form-control"
                                        id="confirmPassword"
                                        placeholder="******"
                                        value={confirmPassword}
                                        onChange={event => setConfirmPassword(event.target.value)}
                                    />
                                    <span className={styles.addon_icon} onClick={toggleCPasswordVisiblity}>
                                        {CpasswordShown ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </span>
                                </div>
                            </div>
                            <div className="form-group">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >Change Password
                                </button>
                            </div>

                            <div className="form-group">
                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={redirectToForgetPassword}
                                >Back
                                </button>
                            </div>
                        </form>
                    )}

                </div>
            </div>

        </div>
    )
}

export default withRouter(ForgetPassword);