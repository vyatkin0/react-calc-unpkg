import * as React from 'react';

interface AppCheckBoxProps {
    id?: string;
    checked?: boolean;
    onChange?: (v: boolean) => void;
}

const AppCheckBox = (props: React.PropsWithChildren<AppCheckBoxProps>) => <div className='app-check-box'>
    <input type="checkbox" id={props.id} name={props.id} checked={props.checked} onChange={() => props.onChange?.(!props.checked)} />
    {props.children && <label htmlFor={props.id}>{props.children}</label>}
</div>;

export default AppCheckBox;