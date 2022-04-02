import React from 'react';
import { connect } from 'react-redux';
import {
  Button,
  Col,
  Row
} from 'react-bootstrap';
import { FormattedMessage, injectIntl } from 'react-intl';
// Style
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './TrackingManagement.css';
import bt from '../../../components/commonStyle.css';
import messages from '../../../locale/messages';

// Components
import Loader from '../../Common/Loader/Loader';
import ShowMap from './GoogleMap/ShowMap';

import { getMapViewData, getHeatMapData } from '../../../actions/siteadmin/Tracking/getMapViewData';

//images
import userIcon from '../.../../../../../public/Icons/userIcon.png';
import avaliableIcon from '../.../../../../../public/Icons/availableIcon.png';
import unAvailableIcon from '../.../../../../../public/Icons/unavailableIcon.png';
import unActiveIcon from '../.../../../../../public/Icons/unactiveIcon.png';
import infoIcon from '../.../../../../../public/Icons/infoIcon.png';

class TrackingManagement extends React.Component {
  static defaultProps = {
    data: []
  };

  constructor(props) {
    super(props);
    this.state = {
      showSection: 0,
      type: '1',
      requestDays: 'today'
    }
    this.handleMapViewStatus = this.handleMapViewStatus.bind(this);
    this.handleHeatMapStatus = this.handleHeatMapStatus.bind(this);
    this.handleMapView = this.handleMapView.bind(this);
    this.handleHeatMap = this.handleHeatMap.bind(this);
    this.handleHistory = this.handleHistory.bind(this);
  }

  async handleMapViewStatus(e) {
    const { getMapViewData } = this.props;
    const { requestDays } = this.state;
    this.setState({
      type: e.target.value
    });
    getMapViewData(e.target.value, requestDays);
  }

  async handleHeatMapStatus(e) {
    const { getHeatMapData } = this.props;
    const { requestDays } = this.state;
    this.setState({
      type: e.target.value
    });
    getHeatMapData(e.target.value, requestDays);
  }

  async handleMapView(e) {
    const { getMapViewData } = this.props;
    this.setState({
      type: "1",
      requestDays: 'today',
      showSection: 0
    });
    getMapViewData("1", 'today');
  }

  async handleHeatMap() {
    const { getHeatMapData } = this.props;
    this.setState({
      type: "6",
      requestDays: 'today',
      showSection: 1
    });
    getHeatMapData("6", 'today');
  }

  handleHistory(requestDays) {
    const { getHeatMapData, getMapViewData } = this.props;
    const { type, showSection } = this.state;

    this.setState({ requestDays });

    if (showSection == 0) getMapViewData(type, requestDays);
    if (showSection == 1) getHeatMapData(type, requestDays);
  }

  render() {
    const { data, loading, mapMarkerPoints, heatMapData, mapLoading } = this.props;
    const { requestDays, showSection, type } = this.state;
    const { formatMessage } = this.props.intl;
    return (
      <div className={cx(s.widthInner, 'heatMapSelectRTL')}>
        <div className={s.contentBox}>
          <Row className={s.justifyContent}>
            <Col xs={12} sm={12} md={12} lg={6} className={cx(bt.noPadding, s.buttonMargin, 'textAlignRightRTL')}>
              <Button
                className={cx(bt.btnPrimary, { [bt.btnSecondary]: showSection === 1 })}
                onClick={() => this.handleMapView()}
              >
                <FormattedMessage {...messages.mapView} />
              </Button>
              <Button
                className={cx(s.marginLeft, bt.btnPrimary, 'heatmapBtnRTL', { [bt.btnSecondary]: showSection === 0 })}
                onClick={() => this.handleHeatMap()}
              >
                <FormattedMessage {...messages.heatMap} />
              </Button>
            </Col>

            <Col xs={12} sm={12} md={12} lg={3} className={cx(bt.noPadding, s.buttonMargin, 'textAlignRightRTL', s.mBmarginTop, s.marginLeftDriver, 'marginLeftDriverRTL')}>
              {showSection === 0 && <select value={type} onChange={(e) => this.handleMapViewStatus(e)} className={bt.formControlSelect}>
                <option value="1">{formatMessage(messages.all)}</option>
                <option value="2">{formatMessage(messages.riders)}</option>
                <option value="3">{formatMessage(messages.availableDrivers)}</option>
                <option value="4">{formatMessage(messages.unAvailableDrivers)}</option>
                <option value="5">{formatMessage(messages.unActivatedDrivers)}</option>
              </select>}

              {showSection === 1 && <select value={type} onChange={(e) => this.handleHeatMapStatus(e)} className={bt.formControlSelect}>
                <option value="6">{formatMessage(messages.bookings)}</option>
                <option value="7">{formatMessage(messages.activeDrivers)}</option>
              </select>}
            </Col>

            {(type != '3' && type != '4' && type != '7') && <Col xs={12} sm={12} md={12} lg={2} className={cx(bt.noPadding, s.buttonMargin, 'textAlignRightRTL', s.mBmarginTop)}>
              <select value={requestDays} onChange={(e) => this.handleHistory(e.target && e.target.value)} className={bt.formControlSelect}>
                <option value={'today'}>{formatMessage(messages.today)}</option>
                <option value={"7days"}>{formatMessage(messages.last7Days)}</option>
                <option value={"30days"}>{formatMessage(messages.last30Days)}</option>
                <option value={"alldays"}>{formatMessage(messages.allDays)}</option>
              </select>
            </Col>}
          </Row>

          {
            loading && mapLoading && <div>
              <Loader type="circle" />
            </div>
          }
          {!loading && !mapLoading &&
            <div className={s.relative}>
              <ShowMap
                mapMarkerPoints={mapMarkerPoints}
                type={type}
                heatMapData={heatMapData}
                showSection={showSection}
              />
              {showSection === 0 &&
                <div className={s.hoverCss}>
                  <div className={cx(s.infoIcon, 'infoIconRTL')}><img src={infoIcon} /></div>
                  <div className={cx(s.mapInfo, 'mapInfoRTL')}>
                    <h6 className={cx(s.mapInfoHeading, 'textAlignRightRTL')}>{formatMessage(messages.markerInfo)}</h6>
                    <div className={s.flex}>
                      <span><img src={userIcon} /></span>
                      <span className={cx(s.mapInfoText, 'mapInfoTextRTL')}>{formatMessage(messages.riders)}</span>
                    </div>
                    <div className={s.flex}>
                      <span><img src={avaliableIcon} /></span>
                      <span className={cx(s.mapInfoText, 'mapInfoTextRTL')}>{formatMessage(messages.availableDrivers)}</span>
                    </div>
                    <div className={s.flex}>
                      <span><img src={unAvailableIcon} /></span>
                      <span className={cx(s.mapInfoText, 'mapInfoTextRTL')}>{formatMessage(messages.unAvailableDrivers)}</span>
                    </div>
                    <div className={s.flex}>
                      <span><img src={unActiveIcon} /></span>
                      <span className={cx(s.mapInfoText, 'mapInfoTextRTL')}>{formatMessage(messages.unActivatedDrivers)}</span>
                    </div>
                  </div>
                </div>
              }
            </div>
          }

        </div>
      </div>
    );
  }
}
const mapState = (state) => ({
  loading: state.intl.loading,
  mapMarkerPoints: state.mapData.data,
  heatMapData: state.mapData.heatMapData,
  mapLoading: state.loader.GetMapData,
});
const mapDispatch = {
  getMapViewData,
  getHeatMapData
};
export default injectIntl(withStyles(s, bt)(connect(mapState, mapDispatch)(TrackingManagement)));