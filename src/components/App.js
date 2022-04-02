
import React from 'react';
import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';
import { Provider as ReduxProvider } from 'react-redux';
import { ApolloProvider } from 'react-apollo';
import StyleContext from 'isomorphic-style-loader/StyleContext';
import ApplicationContext from './ApplicationContext';
// Moment Locale
import moment from 'moment';
import { isRTL } from '../helpers/formatLocale';

import io from 'socket.io-client';
import SocketContext from '../core/socketNotifications/SocketContext'

import { api } from '../config';

const secure = api.socketUrl && api.socketUrl.indexOf('https://') >= 0 ? true : false;

export const socket = io(api.socketUrl,
  {
    secure,
    upgrade: true,
    transports: ['websocket'],
    reconnection: true,
    forceNew: true,
    rejectUnauthorized: false
  }
);

const ContextType = {
  // Enables critical path CSS rendering
  // https://github.com/kriasoft/isomorphic-style-loader
  // insertCss: PropTypes.func.isRequired,
  // Universal HTTP client
  fetch: PropTypes.func.isRequired,
  pathname: PropTypes.string.isRequired,
  query: PropTypes.object,
  // Integrate Redux
  // http://redux.js.org/docs/basics/UsageWithReact.html
  ...ReduxProvider.childContextTypes,
  // Apollo Client
  client: PropTypes.object.isRequired,
  // ReactIntl
  intl: IntlProvider.childContextTypes.intl,
  locale: PropTypes.string,
};

/**
 * The top-level React component setting context (global) variables
 * that can be accessed from all the child components.
 *
 * https://facebook.github.io/react/docs/context.html
 *
 * Usage example:
 *
 *   const context = {
 *     history: createBrowserHistory(),
 *     store: createStore(),
 *   };
 *
 *   ReactDOM.render(
 *     <App context={context}>
 *       <Layout>
 *         <LandingPage />
 *       </Layout>
 *     </App>,
 *     container,
 *   );
 */
class App extends React.PureComponent {
  static propTypes = {
    // Enables critical path CSS rendering
    // https://github.com/kriasoft/isomorphic-style-loader
    insertCss: PropTypes.func.isRequired,
    context: PropTypes.shape(ContextType).isRequired,
    children: PropTypes.element.isRequired,
  };

  // static childContextTypes = ContextType;

  // getChildContext() {
  //   return this.props.context;
  // }

  // NOTE: This methods are not needed if you update URL by setLocale action.

  componentDidMount() {
    const { context } = this.props;
    const store = context && context.store;
    if (store) {
      this.lastLocale = store.getState().intl.locale;
      this.unsubscribe = store.subscribe(() => {
        const state = store.getState();
        const { newLocale, locale } = state.intl;
        if (!newLocale && this.lastLocale !== locale) {
          this.lastLocale = locale;
          this.forceUpdate();
        }
      });
    }
    const locale = context && context.locale;

    moment.defineLocale(locale + '-dup', { // Updating moment locale 
      parentLocale: isRTL(locale) ? locale : 'en',
      preparse: function (string) {
        return string;
      },
      postformat: function (string) {
        return string;
      }
    });

    this.setState({
      load: true
    })
  }



  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  render() {
    // Here, we are at universe level, sure? ;-)
    //const { context, context: { store, locale }, insertCss } = this.props;
    const { context, insertCss } = this.props;
    const store = context && context.store;
    const state = store && store.getState();
    this.intl = (state && state.intl) || {};
    const { initialNow, locale, messages } = this.intl;
    const localeMessages = (messages && messages[locale]) || {};

    return (
      <ReduxProvider store={context.store}>
        <SocketContext.Provider value={socket}>
          <StyleContext.Provider value={{ insertCss }} >
            <ApplicationContext.Provider value={{ context }}>
              <IntlProvider
                initialNow={initialNow}
                locale={locale}
                messages={localeMessages}
                defaultLocale="en-US"
              >
                <ApolloProvider client={context.client} store={context.store}>
                  {React.Children.only(this.props.children)}
                </ApolloProvider>
              </IntlProvider>
            </ApplicationContext.Provider>
          </StyleContext.Provider>
        </SocketContext.Provider>
      </ReduxProvider>
    );

    // NOTE: If you need to add or modify header, footer etc. of the app,
    // please do that inside the Layout component.
    // return (
    //   <IntlProvider locale={locale} value={{ context }}>
    //     <ReduxProvider store={context.store}>
    //       <StyleContext.Provider value={{ insertCss }} >
    //         <ApplicationContext.Provider value={{ context }}>
    //           <ApolloProvider client={context.client} store={context.store}>
    //             {React.Children.only(this.props.children)}
    //           </ApolloProvider>
    //         </ApplicationContext.Provider>
    //       </StyleContext.Provider>
    //     </ReduxProvider>
    //   </IntlProvider>
    // );
  }
}

export default App;
