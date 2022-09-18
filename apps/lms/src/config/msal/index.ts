export const msalConfig = {
  auth: {
    authority: `https://login.microsoftonline.com/${
      process.env.NEXT_PUBLIC_AZURE_STICA_TENANT_ID as string
    }/`, // STI College Alabang Tenant ID
    clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID as string,
    redirectUri: '/',
  },
};

export const loginRequest = {
  scopes: ['User.Read'],
};
