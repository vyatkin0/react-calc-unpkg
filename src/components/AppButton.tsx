import * as React from 'react';

interface RatioButtonProps {
    isDisabled: boolean;
    onClick: () => void;
}

const RatioButton = (props: React.PropsWithChildren<RatioButtonProps>) => <button className='app-button' disabled={props.isDisabled} onClick={props.onClick}>{props.children}</button>;
export default RatioButton;