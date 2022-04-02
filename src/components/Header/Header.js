import React from 'react';
import { FormattedMessage } from 'react-intl';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './Header.css';
import { Navbar, Nav } from 'react-bootstrap';
import NavLink from '../NavLink';
import messages from '../../locale/messages';
import Link from '../Link';
import { connect } from 'react-redux';
import cx from 'classnames';
import { api, logoUploadDir } from '../../config'
import { flowRight as compose } from 'lodash';
import history from '../../history';
import HeaderModal from '../HeaderModal/HeaderModal';
import { openHeaderModal } from '../../actions/siteadmin/modalActions';
import { formatLocale } from '../../helpers/formatLocale';
import LanguageIcon from '../../../public/Icons/languageIcon.svg';



class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: 0,
    };
    this.openMenu = this.openMenu.bind(this);
    this.openClose = this.openClose.bind(this);
  }



  async openMenu() {
    this.setState({
      isOpen: 1,
    })
  }
  async openClose() {
    this.setState({
      isOpen: 0,
    })
  }

  handleChange(e) {
    const { openHeaderModal } = this.props;
    openHeaderModal('languageModal');
  }



  render() {
    let location;

    if (history.location) {
      location = history.location.pathname;
    }



    const { logo, logoHeight, logoWidth, siteName, isOpen, currentLocale, openHeaderModal, } = this.props
    return (
      <div className={cx(s.root, 'mainMenu')}>
        <Navbar expand="lg" className={cx(s.navBg, { ['homeHeader']: location === '/' || location === '/home' })}>
          <HeaderModal />
          <Navbar.Brand>
            <Link className={s.brand} to="/">
              <img
                src={api.apiEndpoint + logoUploadDir + logo}
                // srcSet={`${logoUrl2x} 2x`}
                width={Number(logoWidth)}
                height={Number(logoHeight)}
                alt={siteName}
              />
            </Link>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" className={cx(s.borderNone, s.outlineNone)}
            children={
              <div className={'menuToggle'} onClick={() => this.openMenu()}>
                {/* <input type="checkbox" /> */}
                <span></span>
                <span></span>
                <span></span>
                {/* &#9776; */}
              </div>
            }
          />
          <Navbar.Collapse className={cx({ [s.menuOpened]: this.state.isOpen == 1 }, s.justifyFlexEnd, s.menuClosed)} in={isOpen} id="basic-navbar-nav">

            <Nav className={s.navigationLink} onClick={() => this.openClose()}>
              <div className={cx(s.closeButton, 'closeButtonHomeRTL')}> &#x2715; </div>
              <NavLink noLink
                onClick={(e) => this.handleChange(e)}
                className={cx(s.siteColor, s.cursurPointer)}>
                <span className={cx(s.displayInlineBlock, s.vtrTop, s.iconWidth, s.languageIcon)}>
                  <img src={LanguageIcon} className={cx(s.sideMenuIcon, s.noFilter)} />
                </span>
                <span className={cx(s.displayInlineBlock, s.vtrMiddle, s.iconTextPadding, 'iconTextPaddingRTL')}>
                  {formatLocale(currentLocale)}
                </span>
              </NavLink>
              <NavLink to="/" ><FormattedMessage {...messages.homeonly} /></NavLink>
              <NavLink to="/rider" ><FormattedMessage {...messages.rider} /></NavLink>
              <NavLink to="/driver" ><FormattedMessage {...messages.driver} /></NavLink>
              <NavLink to="/support" ><FormattedMessage {...messages.contact} /></NavLink>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </div>
    )
  }
}

const mapState = (state) => ({
  logo: state.siteSettings.data.homeLogo,
  logoHeight: state.siteSettings.data.logoHeight,
  logoWidth: state.siteSettings.data.logoWidth,
  siteName: state.siteSettings.data.siteName,
  currentLocale: state.intl.locale
})
const mapDispatch = {
  openHeaderModal
}

export default compose(
  withStyles(s),
  connect(mapState, mapDispatch)
)(Header)
