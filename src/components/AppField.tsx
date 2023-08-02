import * as React from 'react';
import CancelIcon from './CancelIcon';

interface RatioFieldProps {
    id?: string;
    value?: string;
    placeholder?: string;
    title?: string;
    onChange?: (v: string) => void;
}

const RatioField = (props: RatioFieldProps) => {
    function handleClear(e: React.MouseEvent) {
        props.onChange?.('');
    }

    function onClick(e: React.MouseEvent) {
        if (e.currentTarget == e.target) {
            (e.currentTarget.firstChild as HTMLInputElement)?.focus();
        }
    }

    const spanStyle: React.CSSProperties = {
        visibility: props.value ? 'visible' : 'hidden',
    };

    return <div className='app-field' onClick={onClick}>
        {props.value && <label htmlFor={props.id} className='label'>{props.title}</label>}
        <input
            id={props.id}
            name={props.id}
            type='text'
            onChange={(e) => props.onChange?.(e.target.value)}
            value={props.value}
            placeholder={props.placeholder}
        />
        <span style={spanStyle} className='actions' onClick={props.value ? handleClear : undefined}>
            {CancelIcon}
        </span>
    </div>;
}
export default RatioField;