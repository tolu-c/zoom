import React from 'react';
import { injectIntl } from 'react-intl';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './HomeSlider.css';
import cx from 'classnames';
import Swiper from 'react-id-swiper';
import HomeItem from '../HomeItem';
import Loader from '../../Common/Loader';

import { isRTL } from '../../../helpers/formatLocale';

class HomeSlider extends React.Component {
  static defaultProps = {
    data: [],
  };

  constructor(props) {
    super(props);
    this.state = {
      load: false
    };
  }

  componentDidMount() {
    this.setState({
      load: true
    });
  }

  UNSAFE_componentWillReceiveProps(prevProps) {
    const { locale } = this.props.intl;
    const { locale: prevLocale } = prevProps.intl;

    if (locale !== prevLocale) {
      this.setState({
        load: false
      });
      clearTimeout(this.loadSync);
      this.loadSync = null;
      this.loadSync = setTimeout(() => {
        this.setState({
          load: true
        })
      }, 1);
    }
  }

  render() {
    const { data, intl: { locale } } = this.props;
    const { load } = this.state;
    const params = {
      slidesPerView: 5,
      breakpoints: {
        768: {
          slidesPerView: 'auto',
        },
        640: {
          slidesPerView: 'auto',
        }
      },
    };

    let specificParams = {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    };

    if (data && data.result) {
      if (data.result.length > 4) {
        params['navigation'] = specificParams;
      } else if (typeof window !== 'undefined') {
        if ((window.matchMedia('(max-width: 768px) and (min-width: 640px)').matches && data.result.length > 3)
          || (window.matchMedia('(max-width: 640px)').matches && data.result.length > 1)) {
            params['navigation'] = specificParams;
        }
      }
    }

    return (
      <div className={s.root}>
        <div className={cx(s.paddingTopBottom, 'homeSlickSlider', s.sliderMain)}>

          {
            !load && <div>
              <Loader type="text" />
            </div>
          }
          {
            load && <Swiper {...params} rtl={isRTL(locale)} className={cx('row', s.noMargin)} >
              {data &&
                data.result &&
                data.result.length > 0 &&
                data.result.map((item, index) => {
                  return (
                    <div key={index}>
                      <div className='swiperSliderMobielWidth'>
                        <HomeItem
                          key={index}
                          categoryName={item.categoryName}
                          categoryImage={item.categoryImage}
                        />
                      </div>
                    </div>
                  );
                })}
            </Swiper>}
        </div>
      </div>
    );
  }
}

export default injectIntl(withStyles(s)(HomeSlider))

