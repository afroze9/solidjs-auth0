import { AuthorizationParams, LogoutOptions, RedirectLoginOptions, User, createAuth0Client } from '@auth0/auth0-spa-js';
import { JSX, createContext, createResource, createSignal, mergeProps, useContext } from 'solid-js';
import { Auth0Props } from './Auth0Props';
import { Auth0State } from './Auth0State';

export const Auth0Context = createContext<Auth0State>();
export const useAuth0 = (context = Auth0Context) => useContext(context);

/**
 * Checks if a URL is a redirect callback from Auth0 by checking for the presence of 'code' and 'state' parameters in the URL query.
 * @param {string} url - The URL to check.
 * @returns {boolean} - Returns true if the URL is a redirect callback from Auth0 and false otherwise.
 */
const isRedirect = (url: string) => {
  const [, query] = url.split('?');
  return typeof query === 'string' && query.includes('code=') && query.includes('state=');
};

/**
 * Returns the current URL.
 * @returns {string} - The current URL.
 */
const getUrl = () => {
  return window.location.href;
};

/**
 * Updates the URL in the browser history to remove any query parameters after an Auth0 login redirect.
 * @param {any} _appState - Unused.
 * @param {string | undefined} loginRedirectUri - The URI to redirect to after logging in.
 */
const onLogin = (_appState: unknown, loginRedirectUri?: string) => {
  if (loginRedirectUri !== undefined) {
    window.history.replaceState(undefined, '', loginRedirectUri);
  }
};

/**
 * Component that provides authentication using Auth0.
 * @param props The props for the component.
 * @returns The rendered component.
 */
export const Auth0 = (propsIn: Auth0Props): JSX.Element => {
  // Merge props with defaults
  const props = mergeProps(
    {},
    {
      onLogin,
      getUrl,
      loginRedirectUri: window.location.origin,
    },
    propsIn,
  );

  // Create reactive authorization parameters while avoiding existence of undefined properties
  const authorizationParams = () => {
    const params: AuthorizationParams = {};
    if (props.audience !== undefined) {
      params.audience = props.audience;
    }
    if (props.scope !== undefined) {
      params.scope = props.scope;
    }
    params.redirect_uri = props.loginRedirectUri;
    return params;
  };

  // Create the reactive Auth0 client promise that resolves to an instance
  const auth0ClientPromise = () => {
    return createAuth0Client({
      domain: props.domain,
      clientId: props.clientId,
      authorizationParams: authorizationParams(),
    });
  };

  // Create signals for the user and authentication status
  const [isAuthenticated, setIsAuthenticated] = createSignal<boolean | undefined>(undefined);
  const [user, setUser] = createSignal<User>();

  // Create a resource for the Auth0 client instance
  const [auth0Client] = createResource(async () => {
    const client = await auth0ClientPromise();
    const url = props.getUrl();

    if (isRedirect(url)) {
      const result = await client.handleRedirectCallback(url);
      props.onLogin(result.appState, props.loginRedirectUri);
    }

    if (setIsAuthenticated(await client.isAuthenticated())) {
      setUser(await client.getUser());
    }

    return client;
  });

  // Render the component
  return (
    <Auth0Context.Provider
      value={{
        auth0Client,
        isLoading: () => auth0Client.loading || isAuthenticated() === undefined,
        isAuthenticated: () => Boolean(isAuthenticated()),
        user,
        loginWithRedirect: async (options?: RedirectLoginOptions) => {
          const client = await auth0ClientPromise();
          await client.loginWithRedirect({
            authorizationParams: {
              ...authorizationParams(),
              ...options,
            },
          });
        },
        logout: async (options?: LogoutOptions) => {
          const client = await auth0ClientPromise();
          await client.logout({
            logoutParams: {
              returnTo: props.logoutRedirectUri,
              ...options,
            },
          });
        },
        getToken: async () => {
          const client = await auth0ClientPromise();
          return client.getTokenSilently();
        },
      }}
    >
      {props.children}
    </Auth0Context.Provider>
  );
};
