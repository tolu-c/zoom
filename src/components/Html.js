
import React from 'react';
import PropTypes from 'prop-types';
import serialize from 'serialize-javascript';
import config from '../config';
import { ssrBehavior } from "react-md-spinner";
import { isRTL } from '../helpers/formatLocale';

/* eslint-disable react/no-danger */

class Html extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    styles: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        cssText: PropTypes.string.isRequired,
      }).isRequired,
    ),
    scripts: PropTypes.arrayOf(PropTypes.string.isRequired),
    // eslint-disable-next-line react/forbid-prop-types
    app: PropTypes.object.isRequired,
    children: PropTypes.string.isRequired,
  };

  static defaultProps = {
    styles: [],
    scripts: [],
  };

  render() {
    const { title, description, styles, scripts, app, children } = this.props;
    let bodyClassName = isRTL(app.lang) ? 'rtl' : '';

    return (
      <html className="no-js" lang={app.lang}>
        <head>
          <meta charSet="utf-8" />
          <meta httpEquiv="x-ua-compatible" content="ie=edge" />
          <title>{title}</title>
          <meta name="description" content={description} />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {scripts.map(script => (
            <link key={script} rel="preload" href={script} as="script" />
          ))}
          <link rel="manifest" href="/site.webmanifest" />

          <link rel="apple-touch-icon" sizes="57x57" href={"/images/favicon/apple-icon-57x57.png"} />
          <link rel="apple-touch-icon" sizes="60x60" href={"/images/favicon/apple-icon-60x60.png"} />
          <link rel="apple-touch-icon" sizes="72x72" href={"/images/favicon/apple-icon-72x72.png"} />
          <link rel="apple-touch-icon" sizes="76x76" href={"/images/favicon/apple-icon-76x76.png"} />
          <link rel="apple-touch-icon" sizes="114x114" href={"/images/favicon/apple-icon-114x114.png"} />
          <link rel="apple-touch-icon" sizes="120x120" href={"/images/favicon/apple-icon-120x120.png"} />
          <link rel="apple-touch-icon" sizes="144x144" href={"/images/favicon/apple-icon-144x144.png"} />
          <link rel="apple-touch-icon" sizes="152x152" href={"/images/favicon/apple-icon-152x152.png"} />
          <link rel="apple-touch-icon" sizes="180x180" href={"/images/favicon/apple-icon-180x180.png"} />
          <link rel="icon" type="image/png" sizes="192x192" href={"/images/favicon/android-icon-192x192.png"} />
          <link rel="icon" type="image/png" sizes="32x32" href={"/images/favicon/favicon-32x32.png"} />
          <link rel="icon" type="image/png" sizes="96x96" href={"/images/favicon/favicon-96x96.png"} />
          <link rel="icon" type="image/png" sizes="16x16" href={"/images/favicon/favicon-16x16.png"} />
          <link rel="apple-touch-icon" href="/icon.png" />
          <link rel="shortcut icon" href={"/images/favicon/favicon.ico"} type="image/x-icon" />
          
          <link rel="manifest" href="/manifest.json" />
          <meta name="msapplication-TileColor" content="#ffffff" />
          <meta name="msapplication-TileImage" content={"/images/favicon/ms-icon-144x144.png"} />
          <meta name="theme-color" content="#ffffff" />
          <link
            rel="stylesheet"
            href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
            integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
            crossOrigin="anonymous"
          />
          {
            isRTL(app.lang) &&
            <link rel="stylesheet" id="rtl-style" href={'/css/wooberly-rtl.min.css'} integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous" />
          }
          {/* <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/Swiper/4.5.0/css/swiper.min.css" /> */}
          <link rel="stylesheet" type="text/css" charset="UTF-8" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css" />
          <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css" />
          {styles.map(style => (
            <style
              key={style.id}
              id={style.id}
              dangerouslySetInnerHTML={{ __html: style.cssText }}
            />
          ))}
          <link rel="stylesheet" href="/css/app-common.css" />
          <link rel="stylesheet" href="/css/app-responsive-common.css" />
          <link rel="stylesheet" href="/css/rtl.css" />
          <link rel="stylesheet" type="text/css" href="/css/quill-snow.css" />
          <link rel="stylesheet" type="text/css" href="/css/react-swiper/swiper.css" />
          <link rel="stylesheet" type="text/css" href="/css/react-swiper/swiper.min.css" />
          <link rel="stylesheet" type="text/css" href="/css/phone-input.css" />
          <link rel="stylesheet" type="text/css" href="/css/flatPicker.css" />
          <style
            dangerouslySetInnerHTML={{ __html: ssrBehavior.getStylesheetString() }}
          />
        </head>
        <body className={bodyClassName}>
          <div id="app" dangerouslySetInnerHTML={{ __html: children }} />
          {/* <script src="https://unpkg.com/react/umd/react.production.min.js" crossOrigin="true" />

          <script
            src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"
            crossOrigin="true"
          /> */}

          {/* <script
            src="https://unpkg.com/react-bootstrap@next/dist/react-bootstrap.min.js"
            crossOrigin="true"
          /> */}
          <script
            dangerouslySetInnerHTML={{ __html: `window.App=${serialize(app)}` }}
          />
          {scripts.map(script => (
            <script key={script} src={script} />
          ))}
          {config.analytics.googleTrackingId && (
            <script
              dangerouslySetInnerHTML={{
                __html:
                  'window.ga=function(){ga.q.push(arguments)};ga.q=[];ga.l=+new Date;' +
                  `ga('create','${config.analytics.googleTrackingId
                  }','auto');ga('send','pageview')`,
              }}
            />
          )}
          {config.analytics.googleTrackingId && (
            <script
              src="https://www.google-analytics.com/analytics.js"
              async
              defer
            />
          )}
        </body>
      </html>
    );
  }
}

export default Html;
