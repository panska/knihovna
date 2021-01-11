import { LogLevel } from '@azure/msal-browser';

export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_OAUTH_APP_ID,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      },
      logLevel: LogLevel.Verbose,
    },
  },
};

export const loginRequest = {
  scopes: ['user.read', 'email', 'profile'],
};
