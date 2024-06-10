import React, { useState } from 'react';
import {
    Button, IconButton, TextField,
} from '@mui/material';

import { Clear as ClearIcon } from '@mui/icons-material';

import {
    Icon,
    Utils,
    type ThemeType,
} from '@iobroker/adapter-react-v5';

import MaterialIconSelector from '@/Components/MaterialIconSelector';

interface EditFieldIcon64Props {
    value: string;
    change: (newValue: string) => void;
    disabled?: boolean;
    error?: boolean;
    editMode: boolean;
    classes: Record<string, string>;
    themeType: ThemeType;
}

export default function EditFieldIcon64(props: EditFieldIcon64Props) {
    const [showDialog, setShowDialog] = useState(false);

    return  <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
        <TextField
            fullWidth
            size="small"
            variant="standard"
            value={props.value}
            error={!!props.error}
            disabled={!props.editMode || props.disabled}
            onChange={e => props.change(e.target.value)}
            InputProps={{
                endAdornment: props.value ? <IconButton
                    disabled={!props.editMode || props.disabled}
                    size="small"
                    onClick={() => props.change('')}
                >
                    <ClearIcon />
                </IconButton> : null,
                classes: {
                    input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent),
                },
            }}
        />
        <Button
            disabled={!props.editMode || props.disabled}
            variant={props.value ? 'outlined' : undefined}
            color={props.value ? 'grey' : undefined}
            onClick={() => setShowDialog(true)}
        >
            {props.value ? <Icon src={props.value} style={{ width: 36, height: 36 }} /> : '...'}
        </Button>
        {showDialog &&
            <MaterialIconSelector
                themeType={props.themeType}
                value={props.value}
                onClose={(icon: string | null) => {
                    setShowDialog(false);
                    if (icon !== null) {
                        props.change(icon);
                    }
                }}
            />}
    </div>;
}
