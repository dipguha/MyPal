// Direct call to Cognito's InitiateAuth (USER_PASSWORD_AUTH flow).
// Unsigned REST request — no AWS SDK needed.

import { createHmac } from "crypto";

type Env = {
  region: string;
  clientId: string;
  clientSecret: string;
};

function loadEnv(): Env {
  const issuer = process.env.COGNITO_ISSUER ?? "";
  const region = issuer.match(/cognito-idp\.([^.]+)\.amazonaws\.com/)?.[1] ?? "eu-west-1";
  return {
    region,
    clientId: process.env.COGNITO_CLIENT_ID ?? "",
    clientSecret: process.env.COGNITO_CLIENT_SECRET ?? "",
  };
}

function secretHash(username: string, clientId: string, clientSecret: string): string {
  return createHmac("sha256", clientSecret).update(username + clientId).digest("base64");
}

export type CognitoTokens = {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type CognitoAuthError = {
  code: string;
  message: string;
};

export async function initiateUserPasswordAuth(
  email: string,
  password: string,
): Promise<CognitoTokens | CognitoAuthError> {
  const env = loadEnv();
  if (!env.clientId || !env.clientSecret) {
    return { code: "ConfigError", message: "Cognito client is not configured." };
  }

  const body = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: env.clientId,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
      SECRET_HASH: secretHash(email, env.clientId, env.clientSecret),
    },
  };

  const res = await fetch(`https://cognito-idp.${env.region}.amazonaws.com/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json().catch(() => ({}))) as {
    __type?: string;
    message?: string;
    AuthenticationResult?: {
      AccessToken: string;
      IdToken: string;
      RefreshToken: string;
      ExpiresIn: number;
    };
  };

  if (!res.ok || !json.AuthenticationResult) {
    return {
      code: json.__type?.split("#").pop() ?? "UnknownError",
      message: json.message ?? "Sign-in failed.",
    };
  }

  return {
    accessToken: json.AuthenticationResult.AccessToken,
    idToken: json.AuthenticationResult.IdToken,
    refreshToken: json.AuthenticationResult.RefreshToken,
    expiresIn: json.AuthenticationResult.ExpiresIn,
  };
}
