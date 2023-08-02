import * as React from 'react';
import Message, { MessageProps } from './components/Message';
import RatioField from './components/AppField';
import RatioButton from './components/AppButton';
import SelectYears from './components/SelectYears';
import CheckBox from './components/AppCheckBox';

const nowYear = new Date().getFullYear();

const years = [nowYear - 2, nowYear - 1, nowYear, nowYear + 1, nowYear + 2];
interface ProcDataState {
    multiplier?: string;
    divider?: string;
    values: Array<Array<string>>;
    checked: boolean;
}

const months = [
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
];

const fetchRequest: RequestInit = {
    mode: 'same-origin', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
};

export async function postForm(formData: URLSearchParams, apiPath: string) {
    const request: RequestInit = {
        ...fetchRequest,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        body: formData.toString(), // body data type must match 'Content-Type' header
    };

    const response = await fetch(apiPath, request);

    if (response.ok) {
        return response.text();
    } else {
        let text = await response.text();
        if (!text) {
            text = response.statusText;
        }
        throw new Error(text);
    }
}

function addRatioToFormData(
    name: string,
    sr: string | undefined | null,
    fd: URLSearchParams
) {
    if (sr === null || sr === undefined) {
        fd.append(name, '');
        return true;
    }

    const k = Number(sr.replace(',', '.'));

    if (isFinite(k)) {
        fd.append(name, String(k));
        return true;
    }

    return false;
}

function start(state: ProcDataState, selectedYears: number[]) {
    const formData: URLSearchParams = new URLSearchParams();;

    if (!addRatioToFormData('multiplier', state.multiplier, formData)) {
        throw new Error('Wrong multiplier');
    }

    if (!addRatioToFormData('divider', state.divider, formData)) {
        throw new Error('Wrong divider');
    }

    selectedYears.forEach((y, i) => {
        formData.append('year' + (i + 1), String(y));

        const iy = years.indexOf(y);

        state.values[iy].forEach((r, m) => {
            if (!addRatioToFormData('values' + (i + 1), r, formData)) {
                throw new Error(`Wrong value for year ${y} month ${m + 1}`);
            }
        });
    });

    return postForm(formData, '/calc/api/start');
}

export default () => {
    const initialState: ProcDataState = {
        multiplier: '',
        divider: '',
        values: [],
        checked: false,
    };

    for (let i = 0; i < years.length; ++i) {
        initialState.values[i] = new Array(12).fill('');
    }

    const [state, setState] = React.useState(initialState);
    const [selectedYears, setSelectedYears] = React.useState<number[]>([nowYear]);

    const initMessage: MessageProps = { type: 'none', text: '', title: '' };

    const [message, setMessage] = React.useState(initMessage);

    const onCheck = React.useCallback((c: boolean) => {
        state.checked = c;
        setState({ ...state });
    }, [state, setState]);

    const onChangeM = React.useCallback((sr: string) => {
        const mul = Number(sr.replace(',', '.'));

        if (isFinite(mul) && mul >= 0 && mul <= 1000) {
            state.multiplier = sr;
        }

        setState({ ...state });
    }, [state, setState]);

    const onChangeD = React.useCallback((sr: string) => {
        const div = Number(sr.replace(',', '.'));

        if (isFinite(div) && div >= 0 && div <= 1000) {
            state.divider = sr;
        }

        setState({ ...state });
    }, [state, setState]);

    function onChangeValue(
        k: Array<Array<string | null>>,
        iy: number,
        month: number,
        sv: string
    ) {
        const r = Number(sv.replace(',', '.'));

        if (isFinite(r) && r >= 0 && r <= 1000) {
            k[iy][month] = sv;
        }

        setState({ ...state });
    }

    async function onStart() {
        setMessage({
            type: 'info',
            text: 'Calculating...',
            title: 'Message',
        });

        const title = 'Calculation result';

        try {
            const r = await start(state, selectedYears);
            setMessage({ type: 'info', text: r, title });
        }
        catch (e: any) {
            const text = e instanceof Error ? e.message : e.toString();

            setMessage({ type: 'error', text, title });
        }
    }

    function onMessageKeyDown(event: React.KeyboardEvent) {
        switch (event.key) {
            case 'Enter':
            case 'Escape':
                setMessage(initMessage);
                event.stopPropagation();
                break;
        }
    }

    function onMessageClick(event: React.MouseEvent) {
        setMessage(initMessage);
    }

    return (
        <div>
            <div className='header'>
                <div>Calculation Form</div>
                <div style={{ width: 300 }}>
                    <SelectYears id='years' selected={selectedYears} years={years} onChanged={setSelectedYears} />
                </div>
            </div>
            <div className='section'>
                <h2 className='head2'>Global factors</h2>
                <div className='items-row'>
                    <div className='items-column2'>
                        <RatioField
                            id='multiplier'
                            placeholder='Multiplier'
                            title='Multiplier'
                            value={state.multiplier}
                            onChange={onChangeM}
                        />
                    </div>
                    <div className='items-column2'>
                        <RatioField
                            id='divider'
                            placeholder='Divider'
                            title='Divider'
                            value={state.divider}
                            onChange={onChangeD}
                        />
                    </div>
                </div>
                {!!selectedYears.length && <h2 className='head2'>Month values</h2>}
                {selectedYears.map((y) => {
                    const iy = years.indexOf(y);
                    return (
                        iy >= 0 && (
                            <div key={y} className='items-row'>
                                {months.map((m, im) => (
                                    <RatioField
                                        id={'value-' + m}
                                        key={m}
                                        placeholder={m + '.' + (y % 100)}
                                        title={m + '.' + (y % 100)}
                                        value={state.values[iy][im]}
                                        onChange={(v: string) => onChangeValue(state.values, iy, im, v)}
                                    />
                                ))}
                            </div>
                        )
                    );
                })}
            </div>
            <div className='footer' >
                <CheckBox id='enable-calc' checked={state.checked} onChange={onCheck}>Enable calculation</CheckBox>
                {message.type !== 'none' && <Message {...message} onKeyDown={onMessageKeyDown} onClick={onMessageClick} />}
                <RatioButton
                    isDisabled={!state.multiplier || !state.divider || !state.checked}
                    onClick={onStart}
                >Start calculation</RatioButton>
            </div>
        </div>
    );
};
