import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {
  ChatModule
} from '../../../../src/app/chat.module';

/**
 * custom build
 * @link https://docs.amplify.aws/ui/auth/authenticator/q/framework/angular/
 */
import Amplify from 'aws-amplify';

// import awsconfig from '../aws-exports.js';

const awsConfig = {


  aws_project_region: 'eu-west-fake',
  aws_appsync_region: 'eu-west-fake',
  aws_appsync_apiKey: 'da2-fakeApiId123456',
    aws_appsync_dangerously_connect_to_http_endpoint_for_testing: true,
    aws_cognito_identity_pool_id: 'eu-west-2:948d06d9-cb0f-4744-940b-fake',
    aws_cognito_region: 'eu-west-2',
    aws_user_pools_id: 'eu-west-2_epQ3pyB1r',
    aws_user_pools_web_client_id: '553i0a7kld5spk8j3f1iijk3cv',
    oauth: {
        domain: 'fake-local.auth.eu-west-fake.example.com',
        scope: [
            'phone',
            'email',
            'openid',
            'profile',
            'aws.cognito.signin.user.admin'
        ],
        redirectSignIn: 'http://localhost:3006/',
        redirectSignOut: 'http://localhost:3006/,http://localhost:3006/',
        responseType: 'code'
    },
    federationTarget: 'COGNITO_USER_POOLS',
    aws_cognito_login_mechanisms: [
        'PREFERRED_USERNAME'
    ],
    aws_cognito_signup_attributes: [
        'EMAIL'
    ],
    aws_cognito_mfa_configuration: 'OFF',
    aws_cognito_mfa_types: [
        'SMS'
    ],
    aws_cognito_password_protection_settings: {
        passwordPolicyMinLength: 8,
        passwordPolicyCharacters: []
    },
    aws_cognito_verification_mechanisms: [
        'EMAIL'
    ]
};

Amplify.configure(awsConfig);

// import Interactions from '@aws-amplify/interactions';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ChatModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
