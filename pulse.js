import React, {
    Component
} from 'react';
import PropTypes from 'prop-types';
import {
    View,
    Text,
    Image,
    StyleSheet,
    AppState
} from 'react-native';

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center'
    },
    pulse: {
        position: 'absolute',
        flex: 1
    }
});

export default class Pulse extends Component {
    static propTypes = {
        color: PropTypes.string,
        diameter: PropTypes.number,
        duration: PropTypes.number,
        image: PropTypes.object,
        initialDiameter: PropTypes.number,
        numPulses: PropTypes.number,
        pulseStyle: PropTypes.object,
        speed: PropTypes.number,
        style: PropTypes.object,
        kernelContent: PropTypes.element
    };

    static defaultProps = {
        color: 'blue',
        diameter: 400,
        duration: 1000,
        image: null,
        initialDiameter: 0,
        numPulses: 3,
        pulseStyle: {},
        speed: 10,
        style: {
            top: 0,
            bottom: 0,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
        },
        kernelContent: null
    }

    pulseTimer = 0
    createPulseTimer = 0
    constructor(props) {
        super(props);
        this.state = {
            color: this.props.color,
            duration: this.props.duration,
            image: this.props.image,
            maxDiameter: this.props.diameter,
            numPulses: this.props.numPulses,
            pulses: [],
            pulseStyle: this.props.pulseStyle,
            speed: this.props.speed,
            started: false,
            style: this.props.style,
            kernelContent: this.props.kernelContent,
            appState: AppState.currentState,
        };
    }

    componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange);
        this.start()
        this.didBlurSubscription = this.props.navigation.addListener(
            'didBlur',
            payload => {
                this.stop()
            }
        );
        this.didFocusSubscription = this.props.navigation.addListener(
            'didFocus',
            payload => {
                this.start()
            }
        );
    }

    componentWillUnmount() {
        this.stop()
        AppState.removeEventListener('change', this._handleAppStateChange);
        this.didBlurSubscription.remove()
        this.didFocusSubscription.remove()
    }

    start = () => {
        if (this.started) return
        this.started = true;
        const { numPulses, duration, speed } = this.state;

        this.setState({ started: true });

        let a = 0;
        if (this.state.pulses.length < 1) {
            while (a < numPulses) {
                this.createPulseTimer = setTimeout(() => {
                    this.createPulse(a);
                }, a * duration);
    
                a++;
            }
        }

        this.pulseTimer = setInterval(() => {
            this.updatePulse();
        }, speed);
    }

    stop = () => {
        if (!this.started) return
        this.started = false;
        clearInterval(this.pulseTimer);
        this.pulseTimer = undefined
        clearTimeout(this.createPulseTimer);
        this.createPulseTimer = undefined
    }

    _handleAppStateChange = (nextAppState) => {
        if (
            this.state.appState.match(/inactive|background/) &&
            nextAppState === 'active'
        ) {
            this.start()
        } else {
            this.stop()
        }
        this.setState({ appState: nextAppState });
    };

    createPulse = (pKey) => {
        if (this.started) {
            let pulses = this.state.pulses;

            let pulse = {
                pulseKey: pulses.length + 1,
                diameter: this.props.initialDiameter,
                opacity: .5,
                centerOffset: (this.state.maxDiameter - this.props.initialDiameter) / 2
            };

            pulses.push(pulse);

            this.setState({ pulses });
        }
    }

    updatePulse = () => {
        if (this.started) {
            const pulses = this.state.pulses.map((p, i) => {
                let maxDiameter = this.state.maxDiameter;
                let newDiameter = (p.diameter > maxDiameter ? 0 : p.diameter + 2);
                let centerOffset = (maxDiameter - newDiameter) / 2;
                let opacity = Math.abs((newDiameter / this.state.maxDiameter) - 1);

                let pulse = {
                    pulseKey: i + 1,
                    diameter: newDiameter,
                    opacity: (opacity > .5 ? .5 : opacity),
                    centerOffset: centerOffset
                };

                return pulse;

            });

            this.setState({ pulses });
        }
    }

    render() {
        const { color, image, maxDiameter, pulses, pulseStyle, started, style, kernelContent } = this.state;
        const containerStyle = [style];
        const pulseWrapperStyle = { width: maxDiameter, height: maxDiameter, justifyContent: 'center', alignItems: 'center' };

        return (
            <View style={containerStyle}>
                {started &&
                    <View style={pulseWrapperStyle}>
                        {pulses.map((pulse) =>
                            <View
                                key={pulse.pulseKey}
                                style={[
                                    styles.pulse,
                                    {
                                        backgroundColor: color,
                                        width: pulse.diameter,
                                        height: pulse.diameter,
                                        opacity: pulse.opacity,
                                        borderRadius: pulse.diameter / 2,
                                        top: pulse.centerOffset,
                                        left: pulse.centerOffset
                                    },
                                    pulseStyle
                                ]}
                            />
                        )}
                        {kernelContent}
                    </View>
                }
            </View>
        )
    }
}
