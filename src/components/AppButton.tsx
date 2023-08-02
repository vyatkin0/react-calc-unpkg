import * as React from 'react';

interface AppButtonProps {
    isDisabled: boolean;
    onClick: () => void;
}

const AppButton = (props: React.PropsWithChildren<AppButtonProps>) => <button className='app-button' disabled={props.isDisabled} onClick={props.onClick}>{props.children}</button>;
export default AppButton;