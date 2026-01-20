/********************************************************************************
 * Copyright (c) 2022 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied:
 * -- GNU General Public License, version 2 with the GNU Classpath Exception
 * which is available at https://www.gnu.org/software/classpath/license.html
 * -- MIT License which is available at https://opensource.org/license/mit.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0 OR MIT
 ********************************************************************************/

import { GNode, RectangularNodeView, RenderingContext, RoundedCornerNodeView, svg } from '@eclipse-glsp/client';
import { injectable } from 'inversify';
import { VNode } from 'snabbdom';

// 通用函数：为文本元素添加居中属性
function centerTextInNode(children: VNode[], centerX: number, centerY: number): VNode[] {
    return children.map(child => {
        if (child.sel === 'text') {
            return {
                ...child,
                data: {
                    ...child.data,
                    class: {
                        ...child.data?.class,
                        'centered-text': true
                    },
                    attrs: {
                        ...child.data?.attrs,
                        x: centerX,
                        y: centerY,
                        'text-anchor': 'middle',
                        'dominant-baseline': 'central'
                    }
                }
            };
        }
        return child;
    });
}

// 生成六边形的点坐标
function generateHexagonPoints(centerX: number, centerY: number, radius: number): string {
    const points = [];
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        points.push(`${x},${y}`);
    }
    return points.join(' ');
}

// 生成七边形的点坐标
function generateHeptagonPoints(centerX: number, centerY: number, radius: number): string {
    const points = [];
    for (let i = 0; i < 7; i++) {
        const angle = ((2 * Math.PI) / 7) * i - Math.PI / 2; // 从顶部开始
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        points.push(`${x},${y}`);
    }
    return points.join(' ');
}

@injectable()
export class TaskNodeView extends RectangularNodeView {
    override render(node: GNode, context: RenderingContext): VNode {
        const rect = svg('rect', {
            class: { 'tasklist-task': true, selected: node.selected, mouseover: node.hoverFeedback },
            attrs: {
                x: 0,
                y: 0,
                width: Math.max(node.size.width, 0),
                height: Math.max(node.size.height, 0),
                rx: 5,
                ry: 5
            }
        });

        const children = context.renderChildren(node);
        const centerX = node.size.width / 2;
        const centerY = node.size.height / 2;
        const centeredChildren = centerTextInNode(children, centerX, centerY);

        const elements = [rect];
        elements.push(...centeredChildren);
        const vnode: VNode = svg('g', {}, elements as any);
        return vnode;
    }
}

@injectable()
export class DecisionNodeView extends RectangularNodeView {
    override render(node: GNode, context: RenderingContext): VNode {
        const size = Math.min(node.size.width, node.size.height);
        const diamond = svg('polygon', {
            class: { 'tasklist-decision': true, selected: node.selected, mouseover: node.hoverFeedback },
            attrs: {
                points: `${size / 2},0 ${size},${size / 2} ${size / 2},${size} 0,${size / 2}`
            }
        });

        const children = context.renderChildren(node);
        const centerX = size / 2;
        const centerY = size / 2;
        const centeredChildren = centerTextInNode(children, centerX, centerY);

        const elements = [diamond];
        elements.push(...centeredChildren);
        const vnode: VNode = svg('g', {}, elements as any);
        return vnode;
    }
}

@injectable()
export class StartNodeView extends RoundedCornerNodeView {
    override render(node: GNode, context: RenderingContext): VNode {
        const cornerRadius = 15;
        const rect = svg('rect', {
            class: { 'tasklist-start': true, selected: node.selected, mouseover: node.hoverFeedback },
            attrs: {
                x: 0,
                y: 0,
                width: Math.max(node.size.width, 0),
                height: Math.max(node.size.height, 0),
                rx: cornerRadius,
                ry: cornerRadius
            }
        });

        const children = context.renderChildren(node);
        const centerX = node.size.width / 2;
        const centerY = node.size.height / 2;
        const centeredChildren = centerTextInNode(children, centerX, centerY);

        const elements = [rect];
        elements.push(...centeredChildren);
        const vnode: VNode = svg('g', {}, elements as any);
        return vnode;
    }
}

@injectable()
export class EndNodeView extends RoundedCornerNodeView {
    override render(node: GNode, context: RenderingContext): VNode {
        const cornerRadius = 15;
        const rect = svg('rect', {
            class: { 'tasklist-end': true, selected: node.selected, mouseover: node.hoverFeedback },
            attrs: {
                x: 0,
                y: 0,
                width: Math.max(node.size.width, 0),
                height: Math.max(node.size.height, 0),
                rx: cornerRadius,
                ry: cornerRadius
            }
        });

        const children = context.renderChildren(node);
        const centerX = node.size.width / 2;
        const centerY = node.size.height / 2;
        const centeredChildren = centerTextInNode(children, centerX, centerY);

        const elements = [rect];
        elements.push(...centeredChildren);
        const vnode: VNode = svg('g', {}, elements as any);
        return vnode;
    }
}

@injectable()
export class ApiNodeView extends RectangularNodeView {
    override render(node: GNode, context: RenderingContext): VNode {
        const centerX = node.size.width / 2;
        const centerY = node.size.height / 2;
        const radius = Math.min(centerX, centerY) * 0.8; // 六边形半径

        const hexagon = svg('polygon', {
            class: { 'tasklist-api': true, selected: node.selected, mouseover: node.hoverFeedback },
            attrs: {
                points: generateHexagonPoints(centerX, centerY, radius)
            }
        });

        const children = context.renderChildren(node);
        const centeredChildren = centerTextInNode(children, centerX, centerY);

        const elements = [hexagon];
        elements.push(...centeredChildren);
        const vnode: VNode = svg('g', {}, elements as any);
        return vnode;
    }
}

@injectable()
export class DecisionTableNodeView extends RectangularNodeView {
    override render(node: GNode, context: RenderingContext): VNode {
        const centerX = node.size.width / 2;
        const centerY = node.size.height / 2;
        const radius = Math.min(centerX, centerY) * 0.8; // 七边形半径

        const heptagon = svg('polygon', {
            class: { 'tasklist-decision-table': true, selected: node.selected, mouseover: node.hoverFeedback },
            attrs: {
                points: generateHeptagonPoints(centerX, centerY, radius)
            }
        });

        const children = context.renderChildren(node);
        const centeredChildren = centerTextInNode(children, centerX, centerY);

        const elements = [heptagon];
        elements.push(...centeredChildren);
        const vnode: VNode = svg('g', {}, elements as any);
        return vnode;
    }
}

@injectable()
export class AutoNodeView extends RectangularNodeView {
    override render(node: GNode, context: RenderingContext): VNode {
        const centerX = node.size.width / 2;
        const centerY = node.size.height / 2;
        const radius = Math.min(centerX, centerY) * 0.8; // 圆形半径

        const circle = svg('circle', {
            class: { 'tasklist-auto': true, selected: node.selected, mouseover: node.hoverFeedback },
            attrs: {
                cx: centerX,
                cy: centerY,
                r: radius
            }
        });

        const children = context.renderChildren(node);
        const centeredChildren = centerTextInNode(children, centerX, centerY);

        const elements = [circle];
        elements.push(...centeredChildren);
        const vnode: VNode = svg('g', {}, elements as any);
        return vnode;
    }
}

@injectable()
export class SubProcessNodeView extends RectangularNodeView {
    override render(node: GNode, context: RenderingContext): VNode {
        const centerX = node.size.width / 2;
        const centerY = node.size.height / 2;
        const radius = Math.min(centerX, centerY) * 0.8; // 六边形半径

        const hexagon = svg('polygon', {
            class: { 'tasklist-subprocess': true, selected: node.selected, mouseover: node.hoverFeedback },
            attrs: {
                points: generateHexagonPoints(centerX, centerY, radius)
            }
        });

        const children = context.renderChildren(node);
        const centeredChildren = centerTextInNode(children, centerX, centerY);

        const elements = [hexagon];
        elements.push(...centeredChildren);
        const vnode: VNode = svg('g', {}, elements as any);
        return vnode;
    }
}
