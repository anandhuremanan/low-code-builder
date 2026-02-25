import React from 'react';
import { Input } from '../../../components/ui/Input';
import type { NodeProperties } from './useNodeProperties';

export const SpacingSettings = ({ p }: { p: NodeProperties }) => {
    return (
        <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Spacing</label>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Padding</label>
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            size="small"
                            type="number"
                            placeholder="Top (px)"
                            value={p.styles.paddingTop}
                            onChange={(e) => p.handleBoxSpacingChange('padding', 'top', e.target.value)}
                        />
                        <Input
                            size="small"
                            type="number"
                            placeholder="Right (px)"
                            value={p.styles.paddingRight}
                            onChange={(e) => p.handleBoxSpacingChange('padding', 'right', e.target.value)}
                        />
                        <Input
                            size="small"
                            type="number"
                            placeholder="Bottom (px)"
                            value={p.styles.paddingBottom}
                            onChange={(e) => p.handleBoxSpacingChange('padding', 'bottom', e.target.value)}
                        />
                        <Input
                            size="small"
                            type="number"
                            placeholder="Left (px)"
                            value={p.styles.paddingLeft}
                            onChange={(e) => p.handleBoxSpacingChange('padding', 'left', e.target.value)}
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Margin</label>
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            size="small"
                            type="number"
                            placeholder="Top (px)"
                            value={p.styles.marginTop}
                            onChange={(e) => p.handleBoxSpacingChange('margin', 'top', e.target.value)}
                        />
                        <Input
                            size="small"
                            type="number"
                            placeholder="Right (px)"
                            value={p.styles.marginRight}
                            onChange={(e) => p.handleBoxSpacingChange('margin', 'right', e.target.value)}
                        />
                        <Input
                            size="small"
                            type="number"
                            placeholder="Bottom (px)"
                            value={p.styles.marginBottom}
                            onChange={(e) => p.handleBoxSpacingChange('margin', 'bottom', e.target.value)}
                        />
                        <Input
                            size="small"
                            type="number"
                            placeholder="Left (px)"
                            value={p.styles.marginLeft}
                            onChange={(e) => p.handleBoxSpacingChange('margin', 'left', e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
