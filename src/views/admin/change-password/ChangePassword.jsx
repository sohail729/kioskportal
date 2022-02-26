import React, { useState } from 'react';
import { withRouter } from "react-router-dom";
import Loader from 'react-loader-spinner';
import styles from './ChangePassword.module.css';
import {MdLockOutline } from 'react-icons/md';
import cryptoRandomString from 'crypto-random-string';

const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-east-1',
    'accessKeyId': 'AKIAXSF7D3U5TURU3L75',
    'secretAccessKey': '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'
});
const cognito = new AWS.CognitoIdentityServiceProvider({ region: 'us-east-1' });

const key = cryptoRandomString({length: 40, type: 'base64'});

function ChangePassword(props) {
  
    const [name]                         =   useState('');
    const [password, setPassword]                 =   useState('');
    const [errorMessage, setErrorMessage]         =   useState('');
    const [successMessage, setSuccessMessage]         =   useState('');
    const [loader]                     =   useState(false);
    const [ankey]   =   useState(key);
    const [role]   =   useState(props.role);
  
    const onSubmit = event => {
        event.preventDefault();
        var params = {
            ChallengeName: 'NEW_PASSWORD_REQUIRED', 
            ClientId: '3pt69sfsn4tgoa7jtbgfvnv42h',
            ChallengeResponses: {
                USERNAME: props.user.user.username,
                NEW_PASSWORD: password,
                'cognito:preferred_role': 'admin',
                'userAttributes.preferred_username': name,
                'userAttributes.custom:role': role,
                'userAttributes.custom:user_key': ankey,
                
            },
            UserPoolId: 'us-east-1_lB9QiQUOz',
            Session: props.user.user.Session
            };

            cognito.adminRespondToAuthChallenge(params, function(err, data) {
                if (err) { 
                    setErrorMessage('Required fields are missing!') 
                } else { 
                    setSuccessMessage('Information successfully updated. Please login again!');  
                }
            });
    };
    
    const ClearMsgs = () => {
        setErrorMessage('')
        setSuccessMessage('')
    }
    return (
        <div className={styles.login_card}>
            <div className="card col-12 col-lg-4 login-card hv-center">
                 
                <div className="login__header text-center">
                    <h2>Change Password</h2> 
                </div>
                <div className="form">
                {errorMessage ? <div className="text-center alert alert-danger alert-dismissible fade show" role="alert">
                      {errorMessage}
                  <button type="button" onClick={ClearMsgs}  className="close" data-dismiss="alert" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                  </button>
                  </div>: ''}
                {successMessage ? <div className="text-center alert alert-success alert-dismissible fade show" role="alert">
                      {successMessage}
                  <button type="button" onClick={ClearMsgs} className="close" data-dismiss="alert" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                  </button>
                  </div> : ''}

                    <form >        
                        <div className="form-group text-left">
                            <label htmlFor="password">Password</label>
                            <div className="input-group">
                                <span className="input-group-addon">
                                <MdLockOutline/>
                                </span>
                                <input type="password" 
                                    className="form-control" 
                                    id="password" 
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={event => setPassword(event.target.value)} 
                                />
                            </div>
                        </div>
                        <div className="form-check"></div>
                        <button 
                            type="submit" 
                            className="btn btn-primary mb-3"
                            onClick={onSubmit}
                            >Change
                        </button>

                        <button className="btn btn-outline-primary" >Back</button>
                        {loader? <Loader type="ThreeDots" color="#093171" height="100" width="100" /> : ''}
                    </form>        
                </div>
            </div>

        </div>
     )
}

export default withRouter(ChangePassword);