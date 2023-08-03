import * as React from 'react';
import Message, { MessageProps } from './components/Message';
import AppField from './components/AppField';
import AppButton from './components/AppButton';
import SelectYears from './components/SelectYears';
import AppCheckBox from './components/AppCheckBox';

interface FormState {
    multiplier?: string;
    divider?: string;
    values: Array<Array<string>>;
    checked: boolean;
    selectedYears: number[];
    message?: MessageProps;
}

const nowYear = new Date().getFullYear();
const years = [nowYear - 2, nowYear - 1, nowYear, nowYear + 1, nowYear + 2];

const initialState: FormState = {
    multiplier: '',
    divider: '',
    values: [],
    checked: false,
    selectedYears: [nowYear],
};

for (let i = 0; i < years.length; ++i) {
    initialState.values[i] = new Array(12).fill('');
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

async function postForm(formData: URLSearchParams, apiPath: string) {
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

function addValueToFormData(
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

function start(state: FormState) {
    const formData: URLSearchParams = new URLSearchParams();;

    if (!addValueToFormData('multiplier', state.multiplier, formData)) {
        throw new Error('Wrong multiplier');
    }

    if (!addValueToFormData('divider', state.divider, formData)) {
        throw new Error('Wrong divider');
    }

    state.selectedYears.forEach((y, i) => {
        formData.append('year' + (i + 1), String(y));

        const iy = years.indexOf(y);

        state.values[iy].forEach((r, m) => {
            if (!addValueToFormData('values' + (i + 1), r, formData)) {
                throw new Error(`Wrong value for year ${y} month ${m + 1}`);
            }
        });
    });

    return postForm(formData, 'api/start');
}

interface ValueData {
    yearIndex: number;
    monthIndex: number;
    value: string;
};

interface FormAction {
    type: string;
    payload?: boolean | string | number[] | ValueData | MessageProps;
}

function reducer(state: FormState, action: FormAction): FormState {
    switch (action.type) {
        case 'set_mul': {
            const sr = action.payload as string;
            const mul = Number(sr.replace(',', '.'));

            if (isFinite(mul) && mul >= 0 && mul <= 1000) {
                return { ...state, multiplier: sr };
            }

            return state;
        }

        case 'set_div': {
            const sr = action.payload as string;
            const div = Number(sr.replace(',', '.'));

            if (isFinite(div) && div >= 0 && div <= 1000) {
                return { ...state, divider: sr };
            }

            return state;
        }

        case 'set_value': {
            const payload = action.payload as ValueData;
            const v = Number(payload.value.replace(',', '.'));

            if (isFinite(v) && v >= 0 && v <= 1000) {
                const values = [...state.values];
                values[payload.yearIndex][payload.monthIndex] = payload.value;
                return { ...state, values };
            }

            return state;
        }

        case 'changed_enable':
            return { ...state, checked: action.payload as boolean };

        case 'set_message':
            return { ...state, message: action.payload as MessageProps };

        case 'select_years':
            return { ...state, selectedYears: action.payload as number[] };
    }

    throw Error('Unknown action: ' + action.type);
}

export default () => {

    const [formState, dispatch] = React.useReducer(reducer, initialState);

    const onStart = React.useCallback(async () => {
        dispatch({ type: 'set_message', payload: { type: 'info', text: 'Calculating...', title: 'Message' } });

        const title = 'Calculation result';

        try {
            const r = await start(formState);
            dispatch({
                type: 'set_message',
                payload: { type: 'info', text: r, title }
            });
        }
        catch (e: any) {
            const text = e instanceof Error ? e.message : e.toString();

            dispatch({
                type: 'set_message',
                payload: { type: 'error', text, title }
            });
        }
    }, [formState, dispatch]);

    const onMessageKeyDown = React.useCallback((event: React.KeyboardEvent) => {
        switch (event.key) {
            case 'Enter':
            case 'Escape':
                dispatch({ type: 'set_message' });
                event.stopPropagation();
                break;
        }
    }, [dispatch]);

    const onMessageClick = React.useCallback(() => dispatch({ type: 'set_message' }), [dispatch]);

    const onCheck = React.useCallback((c: boolean) => dispatch({ type: 'changed_enable', payload: c }), [dispatch]);

    const onChangeM = React.useCallback((v: string) => dispatch({ type: 'set_mul', payload: v }), [dispatch]);

    const onChangeD = React.useCallback((v: string) => dispatch({ type: 'set_div', payload: v }), [dispatch]);

    const setSelectedYears = React.useCallback((years: number[]) => dispatch({ type: 'select_years', payload: years }), [dispatch]);

    return <div>
        <div className='header'>
            <div>Calculation Form</div>
            <div style={{ width: 300 }}>
                <SelectYears id='years' selected={formState.selectedYears} years={years} onChanged={setSelectedYears} />
            </div>
        </div>
        <div className='section'>
            <h2 className='head2'>Global factors</h2>
            <div className='items-row'>
                <div className='items-column2'>
                    <AppField
                        id='multiplier'
                        placeholder='Multiplier'
                        title='Multiplier'
                        value={formState.multiplier}
                        onChange={onChangeM}
                    />
                </div>
                <div className='items-column2'>
                    <AppField
                        id='divider'
                        placeholder='Divider'
                        title='Divider'
                        value={formState.divider}
                        onChange={onChangeD}
                    />
                </div>
            </div>
            {!!formState.selectedYears.length && <h2 className='head2'>Month values</h2>}
            {formState.selectedYears.map((y) => {
                const yearIndex = years.indexOf(y);
                return (
                    yearIndex >= 0 && (
                        <div key={y} className='items-row'>
                            {months.map((m, monthIndex) => (
                                <AppField
                                    id={'value-' + m}
                                    key={m}
                                    placeholder={m + '.' + (y % 100)}
                                    title={m + '.' + (y % 100)}
                                    value={formState.values[yearIndex][monthIndex]}
                                    onChange={(value: string) => dispatch({ type: 'set_value', payload: { yearIndex, monthIndex, value } })}
                                />
                            ))}
                        </div>
                    )
                );
            })}
        </div>
        <div className='footer' >
            <AppCheckBox id='enable-calc' checked={formState.checked} onChange={onCheck}>Enable calculation</AppCheckBox>
            {!!formState.message && <Message {...formState.message} onKeyDown={onMessageKeyDown} onClick={onMessageClick} />}
            <AppButton
                isDisabled={!formState.multiplier || !formState.divider || !formState.checked}
                onClick={onStart}
            >Start calculation</AppButton>
        </div>
    </div>;
};
