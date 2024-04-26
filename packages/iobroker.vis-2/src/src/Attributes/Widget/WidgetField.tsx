import React, {
    useEffect, useRef, useState,
} from 'react';

import {
    Autocomplete, Box, Button, Checkbox, Fade, IconButton, Input, ListItemText,
    ListSubheader, MenuItem, Paper, Popper, Select, Slider, TextField, FormControl,
    FormHelperText, ListItemIcon, DialogActions,
    Dialog, DialogTitle, DialogContent, DialogContentText,
} from '@mui/material';

import {
    InsertDriveFile as FileIcon,
    Clear as ClearIcon,
    Edit as EditIcon,
    Check,
    Close,
} from '@mui/icons-material';
import { FaFolderOpen as FolderOpenedIcon } from 'react-icons/fa';

import {
    I18n,
    IconPicker,
    Utils,
    Icon,
    TextWithIcon,
    ColorPicker,
    SelectID,
    SelectFile as SelectFileDialog, Connection,
} from '@iobroker/adapter-react-v5';

import { findWidgetUsages } from '@/Vis/visUtils';
import { store, recalculateFields, selectWidget } from '@/Store';
import { deepClone } from '@/Utils/utils';
import {
    AnyWidgetId, Project,
    Widget,
    WidgetData,
    WidgetStyle,
    ClassesValue,
} from '@iobroker/types-vis-2';
import {
    ObjectBrowserCustomFilter,
    ObjectBrowserType,
} from '@iobroker/adapter-react-v5/Components/types';

import TextDialog from './TextDialog';
import MaterialIconSelector from '../../Components/MaterialIconSelector';

const POSSIBLE_UNITS = ['px', '%', 'em', 'rem', 'vh', 'vw', 'vmin', 'vmax', 'ex', 'ch', 'cm', 'mm', 'in', 'pt', 'pc'];

function collectClasses(): Record<string, ClassesValue> {
    const result: Record<string, ClassesValue> = {};
    const sSheetList = document.styleSheets;
    for (let sSheet = 0; sSheet < sSheetList.length; sSheet++) {
        if (!document.styleSheets[sSheet]) {
            continue;
        }
        try {
            const ruleList = document.styleSheets[sSheet].cssRules;
            if (ruleList) {
                for (let rule = 0; rule < ruleList.length; rule++) {
                    // @ts-expect-error selectorText does exist
                    if (!ruleList[rule].selectorText) {
                        continue;
                    }
                    // @ts-expect-error selectorText does exist
                    const _styles = ruleList[rule].selectorText.split(',');
                    for (let s = 0; s < _styles.length; s++) {
                        const subStyles = _styles[s].trim().split(' ');
                        const _style = subStyles[subStyles.length - 1].replace('::before', '').replace('::after', '').replace(':before', '').replace(':after', '');

                        if (!_style || _style[0] !== '.' || _style.includes(':')) {
                            continue;
                        }

                        let name = _style;
                        name = name.replace(',', '');
                        name = name.replace(/^\./, '');

                        const val  = name;
                        name = name.replace(/^hq-background-/, '');
                        name = name.replace(/^hq-/, '');
                        name = name.replace(/^ui-/, '');
                        name = name.replace(/[-_]/g, ' ');

                        if (name.length > 0) {
                            name = name[0].toUpperCase() + name.substring(1);
                            let fff = document.styleSheets[sSheet].href;

                            if (fff && fff.includes('/')) {
                                fff = fff.substring(fff.lastIndexOf('/') + 1);
                            }

                            if (!result[val]) {
                                if (subStyles.length > 1) {
                                    result[val] = {
                                        // @ts-expect-error style does exist
                                        name, file: fff, attrs: ruleList[rule].style, parentClass: subStyles[0].replace('.', ''),
                                    };
                                } else {
                                    // @ts-expect-error style does exist
                                    result[val] = { name, file: fff, attrs: ruleList[rule].style };
                                }
                            }
                        }
                    }
                }
            }
        } catch (e) {
            if (e.toString().includes('Cannot access rules')) {
                // ignore
                console.warn(`[${sSheet}] Cannot access rules`);
            } else {
                console.error(`[${sSheet}] Error by rules collection: ${e}`);
            }
        }
    }

    return result;
}

function getStylesOptions(options: {
    filterFile:  string;
    filterName:  string;
    filterAttrs: string;
    removeName:  string;
    styles?:      Record<string, ClassesValue>;
}) {
    // Fill the list with styles
    const _internalList = window.collectClassesValue;

    options.filterName  = options.filterName  || '';
    options.filterAttrs = options.filterAttrs || '';
    options.filterFile  = options.filterFile  || '';

    let styles: Record<string, ClassesValue> = {};

    if (options.styles) {
        styles = { ...options.styles };
    } else if (options.filterFile || options.filterName) {
        // IF filter defined
        const filters = options.filterName  ? options.filterName.split(' ')  : null;
        const attrs   = options.filterAttrs ? options.filterAttrs.split(' ') : null;
        const files   = options.filterFile  ? options.filterFile.split(' ')  : [''];

        Object.keys(_internalList).forEach((style: string) =>
            files.forEach(file => {
                if (!options.filterFile ||
                        (_internalList[style].file && _internalList[style].file.includes(file))
                ) {
                    let isFound = !filters;

                    isFound = isFound || (!!filters.find(filter => style.includes(filter)));

                    if (isFound) {
                        isFound = !attrs;
                        if (!isFound) {
                            isFound = !!attrs.find((attr: string) => {
                                const t: string | number = (_internalList[style].attrs as Record<string, string | number>)[attr] as string | number;
                                return t || t === 0;
                            });
                        }
                    }

                    if (isFound) {
                        let n = _internalList[style].name;
                        if (options.removeName) {
                            n = n.replace(options.removeName, '');
                            n = n[0].toUpperCase() + n.substring(1).toLowerCase();
                        }
                        styles[style] = {
                            name:        n,
                            file:        _internalList[style].file,
                            parentClass: _internalList[style].parentClass,
                        };
                    }
                }
            }));
    } else {
        styles = { ...styles, ..._internalList };
    }

    return styles;
}

const getViewOptions = (
    project: Project,
    options: {
        view?: string;
        type: 'folder' | 'view';
        level: number;
        folder?: { id: string; name: string; parentId: string };
        label?: string;
    }[] = [],
    parentId: string = null,
    level = 0,
) => {
    project.___settings.folders
        .filter(folder => (folder.parentId || null) === parentId)
        .forEach(folder => {
            options.push({
                type: 'folder',
                folder,
                level: level + 1,
            });

            getViewOptions(project, options, folder.id, level + 1);
        });

    const keys = Object.keys(project)
        .filter(view => (project[view].parentId || null) === parentId && !view.startsWith('__'));

    keys.forEach(view => {
        options.push({
            type: 'view',
            view,
            label: project[view].settings?.navigationTitle ? `${project[view].settings.navigationTitle} (${view})` : view,
            level: level + 1,
        });
    });

    return options;
};

// Optimize translation
const wordsCache: Record<string, string> = {};

const t = (word: string, ...args: any[]) => {
    const hash = `${word}_${args.join(',')}`;
    if (!wordsCache[hash]) {
        wordsCache[hash] = I18n.t(word, ...args);
    }
    return wordsCache[hash];
};

function modifyWidgetUsages(
    project: Project,
    usedInView: string,
    usedWidgetId: AnyWidgetId,
    inNewWidgetId: AnyWidgetId,
    inAttr: string,
): Project {
    // find where it is used
    const newProject = deepClone(project);
    const usedIn = findWidgetUsages(newProject, usedInView, usedWidgetId);
    usedIn.forEach(usage => newProject[usage.view].widgets[usage.wid].data[usage.attr] = '');
    newProject[usedInView].widgets[inNewWidgetId].data[inAttr] = usedWidgetId;

    return newProject;
}

interface PaletteFieldOptions {
    value: string;
    label: string;
    icon?: string;
    color?: string;
}

interface PaletteField {
    name: string;
    label: string;
    type: string;
    noTranslation?: boolean;
    options?: string[] | PaletteFieldOptions[];
    default?: any;
    immediateChange?: boolean;
    onChangeFunc?: string;
    onChange: (
        field: PaletteField,
        data: WidgetData | WidgetStyle,
        cb: (newData: WidgetData | WidgetStyle) => void,
        socket: Connection,
        index?: number,
    ) => void;
    adapter?: string;
    min?: number;
    max?: number;
    step?: number;
    all?: boolean;
    tpl: string;
    filter?: ObjectBrowserCustomFilter | ObjectBrowserType | ((data: WidgetData, index: number) => Record<string, any>);
    marks?: { value: number; label?: string }[] | boolean;
    valueLabelDisplay?: 'on' | 'auto' | 'off';
    withGroups: boolean;
    withSelf: boolean;
    hideUsed: boolean;
    checkUsage: boolean;
    filterFile?:  string;
    filterName?:  string;
    filterAttrs?:  string;
    removeName?:  string;
    multiple?: boolean;
    component?: (
        field: PaletteField,
        data: WidgetData,
        onChange: (newData: WidgetData) => void,
        options : {
            context: {
                socket: Connection;
                projectName: string;
                instance: number;
                adapterName: string;
                views: Project;
            };
            selectedView: string;
            selectedWidgets: AnyWidgetId[];
            selectedWidget: AnyWidgetId;
        },
    ) => void;
    isShort?: boolean;
    noButton?: boolean;
    multiline?: boolean;
}

interface WidgetFieldProps {
    field: PaletteField;
    widget: Widget;
    adapterName: string;
    instance: number;
    projectName: string;
    isDifferent: boolean;
    error: string;
    disabled: boolean;
    index: number;
    widgetId: string;
    selectedWidgets: AnyWidgetId[];
    selectedView: string;
    isStyle: boolean;
    widgetType?: {
        set: string;
    };
    socket: Connection;
    changeProject: (project: Project) => void;
    onPxToPercent: (widgets: string[], attr: string, cb: (newValues: string[]) => void) => void;
    onPercentToPx: (widgets: string[], attr: string, cb: (newValues: string[]) => void) => void;
    classes: Record<string, string>;
    fonts: string[];
    userGroups: ioBroker.UserGroup[];
    themeType: 'light' | 'dark';
}

const WidgetField = (props: WidgetFieldProps) => {
    const [idDialog, setIdDialog] = useState(false);

    const [objectCache, setObjectCache] = useState(null);
    const [askForUsage, setAskForUsage] = useState(null);

    const {
        field,
        widget,
        adapterName,
        instance,
        projectName,
        isDifferent,
        error,
        disabled,
        index,
        widgetId,
    } = props;

    let customLegacyComponent = null;

    if (field.type?.startsWith('custom,')) {
        const options = field.type.split(',');
        options.shift();
        const funcs = options[0].split('.');
        if (funcs[0] === 'vis') {
            funcs.shift();
        }
        if (funcs[0] === 'binds') {
            funcs.shift();
        }

        window._   = window.vis._; // for old widgets, else lodash overwrites it
        window.vis.activeWidgets = [...props.selectedWidgets];
        window.vis.activeView = props.selectedView;

        if (funcs.length === 1) {
            if (typeof window.vis.binds[funcs[0]] === 'function') {
                try {
                    customLegacyComponent = window.vis.binds[funcs[0]](field.name, options);
                } catch (e) {
                    console.error(`vis.binds.${funcs.join('.')}: ${e}`);
                }
            } else {
                console.log(`No function: vis.binds.${funcs.join('.')}`);
            }
        } else if (funcs.length === 2) {
            if (window.vis.binds[funcs[0]] && typeof window.vis.binds[funcs[0]][funcs[1]] === 'function') {
                try {
                    customLegacyComponent = window.vis.binds[funcs[0]][funcs[1]](field.name, options);
                } catch (e) {
                    console.error(`vis.binds.${funcs.join('.')}: ${e}`);
                }
            } else {
                console.log(`No function: vis.binds.${funcs.join('.')}`);
            }
        } else if (funcs.length === 3) {
            if (window.vis.binds[funcs[0]] && window.vis.binds[funcs[0]][funcs[1]] && typeof window.vis.binds[funcs[0]][funcs[1]][funcs[2]] === 'function') {
                try {
                    customLegacyComponent = window.vis.binds[funcs[0]][funcs[1]][funcs[2]](field.name, options);
                } catch (e) {
                    console.error(`vis.binds.${funcs.join('.')}: ${e}`);
                }
            } else {
                console.log(`No function: vis.binds.${funcs.join('.')}`);
            }
        } else if (!funcs.length) {
            console.log('Function name is too short: vis.binds');
        } else {
            console.log(`Function name is too long: vis.binds.${funcs.join('.')}`);
        }
    }

    const [cachedValue, setCachedValue] = useState<string | number | boolean | null>('');
    const [instances, setInstances] = useState<{
        id: string;
        idShort: string;
        name: string;
        icon: string;
    }[]>([]);

    const cacheTimer = useRef<ReturnType<typeof setTimeout>>(null);
    const refCustom = useRef<HTMLDivElement>();

    let onChangeTimeout: ReturnType<typeof setTimeout>;

    const applyValue = (newValues: any) => {
        const project = deepClone(store.getState().visProject);
        props.selectedWidgets.forEach((selectedWidget, i) => {
            const value: any = Array.isArray(newValues) && field.type !== 'groups' ? newValues[i] : newValues;

            const data: WidgetData | WidgetStyle = props.isStyle
                ? project[props.selectedView].widgets[selectedWidget].style
                : project[props.selectedView].widgets[selectedWidget].data;

            (data as Record<string, any>)[field.name] = value;

            if (field.onChangeFunc && props.widgetType) {
                try {
                    window.vis.binds[props.widgetType.set][field.onChangeFunc](
                        selectedWidget,
                        props.selectedView,
                        value,
                        field.name,
                        props.isStyle,
                        props.isStyle ? (widget.style as Record<string, any>)[field.name] : widget.data[field.name],
                        index,
                    );
                } catch (e) {
                    console.error(`Cannot call onChangeFunc: ${e}`);
                }
            }
            if (field.onChange) {
                field.onChange(field, JSON.parse(JSON.stringify(data)), (newData: WidgetData) => {
                    const _project = JSON.parse(JSON.stringify(store.getState().visProject));
                    _project[props.selectedView].widgets[selectedWidget].data = newData;
                    onChangeTimeout && clearTimeout(onChangeTimeout);
                    onChangeTimeout = setTimeout(() => {
                        onChangeTimeout = null;
                        props.changeProject(_project);
                    }, 100);
                }, props.socket, index);
            }
        });

        props.changeProject(project);
    };

    const change = (changeValue: any) => {
        if (Array.isArray(changeValue) || field.immediateChange) {
            // apply immediately
            applyValue(changeValue);
        } else if (changeValue !== cachedValue) {
            setCachedValue(changeValue);
            cacheTimer.current && clearTimeout(cacheTimer.current);
            cacheTimer.current = setTimeout(() => {
                cacheTimer.current = null;
                applyValue(changeValue);
            }, 300);
        }
    };

    let propValue = props.isStyle ? (widget.style as Record<string, any>)?.[field.name] : widget.data?.[field.name];
    if (propValue === undefined) {
        propValue = null;
    }

    useEffect(() => {
        if (propValue !== undefined) {
            setCachedValue(propValue);
        }
        if (field.type === 'instance' || field.type === 'history') {
            if (field.adapter === '_dataSources' || field.type === 'history') {
                props.socket.getAdapterInstances('')
                    .then(_instances => {
                        const inst = _instances
                            .filter(obj => obj.common.getHistory)
                            .map(obj => ({
                                id: obj._id.replace('system.adapter.', ''),
                                idShort: obj._id.split('.').pop(),
                                name: obj.common.name,
                                icon: obj.common.icon,
                            }));
                        setInstances(inst);
                    });
            } else {
                props.socket.getAdapterInstances(field.adapter || '')
                    .then(_instances => {
                        const inst = _instances.map(obj => ({
                            id: obj._id.replace('system.adapter.', ''),
                            idShort: obj._id.split('.').pop(),
                            name: obj.common.name,
                            icon: obj.common.icon,
                        }));
                        setInstances(inst);
                    });
            }
        }
    }, [propValue]);

    let value: string | number | boolean | null = cachedValue;
    if (value === undefined || value === null) {
        if (field.default) {
            value = field.default;
        } else {
            value = '';
        }
    }

    if (!window.collectClassesValue) {
        window.collectClassesValue = collectClasses();
    }

    const textRef = useRef();
    const [textDialogFocused, setTextDialogFocused] = useState(false);
    const [textDialogEnabled, setTextDialogEnabled] = useState(true);

    const urlPopper = (!field.type || field.type === 'number' || field.type === 'password' || field.type === 'image') && !disabled ? <Popper
        open={textDialogFocused && textDialogEnabled && !!value && value.toString().startsWith(window.location.origin)}
        anchorEl={textRef.current}
        placement="bottom"
        transition
    >
        {({ TransitionProps }) => <Fade {...TransitionProps} timeout={350}>
            <Paper>
                <Button
                    style={{ textTransform: 'none' }}
                    onClick={() => change(`.${value.toString().slice(window.location.origin.length)}`)}
                >
                    {I18n.t('Replace to ')}
                    {`.${value.toString().slice(window.location.origin.length)}`}
                </Button>
                <IconButton size="small" onClick={() => setTextDialogEnabled(false)}>
                    <ClearIcon fontSize="small" />
                </IconButton>
            </Paper>
        </Fade>}
    </Popper> : null;

    // part for customLegacyComponent
    useEffect(() => {
        if (customLegacyComponent && refCustom.current && typeof customLegacyComponent.init === 'function') {
            // take the first child in div
            customLegacyComponent.init.call(refCustom.current.children[0] || refCustom.current, field.name, propValue);
        }
    }, []);

    if (askForUsage) {
        const usages = findWidgetUsages(store.getState().visProject, props.selectedView, askForUsage.wid);
        // show dialog with usage
        return <Dialog
            open={!0}
            onClose={() => setAskForUsage(null)}
        >
            <DialogTitle>{I18n.t('Usage of widget %s', askForUsage.wid)}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {I18n.t('This widget is already used in "%s"', usages[0].wid)}
                    <br />
                    {I18n.t('Should it be moved to new place?')}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    color="primary"
                    variant="contained"
                    onClick={() => {
                        const cb = askForUsage.cb;
                        setAskForUsage(null);
                        cb();
                    }}
                    startIcon={<Check />}
                >
                    {I18n.t('Move to new place')}
                </Button>
                <Button
                    // @ts-expect-error grey is valid color
                    color="grey"
                    variant="contained"
                    onClick={() => setAskForUsage(null)}
                    startIcon={<Close />}
                >
                    {I18n.t('Keep on old place')}
                </Button>
            </DialogActions>
        </Dialog>;
    }

    // start the rendering of different types of fields

    if (customLegacyComponent) {
        // console.log(customLegacyComponent.input);
        if (customLegacyComponent.button) {
            return <div style={{ width: '100%', display: 'flex' }}>
                {/* eslint-disable-next-line react/no-danger */}
                <div ref={refCustom} dangerouslySetInnerHTML={{ __html: customLegacyComponent.input }} />
                <Button
                    style={{
                        width: 30,
                        height: 30,
                        minWidth: 30,
                        minHeight: 30,
                        marginLeft: 5,
                    }}
                    title={customLegacyComponent.button.title}
                    onClick={e => {
                        if (typeof customLegacyComponent.button.code === 'function') {
                            customLegacyComponent.button.code(customLegacyComponent.button);
                        }
                        const $button = window.jQuery(e.target);
                        $button.data('wdata', {
                            attr: field.name,
                            widgets: props.selectedWidgets,
                            view: props.selectedView,
                        });
                        if (customLegacyComponent.button.data) {
                            $button.data('data-custom', customLegacyComponent.button.data);
                        }
                        // initialize field
                        if (window.vis.widgets[props.selectedWidgets[0]] &&
                            window.vis.widgets[props.selectedWidgets[0]].data &&
                            window.vis.widgets[props.selectedWidgets[0]].data[field.name] === undefined
                        ) {
                            window.vis.widgets[props.selectedWidgets[0]].data[field.name] = '';
                        }

                        customLegacyComponent.button.click.call(e.target);
                    }}
                >
                    ...
                </Button>
            </div>;
        }

        // eslint-disable-next-line react/no-danger
        return <div ref={refCustom} dangerouslySetInnerHTML={{ __html: customLegacyComponent.input }} />;
    }

    if (field.type === 'id' || field.type === 'hid') {
        if (value && (!objectCache || value !== objectCache._id)) {
            props.socket.getObject(value as string)
                .then(objectData =>
                    setObjectCache(objectData))
                .catch(() => setObjectCache(null));
        }
        if (objectCache && !value) {
            setObjectCache(null);
        }

        // Find filter
        let customFilter: ObjectBrowserCustomFilter | null = null;
        let filters = null;
        if (idDialog && !disabled) {
            if (field.type === 'hid') {
                customFilter = { common: { custom: '_dataSources' } };
            } else if (
                typeof field.filter === 'string' &&
                field.filter !== 'chart' &&
                field.filter !== 'channel' &&
                field.filter !== 'device'
            ) {
                // detect role
                if (
                    (field.filter as string).includes('.') ||
                    (field.filter as string).startsWith('level') ||
                    (field.filter as string).startsWith('value')
                ) {
                    filters = { role: field.filter };
                } else {
                    customFilter = { type: field.filter };
                }
            } else if (field.filter) {
                if (typeof field.filter === 'function') {
                    customFilter = field.filter(widget.data, index);
                } else {
                    customFilter = field.filter as ObjectBrowserCustomFilter;
                }
            }
        }

        return <>
            <TextField
                variant="standard"
                fullWidth
                placeholder={isDifferent ? t('different') : null}
                InputProps={{
                    classes: { input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent) },
                    endAdornment: <Button disabled={disabled} size="small" onClick={() => setIdDialog(true)}>...</Button>,
                }}
                error={!!error}
                helperText={typeof error === 'string' ? I18n.t(error) : null}
                disabled={disabled}
                value={value}
                onChange={e => change(e.target.value)}
            />
            <div style={{ fontStyle: 'italic' }}>
                {objectCache ? (typeof objectCache.common.name === 'object' ? objectCache.common.name[I18n.lang] : objectCache.common.name) : null}
            </div>
            {idDialog && !disabled ? <SelectID
                imagePrefix="../"
                selected={value as string}
                onOk={selected => change(selected)}
                onClose={() => setIdDialog(false)}
                socket={props.socket}
                types={field.filter === 'chart' || field.filter === 'channel' || field.filter === 'device' ? [field.filter] as ObjectBrowserType[] : null}
                filters={filters}
                expertMode={field.filter === 'chart' ? true : undefined}
                customFilter={customFilter}
            /> : null}
        </>;
    }

    if (field.type === 'checkbox') {
        return <FormControl
            error={!!error}
            component="fieldset"
            variant="standard"
        >
            <Checkbox
                disabled={disabled}
                checked={!!value}
                classes={{ root: Utils.clsx(props.classes.fieldContent, props.classes.clearPadding) }}
                size="small"
                onChange={e => {
                    store.dispatch(recalculateFields(true));
                    change(e.target.checked);
                }}
            />
            {typeof error === 'string' ? <FormHelperText>{I18n.t(error)}</FormHelperText> : null}
        </FormControl>;
    }

    if (field.type === 'image') {
        let _value: string;
        if (idDialog) {
            _value = value as string || '';
            if (_value.startsWith('../')) {
                _value = _value.substring(3);
            } else if (_value.startsWith('_PRJ_NAME/')) {
                _value = _value.replace('_PRJ_NAME/', `../${adapterName}.${instance}/${projectName}/`);
            }
        }

        return <>
            <TextField
                variant="standard"
                fullWidth
                placeholder={isDifferent ? t('different') : null}
                error={!!error}
                helperText={typeof error === 'string' ? I18n.t(error) : null}
                disabled={disabled}
                InputProps={{
                    classes: { input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent) },
                    endAdornment: <Button disabled={disabled} size="small" onClick={() => setIdDialog(true)}>...</Button>,
                }}
                ref={textRef}
                value={value}
                onFocus={() => setTextDialogFocused(true)}
                onBlur={() => setTextDialogFocused(false)}
                onChange={e => change(e.target.value)}
            />
            {urlPopper}
            {idDialog ? <SelectFileDialog
                title={t('Select file')}
                onClose={() => setIdDialog(false)}
                restrictToFolder={`${adapterName}.${instance}/${projectName}`}
                allowNonRestricted
                allowUpload
                allowDownload
                allowCreateFolder
                allowDelete
                allowView
                showToolbar
                imagePrefix="../"
                selected={_value}
                filterByType="images"
                onOk={_selected => {
                    let selected = Array.isArray(_selected) ? _selected[0] : _selected;
                    const projectPrefix = `${adapterName}.${instance}/${projectName}/`;
                    if (selected.startsWith(projectPrefix)) {
                        selected = `_PRJ_NAME/${selected.substring(projectPrefix.length)}`;
                    } else if (selected.startsWith('/')) {
                        selected = `..${selected}`;
                    } else if (!selected.startsWith('.')) {
                        selected = `../${selected}`;
                    }
                    change(selected);
                    setIdDialog(false);
                }}
                socket={props.socket}
            /> : null}
        </>;
    }

    if (field.type === 'dimension') {
        const m = (value || '').toString().match(/^(-?[,.0-9]+)([a-z%]*)$/);
        let customValue = !m;
        let _value: string;
        let unit: string;
        if (m) {
            _value = m[1];
            unit = m[2] || 'px';
            // eslint-disable-next-line no-restricted-properties
            if (!window.isFinite(_value as any as number) || (m[2] && !POSSIBLE_UNITS.includes(m[2]))) {
                customValue = true;
            }
        }

        /** @type string[] */
        const options: any[] = [];

        if (isDifferent && value === '') {
            for (const wid of props.selectedWidgets) {
                const selectedWidget = selectWidget(store.getState(), props.selectedView, wid);
                let val = (selectedWidget.style as Record<string, any>)[field.name];
                val = typeof val === 'number' ? val.toString() : val;

                if (val !== undefined && val !== '' && !options.includes(val)) {
                    options.push(val);
                }
            }
        }

        const strValue = typeof value === 'number' ? value.toString() : value;

        if (options.length && value !== '' && !options.includes(strValue)) {
            options.push(strValue);
        }

        return <Autocomplete
            options={options}
            freeSolo
            value={strValue}
            onChange={((e, aVal) => change(aVal))}
            renderInput={params => <TextField
                {...params}
                variant="standard"
                fullWidth
                placeholder={isDifferent ? t('different') : null}
                error={!!error}
                helperText={typeof error === 'string' ? I18n.t(error) : null}
                disabled={disabled}
                InputProps={{
                    ...params.InputProps,
                    classes: { input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent) },
                    endAdornment: !isDifferent && !customValue ? <Button
                        size="small"
                        disabled={disabled}
                        title={t('Convert %s to %s', unit, unit === '%' ? 'px' : '%')}
                        onClick={() => {
                            if (unit !== '%') {
                                props.onPxToPercent(props.selectedWidgets, field.name, newValues => change(newValues[0]));
                            } else {
                                props.onPercentToPx(props.selectedWidgets, field.name, newValues => change(newValues[0]));
                            }
                        }}
                    >
                        {unit}
                    </Button> : null,
                }}
                value={value}
                onChange={e => change(e.target.value)}
            />}
        />;
    }

    if (field.type === 'color') {
        return <ColorPicker
            disabled={disabled}
            value={value as string || ''}
            className={props.classes.fieldContentColor}
            onChange={color => change(color)}
            openAbove
        />;
    }

    if (field.type === 'eff_opt') {
        return <>
            {field.type}
            /
            {value}
        </>;
    }

    if (field.type === 'slider') {
        // make space before slider element, as if it is at minimum it overlaps with the label
        return <div style={{ display: 'flex' }}>
            <div style={{ width: 5 }}></div>
            <Slider
                disabled={disabled}
                className={props.classes.fieldContentSlider}
                size="small"
                onChange={(e, newValue) => change(newValue)}
                value={typeof value === 'number' ? value : 0}
                min={field.min}
                max={field.max}
                step={field.step}
                marks={field.marks}
                valueLabelDisplay={field.valueLabelDisplay}
            />
            <Input
                className={props.classes.fieldContentSliderInput}
                style={{ width: field.max > 100000 ? 70 : (field.max > 10000 ? 60 : 50) }}
                value={value}
                disabled={disabled}
                size="small"
                onChange={e => (e.target.value === '' ? change('') : change(parseFloat(e.target.value)))}
                classes={{ input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent) }}
                inputProps={{
                    step: field.step,
                    min: field.min,
                    max: field.max,
                    type: 'number',
                }}
            />
        </div>;
    }

    if (field.type === 'select' || field.type === 'nselect' || field.type === 'fontname' || field.type === 'effect' || field.type === 'widget') {
        let { options } = field;

        if (field.type === 'fontname') {
            options = props.fonts;
        }

        if (field.type === 'effect') {
            options = [
                '',
                'show',
                'blind',
                'bounce',
                'clip',
                'drop',
                'explode',
                'fade',
                'fold',
                'highlight',
                'puff',
                'pulsate',
                'scale',
                'shake',
                'size',
                'slide',
            ];
        }

        if (field.type === 'widget') {
            // take widgets from all views
            let wOptions: { wid: string; view: string; tpl: string; name: string }[] = [];
            if (field.all) {
                Object.keys(store.getState().visProject).forEach(view =>
                    store.getState().visProject[view].widgets && Object.keys(store.getState().visProject[view].widgets)
                        .filter((wid: AnyWidgetId) =>
                            (field.withGroups || !store.getState().visProject[view].widgets[wid].grouped) &&
                            (field.withSelf || wid !== widgetId) &&
                            (!field.hideUsed || !store.getState().visProject[view].widgets[wid].usedInView))
                        .forEach((wid: AnyWidgetId) => wOptions.push({
                            wid,
                            view,
                            tpl: store.getState().visProject[view].widgets[wid].tpl,
                            name: store.getState().visProject[view].widgets[wid].name,
                        })));
            } else {
                wOptions = Object.keys(store.getState().visProject[props.selectedView].widgets)
                    .filter((wid: AnyWidgetId) =>
                        (field.withGroups || !store.getState().visProject[props.selectedView].widgets[wid].grouped) &&
                        (field.withSelf || wid !== widgetId) &&
                        (!field.hideUsed || !store.getState().visProject[props.selectedView].widgets[wid].usedInView))
                    .map((wid: AnyWidgetId) => ({
                        wid,
                        view: props.selectedView,
                        tpl: store.getState().visProject[props.selectedView].widgets[wid].tpl,
                        name: store.getState().visProject[props.selectedView].widgets[wid].name,
                    }));
            }
            if (field.tpl) {
                if (field.tpl.includes('*')) {
                    if (field.tpl.endsWith('*')) {
                        const word = field.tpl.substring(0, field.tpl.length - 1);
                        wOptions = wOptions.filter(item => item.tpl.startsWith(word));
                    } else if (field.tpl.startsWith('*')) {
                        const word = field.tpl.substring(1);
                        wOptions = wOptions.filter(item => item.tpl.endsWith(word));
                    } else {
                        console.warn('"*" can be only at the beginning or at the end of "tpl" attribute');
                    }
                } else {
                    wOptions = wOptions.filter(item => item.tpl === field.tpl);
                }
            }
            options = wOptions.map(item => ({
                value: item.wid,
                label: `${field.all ? `${item.view} / ` : ''}${item.wid} (${item.name || (item.tpl === '_tplGroup' ? t('group') : item.tpl)})`,
            }));
            options.unshift({ value: '', label: t('attr_none') });
        }

        const withIcons = !!options.find(item => (item as PaletteFieldOptions)?.icon);

        return <Select
            variant="standard"
            disabled={disabled || (field.checkUsage && props.selectedWidgets.length > 1)}
            value={value}
            placeholder={isDifferent ? t('different') : null}
            defaultValue={field.default}
            classes={{
                root: props.classes.clearPadding,
                select: Utils.clsx(props.classes.fieldContent, props.classes.clearPadding),
            }}
            onChange={e => {
                if (field.type === 'widget' &&
                    field.checkUsage &&
                    e.target.value &&
                    store.getState().visProject[props.selectedView].widgets[e.target.value]?.usedInWidget
                ) {
                    // Show dialog
                    setAskForUsage({
                        wid: e.target.value,
                        cb: () => {
                            const project = modifyWidgetUsages(store.getState().visProject, props.selectedView, e.target.value, props.selectedWidgets[0], field.name);
                            props.changeProject(project);
                            store.dispatch(recalculateFields(true));
                        },
                    });
                } else {
                    change(e.target.value);
                    store.dispatch(recalculateFields(true));
                }
            }}
            renderValue={_value => {
                if (typeof options[0] === 'object') {
                    const item: PaletteFieldOptions | null = (options as PaletteFieldOptions[]).find(o => o.value === _value) as PaletteFieldOptions;
                    const text = item ? (field.type === 'select' && !field.noTranslation ? t(item.label) : item.label) : _value;
                    if (withIcons && item.icon) {
                        return <>
                            <Icon src={item.icon} style={{ width: 24, height: 24 }} />
                            <span style={item.color ? { color: item.color } : null}>{text}</span>
                        </>;
                    }
                    return text;
                }
                return field.type === 'select' && !field.noTranslation ? t(_value) : _value;
            }}
            fullWidth
        >
            {options.map((selectItem, i) => <MenuItem
                value={typeof selectItem === 'object' ? selectItem.value : selectItem}
                key={`${typeof selectItem === 'object' ? selectItem.value : selectItem}_${i}`}
                style={{ fontFamily: field.type === 'fontname' ? selectItem as string : null }}
            >
                {(selectItem as PaletteFieldOptions).icon ? <ListItemIcon>
                    <Icon src={(selectItem as PaletteFieldOptions).icon} style={{ width: 24, height: 24 }} />
                </ListItemIcon>
                    :
                    (withIcons ? <ListItemIcon><div style={{ width: 24 }} /></ListItemIcon> : null)}
                <ListItemText>
                    {selectItem === '' ?
                        <i>{t('attr_none')}</i>
                        :
                        (field.type === 'select' && !field.noTranslation ?
                            (typeof selectItem === 'object' ?
                                <span style={(selectItem as PaletteFieldOptions).color ? { color: (selectItem as PaletteFieldOptions).color } : null}>{field.noTranslation ? (selectItem as PaletteFieldOptions).label : t((selectItem as PaletteFieldOptions).label)}</span> : t(selectItem as string)
                            ) : (typeof selectItem === 'object' ?
                                <span style={(selectItem as PaletteFieldOptions).color ? { color: (selectItem as PaletteFieldOptions).color } : null}>{(selectItem as PaletteFieldOptions).label}</span> : (selectItem as string)
                            ))}
                </ListItemText>
            </MenuItem>)}
        </Select>;
    }

    if (field.type === 'select-views') {
        const options = getViewOptions(store.getState().visProject, [], null, 0)
            .filter(option => option.type === 'folder' || option.view !== props.selectedView);

        const views: string[] = value as any as string[] || [];

        return <Select
            variant="standard"
            disabled={disabled}
            value={Array.isArray(value) ? value : (value || '').toString().split(',')}
            placeholder={isDifferent ? t('different') : null}
            multiple={field.multiple !== false}
            renderValue={selected => {
                if (Array.isArray(selected)) {
                    return selected.join(', ');
                }
                return selected;
            }}
            classes={{
                root: props.classes.clearPadding,
                select: Utils.clsx(props.classes.fieldContent, props.classes.clearPadding),
            }}
            onChange={e => {
                if (Array.isArray(e.target.value)) {
                    const values = e.target.value.filter(tt => tt);
                    if (values.length) {
                        change(e.target.value.filter(tt => tt).join(','));
                    } else {
                        change(null);
                    }
                } else {
                    change(e.target.value);
                }
            }}
            fullWidth
        >
            {options.map((option, key) => (option.type === 'view' ?
                <MenuItem
                    value={option.view}
                    key={key.toString()}
                    style={{ paddingLeft: option.level * 16, lineHeight: '36px' }}
                >
                    <FileIcon style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    <span style={{ verticalAlign: 'middle' }}>
                        {field.multiple !== false ?
                            <Checkbox checked={views.includes(option.view)} /> : null}
                    </span>
                    <ListItemText primary={option.label} style={{ verticalAlign: 'middle' }} />
                </MenuItem>
                :
                <ListSubheader key={key} style={{ paddingLeft: option.level * 16 }} className={props.classes.listFolder}>
                    <FolderOpenedIcon className={props.classes.iconFolder} />
                    <span style={{ fontSize: '1rem' }}>{option.folder.name}</span>
                </ListSubheader>))}
        </Select>;
    }

    if (field.type === 'groups') {
        const groups: string[] = value as any as string[] || [];
        return <Select
            variant="standard"
            disabled={disabled}
            value={value || []}
            placeholder={isDifferent ? t('different') : null}
            multiple
            renderValue={selected => <div style={{ display: 'flex' }}>
                {Object.values(props.userGroups)
                    .filter(group => (selected as string).includes(group._id.split('.')[2]))
                    .map((group, key) =>
                        <span key={key} style={{ padding: '4px 4px' }}>
                            <TextWithIcon
                                value={group._id}
                                lang={I18n.getLanguage()}
                                list={[group]}
                            />
                        </span>)}
            </div>}
            classes={{
                root: props.classes.clearPadding,
                select: Utils.clsx(props.classes.fieldContent, props.classes.clearPadding),
            }}
            onChange={e => change(e.target.value)}
            fullWidth
        >
            {Object.values(props.userGroups).map((group, i) => <MenuItem
                value={group._id.split('.')[2]}
                key={`${group._id.split('.')[2]}_${i}`}
            >
                <Checkbox
                    disabled={disabled}
                    checked={groups.includes(group._id.split('.')[2])}
                />
                <TextWithIcon
                    value={group._id}
                    lang={I18n.getLanguage()}
                    list={[group]}
                />
            </MenuItem>)}
        </Select>;
    }

    if (field.type === 'auto' || field.type === 'class' || field.type === 'filters')  {
        let options = field.options;
        if (field.type === 'class') {
            options = Object.keys(window.collectClassesValue).filter(cssClass => cssClass.match(/^vis-style-/));
        } else if (field.type === 'filters') {
            options = window.vis ? window.vis.updateFilter() : [];
            options.unshift('');
        }
        if (options[0] && typeof options === 'string') {
            options = (options as PaletteFieldOptions[]).map(item => item.value);
        }

        return <Autocomplete
            freeSolo
            fullWidth
            disabled={disabled}
            options={options as string[] || []}
            inputValue={value as string || ''}
            value={value || ''}
            onInputChange={(e, inputValue) => change(inputValue)}
            onChange={(e, inputValue) => change(inputValue)}
            classes={{ input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent) }}
            renderOption={field.name === 'font-family' || field.name === 'lc-font-family' ?
                (optionProps, option) => <li
                    style={{ fontFamily: option as string }}
                    {...optionProps}
                >
                    {option}
                </li> : null}
            renderInput={params => <TextField
                variant="standard"
                error={!!error}
                helperText={typeof error === 'string' ? I18n.t(error) : null}
                disabled={disabled}
                {...params}
            />}
        />;
    }

    if (field.type === 'views')  {
        const options = getViewOptions(store.getState().visProject);

        return <Autocomplete
            freeSolo
            fullWidth
            disabled={disabled}
            // placeholder={isDifferent ? t('different') : null}
            options={options || []}
            inputValue={value as string || ''}
            value={value as string || ''}
            onInputChange={(e, inputValue) => change(inputValue)}
            onChange={(e, inputValue) => {
                if (typeof inputValue === 'object' && inputValue !== null) {
                    inputValue = inputValue.type === 'view' ? inputValue.view : inputValue.folder.name;
                }
                change(inputValue);
            }}
            classes={{ input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent) }}
            getOptionLabel={option => {
                if (typeof option === 'string') {
                    return option;
                }
                return option.type === 'view' ? option.label : option.folder.name;
            }}
            getOptionDisabled={option => option.type === 'folder'}
            renderOption={(optionProps, option) =>
                (option.type === 'view' ?
                    <Box
                        component="li"
                        style={{ paddingLeft: option.level * 16 }}
                        {...optionProps}
                        className={Utils.clsx(props.classes.menuItem, value === option.view ? props.classes.selected : null)}
                        key={`view${option.view}`}
                    >
                        <FileIcon />
                        {option.label}
                    </Box>
                    :
                    <Box
                        component="li"
                        style={{ paddingLeft: option.level * 16 }}
                        {...optionProps}
                        key={`folder${option.folder.id}`}
                    >
                        <FolderOpenedIcon style={{ color: '#00dc00', fontSize: 20 }} />
                        {option.folder.name}
                    </Box>)}
            renderInput={params => <TextField
                variant="standard"
                error={!!error}
                helperText={typeof error === 'string' ? I18n.t(error) : null}
                disabled={disabled}
                {...params}
                inputProps={{ ...params.inputProps }}
            />}
        />;
    }

    if (field.type === 'style') {
        const stylesOptions = getStylesOptions({
            filterFile:  field.filterFile,
            filterName:  field.filterName,
            filterAttrs: field.filterAttrs,
            removeName:  field.removeName,
        });

        return <Select
            variant="standard"
            value={value}
            disabled={disabled}
            placeholder={isDifferent ? t('different') : null}
            defaultValue={field.default}
            classes={{
                root: props.classes.clearPadding,
                select: Utils.clsx(props.classes.fieldContent, props.classes.clearPadding),
            }}
            onChange={e => change(e.target.value)}
            renderValue={selectValue => <div className={props.classes.backgroundClass}>
                <span className={stylesOptions[selectValue]?.parentClass}>
                    <span className={`${props.classes.backgroundClassSquare} ${selectValue}`} />
                </span>
                {t(stylesOptions[selectValue]?.name)}
            </div>}
            fullWidth
        >
            {Object.keys(stylesOptions).map((styleName, i) => <MenuItem
                value={styleName}
                key={`${styleName}_${i}`}
            >
                <span className={stylesOptions[styleName].parentClass}>
                    <span className={`${props.classes.backgroundClassSquare} ${styleName}`} />
                </span>
                {t(stylesOptions[styleName].name)}
            </MenuItem>)}
        </Select>;
    }

    if (field.type === 'custom') {
        if (field.component) {
            try {
                return field.component(
                    field,
                    widget.data,
                    newData => {
                        const _project = deepClone(store.getState().visProject);
                        props.selectedWidgets.forEach(selectedWidget => {
                            Object.keys(newData)
                                .forEach(attr => {
                                    if (newData[attr] === null) {
                                        delete _project[props.selectedView].widgets[selectedWidget].data[attr];
                                    } else {
                                        _project[props.selectedView].widgets[selectedWidget].data[attr] = newData[attr];
                                    }
                                });
                        });
                        props.changeProject(_project);
                        store.dispatch(recalculateFields(true));
                    },
                    {
                        context: {
                            socket: props.socket,
                            projectName,
                            instance,
                            adapterName,
                            views: store.getState().visProject,
                        },
                        selectedView: props.selectedView,
                        selectedWidgets: props.selectedWidgets,
                        selectedWidget: props.selectedWidgets.length === 1 ? props.selectedWidgets[0] : props.selectedWidgets as any as AnyWidgetId,
                    },
                );
            } catch (e) {
                console.error(`Cannot render custom field ${field.name}: ${e}`);
            }
        } else {
            return <>
                {field.type}
                /
                {value}
            </>;
        }
    }

    if (field.type === 'instance' || field.type === 'history') {
        return <Select
            variant="standard"
            value={value}
            disabled={disabled}
            placeholder={isDifferent ? t('different') : null}
            defaultValue={field.default}
            classes={{
                root: props.classes.clearPadding,
                select: Utils.clsx(props.classes.fieldContent, props.classes.clearPadding),
            }}
            onChange={e => change(e.target.value)}
            renderValue={selectValue => selectValue}
            fullWidth
        >
            {instances.map(_instance => <MenuItem
                value={field.isShort ? _instance.idShort : _instance.id}
                key={_instance.id}
            >
                <ListItemIcon>
                    <Icon src={`../${_instance.name}.admin/${_instance.icon}`} style={{ width: 24, height: 24 }} alt={_instance.name} />
                </ListItemIcon>
                <ListItemText>{field.isShort ? _instance.idShort : _instance.id}</ListItemText>
            </MenuItem>)}
        </Select>;
    }

    if (field.type === 'icon') {
        return <IconPicker
            label="Icon"
            value={value}
            disabled={disabled}
            onChange={fileBlob => change(fileBlob)}
            previewClassName={props.classes.iconPreview}
        />;
    }

    if (field.type === 'icon64') {
        return <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
            <TextField
                fullWidth
                size="small"
                placeholder={isDifferent ? t('different') : null}
                variant="standard"
                value={value}
                error={!!error}
                disabled={disabled}
                onChange={e => change(e.target.value)}
                InputProps={{
                    endAdornment: value ? <IconButton
                        disabled={disabled}
                        size="small"
                        onClick={() => change('')}
                    >
                        <ClearIcon />
                    </IconButton> : null,
                    classes: {
                        input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent),
                    },
                }}
            />
            <Button
                variant={value ? 'outlined' : undefined}
                // @ts-expect-error grey is valid color
                color={value ? 'grey' : undefined}
                onClick={() => setIdDialog(true)}
            >
                {value ? <Icon src={value as string} style={{ width: 36, height: 36 }} /> : '...'}
            </Button>
            {idDialog &&
                <MaterialIconSelector
                    themeType={props.themeType}
                    value={value}
                    onClose={(icon: string | null) => {
                        setIdDialog(false);
                        if (icon !== null) {
                            change(icon);
                        }
                    }}
                />}
        </div>;
    }

    if (field.type === 'html' || field.type === 'json' || (field.type === 'text' && field.noButton === false)) {
        return <>
            <TextField
                size="small"
                placeholder={isDifferent ? t('different') : null}
                variant="standard"
                value={value}
                multiline={field.multiline}
                fullWidth
                error={!!error}
                disabled={disabled}
                helperText={typeof error === 'string' ? I18n.t(error) : null}
                onChange={e => change(e.target.value)}
                InputProps={{
                    endAdornment: field.noButton ? null : <Button
                        disabled={disabled}
                        size="small"
                        onClick={() => setIdDialog(true)}
                    >
                        <EditIcon />
                    </Button>,
                    classes: {
                        input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent),
                    },
                }}
                rows={2}
            />
            {idDialog ? <TextDialog
                open={!0}
                value={value as string}
                onChange={newValue => change(newValue)}
                onClose={() => setIdDialog(false)}
                themeType={props.themeType}
                type={field.type}
            /> : null}
        </>;
    }

    if (!field.type || field.type === 'number' || field.type === 'password' || field.type === 'text' || field.type === 'url') {
        return <>
            <TextField
                variant="standard"
                fullWidth
                ref={textRef}
                error={!!error}
                disabled={disabled}
                helperText={typeof error === 'string' ? I18n.t(error) : null}
                onFocus={() => setTextDialogFocused(true)}
                onBlur={() => {
                    setTextDialogFocused(false);
                    if (field.type === 'number' && value) {
                        let _value: number = value as number;
                        if (typeof _value === 'string') {
                            _value = parseFloat(_value);
                            if (field.min !== undefined) {
                                if (_value < field.min) {
                                    _value = field.min;
                                }
                            }
                            if (field.max !== undefined) {
                                if (_value > field.max) {
                                    _value = field.max;
                                }
                            }
                            change(_value);
                            return;
                        }
                        if (field.min !== undefined) {
                            if (_value < field.min) {
                                change(field.min);
                                return;
                            }
                        }
                        if (field.max !== undefined) {
                            if (_value > field.max) {
                                change(field.max);
                            }
                        }
                    }
                }}
                placeholder={isDifferent ? t('different') : null}
                InputProps={{
                    classes: { input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent) },
                }}
                value={value}
                onChange={e => change(e.target.value)}
                type={field.type ? field.type : 'text'}
                // eslint-disable-next-line react/jsx-no-duplicate-props
                inputProps={{
                    min: field.min,
                    max: field.max,
                    step: field.step,
                }}
            />
            {urlPopper}
        </>;
    }

    return `${field.type}/${value}`;
};

export default WidgetField;
