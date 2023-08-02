import * as React from 'react';
import CancelIcon from './CancelIcon';

const title = 'Select years';

interface selectYearsProps {
    id?: string;
    selected: number[];
    years: number[];
    onChanged: (years: number[]) => void;
}

const selectYears = (props: selectYearsProps) => {
    const [isOpened, setOpened] = React.useState(false);

    const mainDivRef = React.useRef<HTMLDivElement>(null);

    const handleSelect = (year: number) => {
        const newSelected = props.selected.filter((y) => y !== year);

        if (newSelected.length === props.selected.length) {
            if (props.selected.length > 2) {
                newSelected.shift();
            }

            newSelected.push(year);
        }

        newSelected.sort();

        props.onChanged(newSelected);
    };

    const dropdownId = props.id + '-list';

    const dropdownList = React.useMemo(() =>
        <div className='dropdown' id={dropdownId} role='listbox' aria-label='Years'>
            {props.years.map((y) => {
                const selected = props.selected.includes(y);
                const className = selected ? 'checkbox selected' : 'checkbox';
                return <button key={y} role='option' aria-selected={selected}
                    className='item' onClick={() => handleSelect(y)}
                >
                    {y}
                    <span className={className}></span>
                </button>
            })}
        </div>, [props.years, props.selected, handleSelect]);

    function handleClear() {
        document.removeEventListener('click', handleOutsideClick, true);

        const newSelected: number[] = [];
        setOpened(false);
        props.onChanged(newSelected);
    }

    function handleUp() {
        document.removeEventListener('click', handleOutsideClick, true);
        setOpened(false);
    }

    function handleOutsideClick(evt: Event) {
        if (
            mainDivRef.current &&
            mainDivRef.current.contains(evt.target as Node)
        ) {
            return;
        }

        handleUp();
    }

    function handleDown() {
        setOpened(true);
        document.addEventListener('click', handleOutsideClick, true);
    }

    function onKeyDown(event: React.KeyboardEvent) {
        switch (event.key) {
            case 'Enter':
                handleDown();
                event.stopPropagation();
                break;
            case 'Escape':
                handleUp();
                event.stopPropagation();
                break;
        }
    }

    const mainClass = isOpened ? 'select-years select-years--focused' : 'select-years';
    const openerPath = isOpened ? 'M10 13L5 7L0 13H10Z' : 'M10 7L5 13L0 7H10Z';
    const openerClick = isOpened ? handleUp : handleDown;

    const actionsWidth = props.selected.length > 0 ? 35 : 10;

    const labelId = props.id + '-years-label';

    return <div ref={mainDivRef}
        className={mainClass}
        id={props.id}
        tabIndex={0}
        onKeyDown={onKeyDown}
        role='combobox'
        aria-labelledby={labelId}
        aria-controls={dropdownId}
        aria-expanded={isOpened}>
        {props.selected.length > 0
            ? <>
                <label className='label' id={labelId}>{title}</label>
                <span>{props.selected.join()}</span>
            </>
            : <span className='title' id={labelId}>{title}</span>}
        <span className='actions' style={{ width: actionsWidth }}>
            {props.selected.length > 0 && <span onClick={handleClear}>
                {CancelIcon}
            </span>}
            <span onClick={openerClick} aria-haspopup='listbox' aria-controls={isOpened ? dropdownId : undefined}>
                <svg width='10' height='20' xmlns='http://www.w3.org/2000/svg'><path d={openerPath} fill='currentColor'></path></svg>
            </span>
        </span>
        {isOpened && dropdownList}
    </div>;
};

export default selectYears;
