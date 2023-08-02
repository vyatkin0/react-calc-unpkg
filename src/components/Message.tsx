import * as React from 'react';

type MessageType = 'none' | 'info' | 'error';

export interface MessageProps {
    type: MessageType;
    text: string;
    title: string;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    onClick?: (e: React.MouseEvent) => void;
}

const Message = (props: MessageProps) => <div className={'message ' + props.type} tabIndex={0} onClick={props.onClick} onKeyDown={props.onKeyDown}>
    <span className='title'>{props.title}</span>
    {props.text}
</div>;

export default Message;
