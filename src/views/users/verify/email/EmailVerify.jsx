import React, { useState } from 'react';
import { withRouter } from "react-router-dom";
import Loader from 'react-loader-spinner';
import styles from './EmailVerify.module.css';
import { MdAccountCircle } from 'react-icons/md';



const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-1',
    'accessKeyId': 'AKIAXSF7D3U5TURU3L75',
    'secretAccessKey': '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'
});
const cognito = new AWS.CognitoIdentityServiceProvider({ region: 'us-east-1' });


function EmailVerify(props) {

    const [errorMessage, setErrorMessage] = useState('');
    const [loader, setLoader] = useState(false);
    const [code, setCode] = useState("");
    const [display, setState] = useState({
        "verifyField": 0,
        "verifyForm": 1,
    });


    //edit users variables
    const [email, setEmail] = useState('');
    const [username, setUserName] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const onSubmit = event => {
        event.preventDefault();
        setLoader(true);
        const getSingleUser = {
            UserPoolId: 'us-east-1_lB9QiQUOz',
            Username: email.toLowerCase()
        }
        cognito.adminGetUser(getSingleUser, (err, data) => {
            if (err) {
                setSuccessMsg('')
                if (err.code === 'InvalidParameterException') {
                    setErrorMessage('Please enter email address!');
                }
                if (err.code === 'UserNotFoundException') {
                    setErrorMessage('Account not found!');
                }
                setLoader(false);
                return;
            } else {
                setUserName(data.Username)
                var params = {
                    ClientId: '3pt69sfsn4tgoa7jtbgfvnv42h',
                    Username: data.Username
                };
                cognito.resendConfirmationCode(params, function (err, data) {
                    if (err) {
                        setSuccessMsg('')
                        setErrorMessage(err.message);
                        setLoader(false);
                    }
                    else {
                        setErrorMessage('')
                        setSuccessMsg('Verification code sent to email address!')
                        setLoader(false);
                        setTimeout(() => {
                            setState({ 'verifyField': 1 });
                            setSuccessMsg('')
                        }, 2000);
                    }
                });
            }
        });
    };

    const verifyEmail = event => {
        event.preventDefault();
        setLoader(true);
        var params = {
            ClientId: '3pt69sfsn4tgoa7jtbgfvnv42h',
            ConfirmationCode: code,
            Username: username,
        };
        cognito.confirmSignUp(params, function (err, data) {
            if (err) {
                setSuccessMsg('')
                if (err.code === 'InvalidParameterException') {
                    setErrorMessage('Please enter verification code!');
                }
                if (err.code === 'CodeMismatchException') {
                    setErrorMessage(err.message);
                }
                setLoader(false);
                return;
            }
            else {
                setLoader(false);
                setErrorMessage('')
                setSuccessMsg('Verification successful !')
                setTimeout(() => {
                    redirectToLogin();
                }, 2000);
            }
        });
    };

    const redirectToLogin = () => {
        props.history.push('/');

    }

    return (
        <div className={styles.admin_login}>
            <div className="card  col-12 col-lg-4 login-card admin-login">
                <div className="login__header text-center">
                    <h2>Verify Email Address</h2>
                </div>

                {display.verifyForm === 1 ?
                    <div>

                        <div className="form of-h">
                            <form onSubmit={onSubmit}>
                                <div className="form-group text-left">
                                    <label htmlFor="Email">Email</label>
                                    <div className="input-group">
                                        <span className="input-group-addon">
                                            <MdAccountCircle />
                                        </span>
                                        <input type="text"
                                            className="form-control"
                                            id="Email"
                                            placeholder="Enter your email (i.e abc@example.com)"
                                            value={email}
                                            onChange={event => setEmail(event.target.value)}
                                        />
                                    </div>
                                </div>
                                {errorMessage ? <div className="alert alert-danger">{errorMessage}</div> : ''}
                                {successMsg ? <div className="alert alert-success">{successMsg}</div> : ''}
                                <div className="form-check"></div>

                                <div className="btn-group btn-block" role="group">
                                    <button type="submit" className="btn btn-primary">Send Verification Code</button>&nbsp;
                                </div>
                            </form>
                            {loader ? <Loader type="ThreeDots" color="#093171" height="100" width="100" /> : ''}

                        </div>
                    </div>
                    : ''}




                {
                    display.verifyField === 1 ?
                        <div>

                            <div className="form of-h">

                                <form onSubmit={verifyEmail}>

                                    <div className="form-group text-left">
                                        <label htmlFor="verify-email">Verification Code</label>
                                        <div className="input-group">
                                            <span className="input-group-addon">
                                                <vCode style={{ fontSize: 20 }} />
                                            </span>
                                            <input type="code"
                                                className="form-control"
                                                id="verify-email"
                                                placeholder="Enter verification code sent to your email!"
                                                value={code}
                                                onChange={event => setCode(event.target.value)}
                                            />
                                        </div>

                                    </div>
                                    {errorMessage ? <div className="alert alert-danger">{errorMessage}</div> : ''}
                                    {successMsg ? <div className="alert alert-success">{successMsg}</div> : ''}

                                    <div className="form-check"></div>

                                    <div className="btn-group btn-block" role="group">
                                        <button type="submit" className="btn btn-primary">Verify</button>&nbsp;
                                    </div>

                                </form>
                                {loader ? <Loader className="loader" type="ThreeDots" color="#093171" height="100" width="100" /> : ''}

                            </div>
                        </div>
                        : ''
                }

            </div>

        </div>
    )
}

export default withRouter(EmailVerify);