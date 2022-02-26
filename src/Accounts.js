import React, { createContext } from "react";
import { CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import Pool from "./UserPool";
import axios from 'axios';

const AccountContext = createContext();


const Account = props => {
  const getSession = async () =>
    await new Promise((resolve, reject) => {
      const user = Pool.getCurrentUser();
      if (user) {
        user.getSession(async (err, session) => {
          if (err) {
            reject();
          } else {
            const attributes = await new Promise((resolve, reject) => {
              user.getUserAttributes((err, attributes) => {
                if (err) {
                  reject(err);
                } else {
                  const results = {};

                  for (let attribute of attributes) {
                    const { Name, Value } = attribute;
                    results[Name] = Value;
                  }
                  resolve(results);
                }
              });
            });

            resolve({
              user,
              ...session,
              ...attributes
            });
          }
        });
      } else {
        reject();
      }
    });

  const authenticate = async (Username, Password) =>
    await new Promise((resolve, reject) => {
      const user = new CognitoUser({ Username, Pool });
      const authDetails = new AuthenticationDetails({ Username, Password });
      user.authenticateUser(authDetails, {
        onSuccess: data => {
          data.onSuccess = true;
          resolve(data);
        },

        onFailure: err => {
          reject(err);
        },

        newPasswordRequired: data => {
          data.newPasswordRequired = true;
          data.user = user;
          resolve(data);
        }
      });
    });

  const logout = () => {
    const user = Pool.getCurrentUser();
    if (user) {
      user.signOut();
    }
  };

  const getCurUser = async (payload) =>
    await new Promise((resolve, reject) => {
      axios.post('https://4uzxj5hhqc.execute-api.us-east-1.amazonaws.com/get_data_stage', payload)
        .then(function (response) {
          if (response.status === 200) {
            if (response.data.statusCode === 200) {
              resolve(response.data);
            } else if (response.data.statusCode === 400) {
              reject(response.data.message)
            } else if (response.data.errorMessage) {
              reject('Something went wrong!');
              console.error(response);
            }
          }
        })
        .catch(function (error) {
          reject(error.KeyError)
        });
    });

  return (
    <AccountContext.Provider
      value={{
        authenticate,
        getSession,
        logout,
        getCurUser
      }}
    >
      {props.children}
    </AccountContext.Provider>
  );
};

export { Account, AccountContext };
