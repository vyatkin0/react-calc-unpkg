import * as React from 'react';

interface CheckBoxProps {
    id?: string;
    checked?: boolean;
    onChange?: (v: boolean) => void;
}

const CheckBox = (props: React.PropsWithChildren<CheckBoxProps>) => <div className='app-check-box'>
    <input type="checkbox" id={props.id} name={props.id} checked={props.checked} onChange={(e) => props.onChange?.(!props.checked)} />
    {props.children && <label htmlFor={props.id}>{props.children}</label>}
</div>;

export default CheckBox;