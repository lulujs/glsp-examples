/********************************************************************************
 * Copyright (c) 2024 CrossBreeze.
 ********************************************************************************/
/** @jsx svg */
/* eslint-disable react/no-unknown-property */

import { GPort, RenderingContext, ShapeView, svg } from '@eclipse-glsp/client';
import { injectable } from 'inversify';
import { VNode } from 'snabbdom';

/**
 * 矩形节点的Port视图
 */
@injectable()
export class RectangularPortView implements ShapeView {
    render(port: GPort, context: RenderingContext): VNode {
        return svg('circle', {
            class: { 'tasklist-port': true, 'rectangular-port': true },
            attrs: {
                cx: port.size.width / 2,
                cy: port.size.height / 2,
                r: 4 // 增大视觉半径
            }
        });
    }

    isVisible(model: GPort, context: RenderingContext): boolean {
        return true;
    }
}

/**
 * 六边形节点的Port视图
 */
@injectable()
export class HexagonPortView implements ShapeView {
    render(port: GPort, context: RenderingContext): VNode {
        return svg('circle', {
            class: { 'tasklist-port': true, 'hexagon-port': true },
            attrs: {
                cx: port.size.width / 2,
                cy: port.size.height / 2,
                r: 4 // 增大视觉半径
            }
        });
    }

    isVisible(model: GPort, context: RenderingContext): boolean {
        return true;
    }
}

/**
 * 圆形节点的Port视图
 */
@injectable()
export class CirclePortView implements ShapeView {
    render(port: GPort, context: RenderingContext): VNode {
        return svg('circle', {
            class: { 'tasklist-port': true, 'circle-port': true },
            attrs: {
                cx: port.size.width / 2,
                cy: port.size.height / 2,
                r: 4 // 增大视觉半径
            }
        });
    }

    isVisible(model: GPort, context: RenderingContext): boolean {
        return true;
    }
}

/**
 * 菱形节点的Port视图
 */
@injectable()
export class DiamondPortView implements ShapeView {
    render(port: GPort, context: RenderingContext): VNode {
        return svg('circle', {
            class: { 'tasklist-port': true, 'diamond-port': true },
            attrs: {
                cx: port.size.width / 2,
                cy: port.size.height / 2,
                r: 4 // 增大视觉半径
            }
        });
    }

    isVisible(model: GPort, context: RenderingContext): boolean {
        return true;
    }
}

/**
 * 八边形节点的Port视图
 */
@injectable()
export class OctagonPortView implements ShapeView {
    render(port: GPort, context: RenderingContext): VNode {
        return svg('circle', {
            class: { 'tasklist-port': true, 'octagon-port': true },
            attrs: {
                cx: port.size.width / 2,
                cy: port.size.height / 2,
                r: 4 // 增大视觉半径
            }
        });
    }

    isVisible(model: GPort, context: RenderingContext): boolean {
        return true;
    }
}
