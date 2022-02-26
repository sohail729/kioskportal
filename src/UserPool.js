import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: 'us-east-1_lB9QiQUOz',
  ClientId: '3pt69sfsn4tgoa7jtbgfvnv42h'
};

export default new CognitoUserPool(poolData);