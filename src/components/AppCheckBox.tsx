import * as React from 'react';

interface CheckBoxProps {
    id?: string;
    checked?: boolean;
    onChange?: (v: boolean) => void;
}

const CheckBox = (props: React.PropsWithChildren<CheckBoxProps>) => {

    const [checked, setChecked] = React.useState(!!props.checked);

    return <div className='app-check-box'>
        <input type="checkbox" id={props.id} name={props.id} checked={checked} onChange={(e) => { setChecked(!checked); props.onChange?.(!checked); }} />
        {props.children && <label htmlFor={props.id}>{props.children}</label>}
    </div>;
}

export default CheckBox;