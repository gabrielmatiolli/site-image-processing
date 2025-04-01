// @flow
import * as React from 'react';
import {Button} from "@/components/ui/button";

interface ChangeModeProps {
    mode: 'products' | 'content';
    changeMode: (mode: 'products' | 'content') => void;
}

export function ChangeMode({mode, changeMode}: ChangeModeProps) {
    return (
        <div className={'w-full flex items-center justify-center gap-2'}>
            <Button variant={mode === 'products' ? 'default' : 'outline'} className={'w-full flex-1'}
                    onClick={() => changeMode('products')}>Produtos</Button>
            <Button variant={mode === 'content' ? 'default' : 'outline'} className={'w-full flex-1'}
                    onClick={() => changeMode('content')}>Conteúdo</Button>
        </div>
    );
}