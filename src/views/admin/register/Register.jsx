import React, { useState } from 'react';
import { withRouter } from "react-router-dom";
import Loader from 'react-loader-spinner';
import styles from './Register.module.css';
import { MdAccountCircle, MdLockOutline } from 'react-icons/md';
import UserPool from '../../../UserPool';
import cryptoRandomString from 'crypto-random-string';
import axios from 'axios';
import CONSTANTS from '../../../constants/apiContants';

const key = cryptoRandomString({ length: 40, type: 'base64' });


const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-1',
    'accessKeyId': 'AKIAXSF7D3U5TURU3L75',
    'secretAccessKey': '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'
});
const cognito = new AWS.CognitoIdentityServiceProvider({ region: 'us-east-1' });


function Register(props) {

    const [today] = useState(new Date());
    const [errorMessage, setErrorMessage] = useState('');
    const [loader, setLoader] = useState(false);
    const [ankey] = useState(key);
    const [code, setCode] = useState("");
    const [display, setState] = useState({
        "verifyField": 0,
        "registerForm": 1,
    });


    //add user variables
    const [addName, setAddName] = useState('');
    const [addEmail, setAddEmail] = useState('');
    const [addPassword, setAddPassword] = useState('');

    //edit users variables
    const [username, setUserName] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const onSubmit = event => {
        event.preventDefault();
        setLoader(true);
        UserPool.signUp(addEmail, addPassword, [
            { Name: "preferred_username", Value: addName },
            { Name: "custom:user_key", Value: ankey },
        ], null, (err, data) => {
            if (err) {
                if (err.code === 'InvalidParameterException') {
                    setErrorMessage('Please fill required fields!');
                }
                if (err.code === 'UsernameExistsException') {
                    setErrorMessage(err.message);
                }
                setLoader(false);
            } else {
                setUserName(data.userSub)
                addUserInDyn(data.userSub)
                setLoader(false);
                addUsertoGroup(data.userSub);
                setErrorMessage('')
                setState({
                    'verifyField': 1
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
            console.log(err)

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
                setErrorMessage('')
                setSuccessMsg('Verification successful !')
                setTimeout(() => {
                    redirectToLogin();
                }, 2000);
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
            'date': today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate(),
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
                console.log(err);
                setErrorMessage('Please fill required fields!')
            } else {
                console.log(data);
            }
        });
    }
    const redirectToLogin = () => {
        props.history.push('/');
    }

    return (
        <div className={styles.admin_login}>
            <div className="card  col-12 col-lg-4 login-card admin-login">
                {display.registerForm === 1 ?
                    <div>
                        <div className="login__header text-center">
                            <h2>Register Account</h2>
                        </div>

                        <div className="form of-h">
                            {errorMessage ? <div className="alert alert-danger">{errorMessage}</div> : ''}
                            <form onSubmit={onSubmit}>

                                <div className="form-group text-left">
                                    <label htmlFor="Username">Name *</label>
                                    <div className="input-group">
                                        <span className="input-group-addon">
                                            <MdAccountCircle />
                                        </span>
                                        <input type="text"
                                            className="form-control"
                                            id="name"
                                            placeholder="Enter your name (i.e Micheal)"
                                            value={addName}
                                            onChange={event => setAddName(event.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="form-group text-left">
                                    <label htmlFor="Email">Email *</label>
                                    <div className="input-group">
                                        <span className="input-group-addon">
                                            <MdAccountCircle />
                                        </span>
                                        <input type="text"
                                            className="form-control"
                                            id="Email"
                                            placeholder="Enter your email (i.e abc@example.com)"
                                            value={addEmail}
                                            onChange={event => setAddEmail(event.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="form-group text-left">
                                    <label htmlFor="password">Password *</label>
                                    <div className="input-group">
                                        <span className="input-group-addon">
                                            <MdLockOutline />
                                        </span>
                                        <input type="password"
                                            className="form-control"
                                            id="password"
                                            placeholder="Enter your password"
                                            value={addPassword}
                                            onChange={event => setAddPassword(event.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="form-check"></div>

                                <div className="btn-group btn-block" role="group">
                                    <button type="submit" className="btn btn-primary">Register</button>&nbsp;
                                    <button type="button" onClick={redirectToLogin} className="btn btn-outline-primary">Back</button>
                                </div>
                                {loader ? <Loader type="ThreeDots" color="#093171" height="100" width="100" /> : ''}
                            </form>

                        </div>
                    </div>
                    : ''}




                {
                    display.verifyField === 1 ?
                        <div>
                            <div className="login__header text-center">
                                <h2>Verify Email</h2>
                            </div>

                            <div className="form of-h">
                                {errorMessage ? <div className="alert alert-danger">{errorMessage}</div> : ''}
                                {successMsg ? <div className="alert alert-success">{successMsg}</div> : ''}

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
                                    <div className="form-check"></div>

                                    <div className="btn-group btn-block" role="group">
                                        <button type="submit" className="btn btn-primary">Verify</button>&nbsp;
                                    </div>
                                    {loader ? <Loader type="ThreeDots" color="#093171" height="100" width="100" /> : ''}
                                </form>

                            </div>
                        </div>
                        : ''
                }

            </div>

        </div>
    )
}

export default withRouter(Register);