import { JSX } from 'solid-js';

/**
 * Props for configuring the Auth0 authentication provider.
 */
export type Auth0Props = {
  /**
   * The children of the Auth0 component. These will be rendered as-is.
   */
  children: JSX.Element;

  /**
   * The Auth0 domain used for authentication.
   */
  domain: string;

  /**
   * The default audience to be used for requesting API access.
   */
  audience?: string;

  /**
   * The client ID for the Auth0 application.
   */
  clientId: string;

  /**
   * The default scope to be used on authentication requests.
   *
   * This defaults to `profile email` if not set. If you are setting extra scopes and require
   * `profile` and `email` to be included then you must include them in the provided scope.
   *
   * Note: The `openid` scope is **always applied** regardless of this setting.
   */
  scope?: string;

  /**
   * The default URL where Auth0 will redirect your browser to with
   * the authentication result. It must be whitelisted in
   * the "Allowed Callback URLs" field in your Auth0 Application's
   * settings. If not provided here, it should be provided in the other
   * methods that provide authentication.
   */
  loginRedirectUri?: string;

  /**
   * The URL where Auth0 will redirect your browser to after the logout.
   *
   * **Note**: If the `client_id` parameter is included, the
   * `returnTo` URL that is provided must be listed in the
   * Application's "Allowed Logout URLs" in the Auth0 dashboard.
   * However, if the `client_id` parameter is not included, the
   * `returnTo` URL must be listed in the "Allowed Logout URLs" at
   * the account level in the Auth0 dashboard.
   *
   * [Read more about how redirecting after logout works](https://auth0.com/docs/logout/guides/redirect-users-after-logout)
   */
  logoutRedirectUri?: string;

  /**
   * Optional function that returns the URL to redirect to after a login.
   */
  getUrl?: () => string;

  /**
   * Optional function to be called after a successful login.
   */
  onLogin?: (appState: unknown, loginRedirectUri?: string) => void;
};
