import React from 'react';
import { connect } from 'react-redux';
import { change } from 'redux-form';
import Switch from 'react-switch';

//image
import leftArrow from '../../../../public/Icons/leftArrowBtn.png';
import rightArrow from '../../../../public/Icons/rightArrowBtn.png';

export const uncheckedIcon = (
    <img src={rightArrow} className='toggleRightArrow' />
);

export const checkedIcon = (
    <img src={leftArrow} className='toggleLeftArrow' />
);

class SwitchButton extends React.Component {

    static defaultProps = {
        checked: false,
        checkedValue: true,
        unCheckedValue: false,
        offColor: '#dce0e0',
        onColor: '#5EBE00',
        checkedIcon: checkedIcon,
        uncheckedIcon: uncheckedIcon,
        height: 34,
        width: 58,
        boxShadow: 'none',
        activeBoxShadow: '0px 0px 2px 3px #5EBE00',
        isPersonalize: false
    };

    render() {
        const { switchOnLabel, switchOffLabel, checked, onChange, disabled } = this.props;
        const { offColor, onColor, checkedIcon, uncheckedIcon, height, width, boxShadow } = this.props;

        return (
            <div>
                {
                    String(checked) && (
                        <div>
                            {
                                switchOnLabel && switchOffLabel && (
                                    <label>
                                        {checked ? switchOnLabel : switchOffLabel}
                                    </label>
                                )
                            }
                            <Switch
                                id="open-type"
                                checked={checked}
                                onChange={onChange}
                                offColor={offColor}
                                onColor={onColor}
                                handleDiameter={30}
                                checkedIcon={checkedIcon}
                                uncheckedIcon={uncheckedIcon}
                                height={height}
                                width={width}
                                boxShadow={boxShadow}
                                disabled={disabled}
                            />
                        </div>
                    )
                }
            </div>
        );
    }
}

const mapState = (state) => ({});

const mapDispatch = {
    change
};

export default connect(mapState, mapDispatch)(SwitchButton);