import { JSX, createEffect, mergeProps } from 'solid-js';
import { useAuth0 } from './Auth0';
import { ProtectedRouteProps } from './ProtectedRouteProps';

const defaultOnRedirecting: JSX.Element = <>Loading...</>;

const defaultReturnTo = (): string => `${window.location.pathname}${window.location.search}`;

/**
 * Component that wraps a protected route in the application, ensuring that the user is authenticated before rendering the content.
 * @param {ProtectedRouteProps} props - Props for the component.
 * @returns {(() => JSX.Element) | JSX.Element} - The protected route or a redirecting element.
 */
export const Protected = (propsIn: ProtectedRouteProps): JSX.Element => {
  const auth0 = useAuth0();
  // Merge props with defaults
  const props = mergeProps(
    {
      defaultOnRedirecting,
      defaultReturnTo,
    },
    propsIn,
  );

  createEffect(() => {
    if (auth0?.isLoading() === true || auth0?.isAuthenticated() === true) {
      return;
    }

    const opts = {
      ...props.loginOptions,
      appState: {
        ...props.loginOptions?.appState,
        returnTo: typeof props.returnTo === 'function' ? props.returnTo() : props.returnTo,
      },
    };

    (async (): Promise<void> => {
      await auth0?.loginWithRedirect(opts);
    })().catch((err) => {
      throw new Error(`Error logging in: ${err}`);
    });
  });

  return <>{auth0?.isAuthenticated() === true ? props.children : props.onRedirecting}</>;
};
