import type React from 'react';
import type { Theme } from '@mui/material';
import type moment from 'moment';
import type { LegacyConnection } from '@iobroker/adapter-react-v5';
import { AnyWidgetId, Project, WidgetData } from '@/types';
import { CustomPaletteProperties, WidgetAttributeInfo } from '@/Vis/visRxWidget';
import VisFormatUtils from '@/Vis/visFormatUtils';
import VisView from '@/Vis/visView';
import { type ViewCommand, type ViewCommandOptions } from '@/Vis/visView';

export interface RxWidgetInfoCustomComponentContext {
    readonly socket: Connection;
    readonly projectName: string;
    readonly instance: number;
    readonly adapterName: string;
    readonly views: Project;
}

export interface RxWidgetInfoCustomComponentProperties {
    readonly context: RxWidgetInfoCustomComponentContext;
    readonly selectedView: string;
    readonly selectedWidgets: AnyWidgetId[];
    readonly selectedWidget: AnyWidgetId;
}

export type RxWidgetAttributeType = 'text' | 'delimiter' | 'help' | 'html' | 'json' | 'id' | 'instance' | 'select' | 'nselect' | 'auto' | 'checkbox' | 'number' | 'select-views' | 'custom' | 'image' | 'color' | 'password' | 'history' | 'hid' | 'icon' | 'dimension' | 'fontname' | 'groups' | 'class' | 'filters' | 'views' | 'style' | 'icon64';

export type RxWidgetInfoAttributesFieldText = {
    /** Field type */
    readonly type: 'text';
    /** Field default value */
    readonly default?: string;
    /** if true, no edit button will be shown. Default is true. */
    readonly noButton?: boolean;

    /** Name of the widget field */
    readonly name: string;
    /** Field label (i18n) */
    readonly label?: string;
    /** JS Function for conditional visibility */
    readonly hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Tooltip (i18n) */
    readonly tooltip?: string;
    /** JS Function for conditional disability */
    readonly disabled?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** JS Function for error */
    readonly error?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Do not show binding symbol fot this field */
    readonly noBinding?: boolean;
    /** Callback called if the field value changed */
    readonly onChange?: (field: WidgetAttributeInfo, data: Record<string, any>, changeData: (newData: Record<string, any>) => void, socket: Connection, index?: number) => Promise<void>;
}

export type RxWidgetInfoAttributesFieldDelimiter = {
    /** Field type */
    readonly type: 'delimiter';
    /** It is not required here */
    readonly name: string;
    /** JS Function for conditional visibility */
    readonly hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
}
export type RxWidgetInfoAttributesFieldHelp = {
    /** Field type */
    readonly type: 'help';
    /** i18n help text - This text will be shown without a label */
    readonly text: string;
    /** if true, the text will not be translated  */
    readonly noTranslation?: boolean;
    /** this style will be applied to the text */
    readonly style?: React.CSSProperties;

    /** Name of the widget field */
    readonly name: string;
    /** Field label (i18n) */
    readonly label?: string;
    /** JS Function for conditional visibility */
    readonly hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
}

export type RxWidgetInfoAttributesFieldHTML = {
    /** Field type */
    readonly type: 'html' | 'json';
    /** Field default value */
    readonly default?: string;
    /** show multi-line editor */
    readonly multiline?: boolean;

    /** Name of the widget field */
    readonly name: string;
    /** Field label (i18n) */
    readonly label?: string;
    /** JS Function for conditional visibility */
    readonly hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Tooltip (i18n) */
    readonly tooltip?: string;
    /** JS Function for conditional disability */
    readonly disabled?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** JS Function for error */
    readonly error?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Do not show binding symbol fot this field */
    readonly noBinding?: boolean;
    /** Callback called if the field value changed */
    readonly onChange?: (field: WidgetAttributeInfo, data: Record<string, any>, changeData: (newData: Record<string, any>) => void, socket: Connection, index?: number) => Promise<void>;
}

export type RxWidgetInfoAttributesFieldID = {
    /** Field type */
    readonly type: 'id';
    /** Field default value */
    readonly default?: string;
    /** Do not write 'nothing_selected' into the field by creation */
    readonly noInit?: boolean;
    /** Do not subscribe on changes of the object */
    readonly noSubscribe?: boolean;
    /** Filter of objects (not JSON string, it is an object), like:
     - `{common: {custom: true}}` - show only objects with some custom settings
     - `{common: {custom: 'sql.0'}}` - show only objects with sql.0 custom settings (only of the specific instance)
     - `{common: {custom: '_dataSources'}}` - show only objects of adapters `influxdb' or 'sql' or 'history'
     - `{common: {custom: 'adapterName.'}}` - show only objects of the custom settings for specific adapter (all instances)
     - `{type: 'channel'}` - show only channels
     - `{type: ['channel', 'device']}` - show only channels and devices
     - `{common: {type: 'number'}` - show only states of type 'number
     - `{common: {type: ['number', 'string']}` - show only states of type 'number and string
     - `{common: {role: 'switch'}` - show only states with roles starting from switch
     - `{common: {role: ['switch', 'button']}` - show only states with roles starting from `switch` and `button`
     */
    readonly filter?: {
        readonly common?: {
            readonly custom?: true | string | '_dataSources';
            readonly type?: ioBroker.CommonType | ioBroker.CommonType[];
            readonly role?: string | string[];
        };
        readonly type?: ioBroker.ObjectType | ioBroker.ObjectType[];
    };

    /** Name of the widget field */
    readonly name: string;
    /** Field label (i18n) */
    readonly label?: string;
    /** JS Function for conditional visibility */
    readonly hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Tooltip (i18n) */
    readonly tooltip?: string;
    /** JS Function for conditional disability */
    readonly disabled?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** JS Function for error */
    readonly error?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Do not show binding symbol fot this field */
    readonly noBinding?: boolean;
    /** Callback called if the field value changed */
    readonly onChange?: (field: WidgetAttributeInfo, data: Record<string, any>, changeData: (newData: Record<string, any>) => void, socket: Connection, index?: number) => Promise<void>;
}

export type RxWidgetInfoAttributesFieldInstance = {
    /** Field type */
    readonly type: 'instance';
    /** Field default value */
    readonly default?: string;
    /** Additionally, you can provide `adapter` to filter the instances of specific adapter. With special adapter name `_dataSources` you can get all adapters with flag `common.getHistory`. */
    readonly adapter?: string;
    /** In this case, only instance number (like `0`) is shown and not `history.0`. It can be set to true only with non-empty `adapter` setting. */
    readonly iShort?: boolean;

    /** Name of the widget field */
    readonly name: string;
    /** Field label (i18n) */
    readonly label?: string;
    /** JS Function for conditional visibility */
    readonly hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Tooltip (i18n) */
    readonly tooltip?: string;
    /** JS Function for conditional disability */
    readonly disabled?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** JS Function for error */
    readonly error?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Do not show binding symbol fot this field */
    readonly noBinding?: boolean;
    /** Callback called if the field value changed */
    readonly onChange?: (field: WidgetAttributeInfo, data: Record<string, any>, changeData: (newData: Record<string, any>) => void, socket: Connection, index?: number) => Promise<void>;
}

export type RxWidgetInfoAttributesFieldSelect = {
    /** Field type */
    readonly type: 'select' | 'nselect' | 'auto';
    /** Options for a select type */
    readonly options: { value: string; label: string }[] | string[];
    /** Field default value */
    readonly default?: string;
    /** Do not translate options */
    readonly noTranslation?: boolean;

    /** Name of the widget field */
    readonly name: string;
    /** Field label (i18n) */
    readonly label?: string;
    /** JS Function for conditional visibility */
    readonly hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Tooltip (i18n) */
    readonly tooltip?: string;
    /** JS Function for conditional disability */
    readonly disabled?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** JS Function for error */
    readonly error?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Do not show binding symbol fot this field */
    readonly noBinding?: boolean;
    /** Callback called if the field value changed */
    readonly onChange?: (field: WidgetAttributeInfo, data: Record<string, any>, changeData: (newData: Record<string, any>) => void, socket: Connection, index?: number) => Promise<void>;
}

export type RxWidgetInfoAttributesFieldCheckbox = {
    /** Field type */
    readonly type: 'checkbox';
    /** Field default value */
    readonly default?: boolean;

    /** Name of the widget field */
    readonly name: string;
    /** Field label (i18n) */
    readonly label?: string;
    /** JS Function for conditional visibility */
    readonly hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Tooltip (i18n) */
    readonly tooltip?: string;
    /** JS Function for conditional disability */
    readonly disabled?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** JS Function for error */
    readonly error?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Do not show binding symbol fot this field */
    readonly noBinding?: boolean;
    /** Callback called if the field value changed */
    readonly onChange?: (field: WidgetAttributeInfo, data: Record<string, any>, changeData: (newData: Record<string, any>) => void, socket: Connection, index?: number) => Promise<void>;
}

export type RxWidgetInfoAttributesFieldNumber = {
    /** Field type */
    readonly type: 'number';
    /** Field default value */
    readonly default?: number;
    /** Number min value */
    readonly min?: number;
    /** Number max value */
    readonly max?: number;
    /** Number step */
    readonly step?: number;

    /** Name of the widget field */
    readonly name: string;
    /** Field label (i18n) */
    readonly label?: string;
    /** JS Function for conditional visibility */
    readonly hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Tooltip (i18n) */
    readonly tooltip?: string;
    /** JS Function for conditional disability */
    readonly disabled?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** JS Function for error */
    readonly error?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Do not show binding symbol fot this field */
    readonly noBinding?: boolean;
    /** Callback called if the field value changed */
    readonly onChange?: (field: WidgetAttributeInfo, data: Record<string, any>, changeData: (newData: Record<string, any>) => void, socket: Connection, index?: number) => Promise<void>;
}

export type RxWidgetInfoAttributesFieldSlider = {
    /** Field type */
    readonly type: 'slider';
    /** Field default value */
    readonly default?: number;
    /** Slider min value */
    readonly min: number;
    /** Slider max value */
    readonly max: number;
    /** Slider max value */
    readonly step?: number;
    /** Slider marks?: array of possible marks. Like `[{value: 1, label: 'one'}, {value: 10}, {value: 100}] */
    readonly marks?: { value: number; label: string }[];
    /** Controls when the value label is displayed: `auto` the value label will display when the thumb is hovered or focused. `on` will display persistently. `off` will never display. */
    readonly valueLabelDisplay?: 'on' | 'off' | 'auto';

    /** Name of the widget field */
    readonly name: string;
    /** Field label (i18n) */
    readonly label?: string;
    /** JS Function for conditional visibility */
    readonly hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Tooltip (i18n) */
    readonly tooltip?: string;
    /** JS Function for conditional disability */
    readonly disabled?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** JS Function for error */
    readonly error?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Do not show binding symbol fot this field */
    readonly noBinding?: boolean;
    /** Callback called if the field value changed */
    readonly onChange?: (field: WidgetAttributeInfo, data: Record<string, any>, changeData: (newData: Record<string, any>) => void, socket: Connection, index?: number) => Promise<void>;
}

export type RxWidgetInfoAttributesFieldWidget = {
    /** Field type */
    readonly type: 'widget';
    /** Field default value */
    readonly default?: string;
    /** type of the widget, like `tplMaterial2Switches` */
    readonly tpl?: string;
    /** if true, all widgets of all views will be shown, not only from the current view. Default is false. */
    readonly all?: boolean;
    /**  if true, grouped widgets will be shown too. Default is false. */
    readonly withGroups?: boolean;
    /** if true, the current widget will be shown in the list too. */
    readonly withSelf?: boolean;
    /** if true, it will be checked if the widget is used somewhere else and user will be asked. */
    readonly checkUsage?: boolean;
    /** if true, only widgets will be shown, which are not used in some view. Default is false. */
    readonly hideUsed?: boolean;

    /** Name of the widget field */
    readonly name: string;
    /** Field label (i18n) */
    readonly label?: string;
    /** JS Function for conditional visibility */
    readonly hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Tooltip (i18n) */
    readonly tooltip?: string;
    /** JS Function for conditional disability */
    readonly disabled?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** JS Function for error */
    readonly error?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Do not show binding symbol fot this field */
    readonly noBinding?: boolean;
    /** Callback called if the field value changed */
    readonly onChange?: (field: WidgetAttributeInfo, data: Record<string, any>, changeData: (newData: Record<string, any>) => void, socket: Connection, index?: number) => Promise<void>;
}

export type RxWidgetInfoAttributesFieldSelectViews = {
    /** Field type */
    readonly type: 'select-views';
    /** Field default value */
    readonly default?: string;
    /** if false, only one view can be selected. Default is true. */
    readonly multiple?: boolean;

    /** Name of the widget field */
    readonly name: string;
    /** Field label (i18n) */
    readonly label?: string;
    /** JS Function for conditional visibility */
    readonly hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Tooltip (i18n) */
    readonly tooltip?: string;
    /** JS Function for conditional disability */
    readonly disabled?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** JS Function for error */
    readonly error?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Do not show binding symbol fot this field */
    readonly noBinding?: boolean;
    /** Callback called if the field value changed */
    readonly onChange?: (field: WidgetAttributeInfo, data: Record<string, any>, changeData: (newData: Record<string, any>) => void, socket: Connection, index?: number) => Promise<void>;
}

export type RxWidgetInfoAttributesFieldSelectCustom = {
    /** Field type */
    readonly type: 'custom';
    /** Field default value */
    readonly default?: string | number | boolean;
    /** if false, only one view can be selected. Default is true. */
    readonly component: (
        field: RxWidgetInfoAttributesField,
        data: WidgetData,
        onDataChange: (newData: WidgetData) => void,
        props: RxWidgetInfoCustomComponentProperties,
    ) => React.JSX.Element | React.JSX.Element[] ;

    /** Name of the widget field */
    readonly name: string;
    /** Field label (i18n) */
    readonly label?: string;
    /** JS Function for conditional visibility */
    readonly hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Tooltip (i18n) */
    readonly tooltip?: string;
    /** JS Function for conditional disability */
    readonly disabled?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** JS Function for error */
    readonly error?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Do not show binding symbol fot this field */
    readonly noBinding?: boolean;
    /** Callback called if the field value changed */
    readonly onChange?: (field: WidgetAttributeInfo, data: Record<string, any>, changeData: (newData: Record<string, any>) => void, socket: Connection, index?: number) => Promise<void>;
}

export type RxWidgetInfoAttributesFieldSelectSimple = {
    /** Field type */
    readonly type: 'image' | 'color' | 'password' | 'history' | 'hid' | 'icon' | 'dimension' | 'fontname' | 'groups' | 'class' | 'filters' | 'views' | 'style' | 'icon64';
    /** Field default value */
    readonly default?: string;

    /** Name of the widget field */
    readonly name: string;
    /** Field label (i18n) */
    readonly label?: string;
    /** JS Function for conditional visibility */
    readonly hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Tooltip (i18n) */
    readonly tooltip?: string;
    /** JS Function for conditional disability */
    readonly disabled?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** JS Function for error */
    readonly error?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Do not show binding symbol fot this field */
    readonly noBinding?: boolean;
    /** Callback called if the field value changed */
    readonly onChange?: (field: WidgetAttributeInfo, data: Record<string, any>, changeData: (newData: Record<string, any>) => void, socket: Connection, index?: number) => Promise<void>;
}

export type RxWidgetInfoAttributesFieldSelectDefault = {
    /** Field default value */
    readonly default?: string;

    /** Name of the widget field */
    readonly name: string;
    /** Field label (i18n) */
    readonly label?: string;
    /** JS Function for conditional visibility */
    readonly hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Tooltip (i18n) */
    readonly tooltip?: string;
    /** JS Function for conditional disability */
    readonly disabled?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** JS Function for error */
    readonly error?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Do not show binding symbol fot this field */
    readonly noBinding?: boolean;
    /** Callback called if the field value changed */
    readonly onChange?: (field: WidgetAttributeInfo, data: Record<string, any>, changeData: (newData: Record<string, any>) => void, socket: Connection, index?: number) => Promise<void>;
}

export type RxWidgetInfoAttributesField =
    RxWidgetInfoAttributesFieldText |
    RxWidgetInfoAttributesFieldDelimiter |
    RxWidgetInfoAttributesFieldHelp |
    RxWidgetInfoAttributesFieldHTML |
    RxWidgetInfoAttributesFieldID |
    RxWidgetInfoAttributesFieldInstance |
    RxWidgetInfoAttributesFieldSelect |
    RxWidgetInfoAttributesFieldCheckbox |
    RxWidgetInfoAttributesFieldNumber |
    RxWidgetInfoAttributesFieldSlider |
    RxWidgetInfoAttributesFieldWidget |
    RxWidgetInfoAttributesFieldSelectViews |
    RxWidgetInfoAttributesFieldSelectCustom |
    RxWidgetInfoAttributesFieldSelectSimple |
    RxWidgetInfoAttributesFieldSelectDefault;

export type Timer = ReturnType<typeof setTimeout>;

export interface Permissions {
    /** Accessible in Runtime */
    read: boolean;
    /** Accessible in Editor */
    write: boolean;
}

interface UserPermissions {
    /** Which user has read or write access for the project */
    [user: string]: Permissions;
}

export interface ProjectSettings {
    darkReloadScreen: boolean;
    destroyViewsAfter: number;
    folders: {id: string; name: string; parentId: string}[];
    openedViews: string[];
    reconnectInterval: number;
    reloadOnEdit: boolean;
    reloadOnSleep: number;
    statesDebounceTime: number;
    scripts: unknown;
    /** Which user has read or write access for the project */
    permissions?: UserPermissions;
}

export type SingleWidgetId = `w${string}`
export type GroupWidgetId = `g${string}`
export type AnyWidgetId = SingleWidgetId | GroupWidgetId
/** Used for the attributes and variables, where the state ID stored */
export type StateID = string;

interface WidgetData {
    /** Only exists if given by user in a tab general */
    name?: string;
    filterkey?: string;
    members?: AnyWidgetId[];
    [other: string]: any;
}

export interface WidgetStyle {
    position?: '' | 'absolute' | 'relative' | 'sticky' | 'static' | null;
    display?: '' | 'inline-block' | null;
    top?: string | number | null;
    left?: string | number | null;
    width?: string | number | null;
    right?: string | number | null;
    bottom?: string | number | null;
    /** if widget become relative, here is stored the original width, so when we toggle it to the absolute width again, it has some width  */
    absoluteWidth?: string | number | null;
    height?: string | number | null;
    'z-index'?: number | null;
    'overflow-x'?: '' | 'visible' | 'hidden' | 'scroll' | 'auto' | 'initial' | 'inherit' | null;
    'overflow-y'?: '' | 'visible' | 'hidden' | 'scroll' | 'auto' | 'initial' | 'inherit' | null;
    opacity?: number | null;
    cursor?: 'alias' | 'all-scroll' | 'auto' | 'cell' | 'col-resize' | 'context-menu' | 'copy' | 'crosshair' | 'default' | 'e-resize' | 'ew-resize' | 'grab' | 'grabbing' | 'help' | 'move' | 'n-resize' | 'ne-resize' | 'nesw-resize' | 'ns-resize' | 'nw-resize' | 'nwse-resize' | 'no-drop' | 'none' | 'not-allowed' | 'pointer' | 'progress' | 'row-resize' | 's-resize' | 'se-resize' | 'sw-resize' | 'text' | 'vertical-text' | 'w-resize' | 'wait' | 'zoom-in' | 'zoom-out' | 'initial' | 'inherit' | null;
    transform?: string;

    color?: string;
    'text-align'?: '' | 'left' | 'right' | 'center' | 'justify' | 'initial' | 'inherit' | null;
    'text-shadow'?: string | null;
    'font-family'?: string | null;
    'font-style'?: '' | 'normal' | 'italic' | 'oblique' | 'initial' | 'inherit' | null;
    'font-variant'?: '' | 'normal' | 'small-caps' | 'initial' | 'inherit' | null;
    'font-weight'?: string;
    'font-size'?: string;
    'line-height'?: string;
    'letter-spacing'?: string;
    'word-spacing'?: string;

    background?: string;
    'background-color'?: string;
    'background-image'?: string;
    'background-repeat'?: '' | 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat' | 'initial' | 'inherit' | null;
    'background-position'?: string | null;
    'background-size'?: string | null;
    'background-clip'?: '' | 'border-box' | 'padding-box' | 'content-box' | 'initial' | 'inherit' | null;
    'background-origin'?: '' | 'padding-box' | 'border-box' | 'content-box' | 'initial' | 'inherit' | null;

    'border-width'?: string | null;
    'border-style'?: '' | 'dotted' | 'dashed' | 'solid' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset' | 'hidden' | null;
    'border-color'?: string | null;
    'border-radius'?: string | null;

    padding?: string | null;
    'padding-left'?: string | null;
    'padding-top'?: string | null;
    'padding-right'?: string | null;
    'padding-bottom'?: string | null;
    'box-shadow'?: string | null;
    'margin-left'?: string | null;
    'margin-top'?: string | null;
    'margin-right'?: string | null;
    'margin-bottom'?: string | null;

    /** relative property, if the widget must be shown on the new line */
    newLine?: boolean;
}

interface SingleWidget  {
    /** Internal wid */
    _id?: string;
    /** Widget type */
    tpl: string;
    data: WidgetData;
    style: WidgetStyle;
    /** @deprecated The widget set Use widgetSet */
    set?: string;
    /** @deprecated The widget set. Use widgetSet */
    wSet?: string;
    /** The widget set name. Groups have widget set null */
    widgetSet: string | null;
    /** The id of the group, if the widget is grouped */
    groupid?: GroupWidgetId;
    /** If the widget is grouped */
    grouped?: boolean;
    /** @deprecated it was typo */
    groupped?: boolean;
    /** Permissions for each user for the widget */
    permissions?: UserPermissions;
    /** This widget was taken from a marketplace */
    marketplace?: any;
    /** Indicator that this widget is used in another widget (e.g., in panel) */
    usedInWidget?: AnyWidgetId;
}

interface GroupData extends WidgetData {
    /** Widget IDs of the members */
    members: AnyWidgetId[];
}
export interface GroupWidget extends SingleWidget {
    tpl: '_tplGroup';
    data: GroupData;
}

export type Widget = SingleWidget | GroupWidget;

export interface ViewSettings {
    /** Permissions for each user for the view */
    permissions?: UserPermissions;
    comment?: string;
    class?: string;
    filterkey?: string;
    group?: string[];
    theme?: string;
    group_action?: 'disabled' | 'hide' | null | '';

    useBackground?: boolean;
    'bg-image'?: string;
    'bg-position-x'?: string;
    'bg-position-y'?: string;
    'bg-width'?: string;
    'bg-height'?: string;
    'bg-color'?: string;
    style?: {
        display?: 'flex' | 'grid' | 'none' | null | '';
        background_class?: string;
        background?: string;
        'background-color'?: string;
        'background-image'?: string;
        'background-repeat'?:  'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat' | 'initial' | 'inherit' | null | '';
        'background-attachment'?: 'scroll' | 'fixed' | 'local' | 'initial' | 'inherit' | null | '';
        'background-position'?: 'left top' | 'left center' | 'left bottom' | 'right top' | 'right center' | 'right bottom' | 'center top' | 'center center' | 'center bottom' | 'initial' | 'inherit' | null | '';
        'background-size'?: 'auto' | 'cover' | 'contain' | 'initial' | 'inherit' | null | '';
        'background-clip'?: 'border-box' | 'padding-box' | 'content-box' | 'initial' | 'inherit' | null | '';
        'background-origin'?: 'padding-box' | 'border-box' | 'content-box' | 'initial' | 'inherit' | null | '';

        color?: string;
        'text-shadow'?: string;
        'font-family'?: string;
        'font-style'?: string;
        'font-variant'?: string;
        'font-weight'?: string;
        'font-size'?: string;
        'line-height'?: string;
        'letter-spacing'?: string;
        'word-spacing'?: string;
    };

    useAsDefault?: boolean;
    alwaysRender?: boolean;
    snapType?: 0 | 1 | 2 | null;
    snapColor?: string;
    gridSize?: number;
    sizex?: number;
    sizey?: number;
    limitScreen?: boolean;
    limitScreenDesktop?: boolean;
    limitScreenBorderWidth?: number;
    limitScreenBorderColor?: string;
    limitScreenBorderStyle?: string;
    limitScreenBackgroundColor?: string;

    navigation?: boolean;
    navigationTitle?: string;
    navigationOrder?: number;
    navigationIcon?: string;
    navigationImage?: string;
    navigationOrientation?: 'horizontal' | 'vertical';
    navigationOnlyIcon?: boolean;
    navigationBackground?: string;
    navigationSelectedBackground?: string;
    navigationSelectedColor?: string;
    navigationHeaderTextColor?: string;
    navigationColor?: string;

    navigationChevronColor?: string;
    navigationHideMenu?: boolean;
    navigationHideOnSelection?: boolean;
    navigationHeaderText?: string;
    navigationNoHide?: boolean;
    navigationButtonBackground?: string;

    navigationBar?: boolean;
    navigationBarColor?: string;
    navigationBarText?: string;
    navigationBarIcon?: string;
    navigationBarImage?: string;

    columnWidth?: number;
    columnGap?: number;
    rowGap?: number | string;
    /** relative widget order */
    order?: AnyWidgetId[];
}

export interface View {
    activeWidgets: string[];
    filterList: string[];
    rerender: boolean;
    name?: string;
    settings?: ViewSettings;
    /** Widgets on this view */
    widgets: {
        [groupId: GroupWidgetId]: GroupWidget;
        [widgetId: SingleWidgetId]: SingleWidget;
    };
    filterWidgets?: AnyWidgetId[];
    filterInvert?: boolean;
}

export interface Project {
    // @ts-expect-error this type has bad code-style, we should refactor the views in a views: Record<string, View> attribute
    ___settings: ProjectSettings;
    [view: string]: View;
}

export interface RxRenderWidgetProps {
    className: string;
    overlayClassNames: string[];
    style: React.CSSProperties;
    id: string;
    refService: React.Ref<HTMLDivElement>;
    widget: object;
}

interface ArgumentChanged {
    callback: any;
    arg: string;
    wid: string;
}
interface Subscribing {
    activeViews: string[];
    byViews: Record<string, string[]>;
    active: string[];
    IDs: string[];
}

export interface VisRxWidgetStateValues {
    /** State value */
    [values: `${string}.val`]: any;
    /** State from */
    [from: `${string}.from`]: string;
    /** State timestamp */
    [timestamp: `${string}.ts`]: number;
    /** State last change */
    [timestamp: `${string}.lc`]: number;
}

export interface VisLegacy {
    instance: string;
    navChangeCallbacks: (() => void)[];
    findNearestResolution: (width?: number, height?: number) => string;
    version: number;
    states: VisRxWidgetStateValues;
    objects: Record<string, any>;
    isTouch: boolean;
    activeWidgets: string[];
    editMode: boolean;
    binds: any;
    views: Project;
    activeView: string;
    language: string;
    user: string;
    projectPrefix: string;
    _: (word: string) => string;
    dateFormat: '';
    loginRequired: false;
    viewsActiveFilter: Record<string, string[]>;
    onChangeCallbacks: ArgumentChanged[];
    subscribing: Subscribing;
    conn: any;
    lastChangedView: string | null; // used in vis-2 to save last sent view name over vis-2.0.command
    updateContainers: () => void;
    renderView: (viewDiv: string, view: string, hidden: boolean, cb: () => void) => void;
    updateFilter: (view?: string) => string[];
    destroyUnusedViews: () => void;
    changeFilter: (view: string, filter: string, showEffect?: string, showDuration?: number, hideEffect?: string, hideDuration?: number) => boolean;
    // setValue: this.setValue;
    changeView: (viewDiv: string, view: string, hideOptions: any, showOptions: any, sync: boolean, cb: () => void) => void;
    getCurrentPath: () => string;
    navigateInView: (path: string) => void;
    onWakeUp: (callback: null | (() => void | string), wid?: string) => void;
    // inspectWidgets: (viewDiv: string, view: string, addWidget, delWidget, onlyUpdate: boolean) => void,
    // showMessage: (message: string, title: string, icon, width, callback) => void,
    showWidgetHelper: (viewDiv: string, view: string, wid: string, isShow: boolean) => void;
    addFont: (fontName: string) => void;
    // registerOnChange: (callback, arg, wid: string) => void;
    // unregisterOnChange: (callback, arg, wid: string) => void;
    generateInstance: () => string;
    // findByRoles: (stateId: string, roles) => any,
    // findByName: (stateId: string, objName) => any,
    hideShowAttr: (widAttr: string) => void;
    // bindingsCache: {},
    extractBinding: (format: string, doNotIgnoreEditMode?: boolean) => any;
    // formatBinding: (format: string, view: string, wid: string, widget, widgetData, values) => string,
    getViewOfWidget: (wid: string) => string | null;
    confirmMessage: (message: string, title: string, icon: string, width: number, callback: () => boolean) => void;
    // config: {}, // storage of dialog positions and size (Deprecated)
    showCode: (code: string, title: string, mode?: 'html' | 'json' | 'css') => void;
    // findCommonAttributes: (/* view, widgets */) => void;
    bindWidgetClick: () => void;
    preloadImages: (sources: string[]) => void;
    // updateStates: data => void,
    getHistory: (id: string, options: any, callback: () => void) => void;
    getHttp: (url: string, callback: () => string) => void;
    formatDate: (dateObj: Date | string | number, isDuration?: boolean, _format?: string) => string;
    widgets: any;
    editSelect: (widAttr: string, values: any, notTranslate: boolean, init: () => void, onchange: () => void) => string | null;
    isWidgetHidden: (view: string, widget: string, visibilityOidValue: null | number | string | undefined | boolean, widgetData: any) => boolean;
    getUserGroups: () => Record<string, string[]>;
    detectBounce: (el: any, isUp?: boolean) => boolean;
}

export interface Window {
    vis: VisLegacy;
    systemDictionary?: Record<string, Record<ioBroker.Languages, string>>;
    systemLang?: ioBroker.Languages;
    _: (text: string, arg1?: boolean | number | string, arg2?: boolean | number | string, arg3?: boolean | number | string) => string;
    addWords: (words: Record<string, Record<ioBroker.Languages, string>>) => void;
    VisMarketplace?: {
        api: {
            apiGetWidgetRevision(widgetId: string, id: string): Promise<any>;
        };
        default: React.Component<VisMarketplaceProps>;
    };
    [promiseName: PromiseName]: Promise<any>;
    [widgetSetName: WidgetSetName]: {
        __initialized: boolean;
        get: (module: string) => () => void;
        init?: (shareScope: any) => Promise<void>;
    };
    __widgetsLoadIndicator: (process: number, max: number) => void;
    _lastAppliedStyle: string;
}

type ResizeHandler = 'n' | 'e' | 's' | 'w' | 'nw' | 'ne' | 'sw' | 'se';

export interface BaseWidgetState extends React.ComponentState {
    width: number;
    height: number;
    defaultView: string;
    draggable: boolean;
    data: Record<string, string | number | boolean>;
    style: Record<string, string | number>;
    applyBindings: boolean;
    editMode: boolean;
    multiViewWidget: boolean;
    selected: boolean;
    selectedOne: boolean;
    resizable: boolean;
    resizeHandles: ResizeHandler[];
    widgetHint: string;
    isHidden: boolean;
    gap: number;
}

export interface RxWidgetState extends BaseWidgetState {
    rxData: Record<string, string | number | boolean>;
    rxStyle: Record<string, string | number>;
    values: Record<string, string | number | boolean | null>;
    visible: boolean;
    disabled: boolean;
}

export interface CanWidgetStore {
    style: Record<string, string | number>;
    data: Record<string, string | number | boolean>;
    wid: string;
}

type VisBindingOperationType = 'eval' | '*' | '+' | '-' | '/' | '%' | 'min' | 'max' | 'date' | 'momentDate' | 'value' | 'array' | 'pow' | 'round' | 'random' | 'json' | '';

interface VisBindingOperationArgument {
    name: string;
    /** ioBroker state ID plus '.val', '.ts', '.ack' or '.lc' */
    visOid: StateID;
    /** ioBroker state ID */
    systemOid: StateID;
}

interface VisBindingOperation {
    op: VisBindingOperationType;
    arg?: VisBindingOperationArgument[] | string | number | string[];
    formula?: string;
}

interface VisBinding {
    /** ioBroker state ID plus '.val', '.ts', '.ack' or '.lc' */
    visOid: StateID;
    /** ioBroker state ID */
    systemOid: StateID;
    /** Part of the string, like {id.ack} */
    token: string;
    operations?: VisBindingOperation[];
    format: string;
    isSeconds: boolean;
}

interface VisLinkContextBinding extends VisBinding {
    type: 'style' | 'data';
    attr: string;
    view: string;
    widget: AnyWidgetId;
}

interface VisLinkContextItem {
    view: string;
    widget: AnyWidgetId;
}

interface VisLinkContextSignalItem extends VisLinkContextItem {
    index: number;
}

interface VisStateUsage {
    /** list of widgets, that depends on this state */
    visibility: Record<string, VisLinkContextItem[]>;
    signals: Record<string, VisLinkContextSignalItem[]>;
    lastChanges: Record<string, VisLinkContextItem[]>;
    /** list of widgets, that depends on this state */
    bindings: Record<StateID, VisLinkContextBinding[]>;
    IDs: StateID[];
    byViews?: Record<string, string[]>;
    widgetAttrInfo?: Record<string, RxWidgetInfoAttributesField>;
}

interface VisLinkContext extends VisStateUsage {
    unregisterChangeHandler: (wid: AnyWidgetId, cb: (type: 'style' | 'signal' | 'visibility' | 'lastChange' | 'binding', item: VisLinkContextBinding | VisLinkContextItem, stateId: string, state: ioBroker.State) => void) => void;
    registerChangeHandler: (wid: AnyWidgetId, cb: (type: 'style' | 'signal' | 'visibility' | 'lastChange' | 'binding', item: VisLinkContextBinding | VisLinkContextItem, stateId: string, state: ioBroker.State) => void) => void;
    subscribe: (stateId: string | string[]) => void;
    unsubscribe: (stateId: string | string[]) => void;
    getViewRef: (view: string) => React.RefObject<HTMLDivElement> | null;
    registerViewRef: (view: string, ref: React.RefObject<HTMLDivElement>, onCommand: (command: ViewCommand, options?: ViewCommandOptions) => any) => void;
    unregisterViewRef: (view: string, ref: React.RefObject<HTMLDivElement>) => void;
}

export interface VisContext {
    // $$: any;
    VisView: VisView;
    activeView: string;
    adapterName: string;
    allWidgets: Record<string, CanWidgetStore>;
    askAboutInclude: (wid: AnyWidgetId, toWid: AnyWidgetId, cb: (_wid: AnyWidgetId, _toWid: AnyWidgetId) => void) => void;
    buildLegacyStructures: () => void;
    // can: any;
    // canStates: any;
    changeProject: (project: Project, ignoreHistory?: boolean) => Promise<void>;
    changeView: (view: string, subView?: string) => void;
    dateFormat: string;
    disableInteraction: boolean;
    editModeComponentClass: string;
    formatUtils: VisFormatUtils;
    instance: number; // vis instance number (not browser instance)
    // jQuery: any;
    lang: ioBroker.Languages;
    linkContext: VisLinkContext;
    lockDragging: boolean;
    moment: moment;
    // onCommand: (view: string, command: string, data?: any) => void
    onWidgetsChanged: (
        changedData: {
            wid: AnyWidgetId;
            view: string;
            style?: Record<string, any>;
            data?: Record<string, any>;
        }[] | null,
        view?: string,
        viewSettings?: ViewSettings,
    ) => void | null;
    onIgnoreMouseEvents: (ignore: boolean) => void;
    projectName: string;
    registerEditorCallback: (name: 'onStealStyle' | 'onPxToPercent' | 'pxToPercent' | 'onPercentToPx', view: string, cb?: (...args?: any) => any) => void;
    runtime: boolean;
    setSelectedGroup: (groupId: string) => void;
    setSelectedWidgets: (widgets: AnyWidgetId[], view?: string, cb?: () => void) => void;
    setTimeInterval: (timeInterval: string) => void;
    setTimeStart: (timeStart: string) => void;
    setValue: (id: string, value: string | boolean | number | null) => void;
    showWidgetNames: boolean;
    socket: LegacyConnection;
    systemConfig: ioBroker.Object;
    theme: Theme;
    themeName: string;
    themeType: 'dark' | 'light';
    timeInterval: string;
    timeStart: string;
    toggleTheme: () => void;
    user: string;
    userGroups: Record<string, ioBroker.Object>;
    views: Project; // project
    widgetHint: 'light' | 'dark' | 'hide';
    container?: boolean;
}

export interface RxWidgetProps extends RxRenderWidgetProps {
    id: string;
    context: VisContext;
    view: string;
    editMode: boolean;
    isRelative: boolean;
    // refParent: React.RefObject<any>,
    // askView: (command: string, props?: any) => any,
    selectedWidgets: string[];
    viewsActiveFilter: Record<string, string[]>;
}

export interface CustomPaletteProperties {
    socket: Connection;
    project: Project;
    changeProject: (project: Project, ignoreHistory?: boolean) => Promise<void>;
    selectedView: string;
    themeType: 'dark' | 'light';
    helpers: {
        deviceIcons: Record<string, React.JSX.Element>;
        detectDevices: (socket: Connection) => Promise<any[]>;
        getObjectIcon: (obj: ioBroker.Object, id?: string, imagePrefix?: string) => React.JSX.Element;
        allObjects: (socket: Connection) => Promise<Record<string, ioBroker.Object>>;
        getNewWidgetId: (project: Project, offset = 0) => SingleWidgetId;
        /** @deprecated use "getNewWidgetId" instead, it will give you the full wid like "w000001" */
        getNewWidgetIdNumber: (isWidgetGroup: boolean, project: Project, offset = 0) => number;
    };
}

interface RxWidgetInfoGroup {
    /** Name of the attributes section */
    readonly name: string;
    /** Fields of this attribute section */
    fields: readonly RxWidgetInfoAttributesField[];
    /** I18n Label */
    readonly label?: string;
    readonly indexFrom?: number;
    readonly indexTo?: string;
    readonly hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
}

interface RxWidgetInfo {
    /** Unique ID of the widget. Starts with 'tpl...' */
    readonly id: string;

    /** Name of a widget set */
    readonly visSet: string;
    /** Label of widget set for GUI (normally it exists a translation in i18n for it) */
    readonly visSetLabel?: string;
    /** Icon of a widget set */
    readonly visSetIcon?: string;
    /** Color of a widget set */
    readonly visSetColor?: string;

    /** Name of widget */
    readonly visName: string;
    /** Label of widget for GUI (normally it exists a translation in i18n for it) */
    readonly visWidgetLabel?: string;
    /** Preview link (image URL, like 'widgets/basic/img/Prev_RedNumber.png') */
    readonly visPrev: string;
    /** Color of widget in palette. If not set, the visSetColor will be taken */
    readonly visWidgetColor?: string;

    /** Groups of attributes */
    visAttrs: (readonly RxWidgetInfoGroup[]);
    /** Default style for widget */
    readonly visDefaultStyle?: React.CSSProperties;
    /** Position in the widget set */
    readonly visOrder?: number;
    /** required, that width is always equal to height (quadratic widget) */
    readonly visResizeLocked?: boolean;
    /** if false, if widget is not resizable */
    readonly visResizable?: boolean;
    /** @deprecated use visResizable */
    readonly resizable?: boolean;
    /** if false, if widget is not draggable  */
    readonly visDraggable?: boolean;
    /** Show specific handlers  */
    readonly visResizeHandles?: ResizeHandler[];
    /** @deprecated use visResizeHandles */
    readonly resizeHandles?: ResizeHandler[];

    /** Function to generate custom palette element */
    readonly customPalette?: (context: CustomPaletteProperties) => React.JSX.Element;
}

type AttributeTypeToDataType<TType extends RxWidgetAttributeType> = TType extends 'checkbox' ? boolean : TType extends 'number' | 'slider' ? number :
    string;

/** Infer the RxData from VisAttrs */
type GetRxDataFromVisAttrs<T extends Record<string, any>> = {
    [K in T['visAttrs'][number]['fields'][number] as K['name']]: AttributeTypeToDataType<K['type']>
}

/** Infers the RxData from a given Widget */
type GetRxDataFromWidget<T extends { getWidgetInfo: () => Record<string, any> }> = GetRxDataFromVisAttrs<ReturnType<(T['getWidgetInfo'])>>
