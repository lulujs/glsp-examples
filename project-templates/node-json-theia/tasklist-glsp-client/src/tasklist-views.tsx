/********************************************************************************
 * Copyright (c) 2024 CrossBreeze.
 ********************************************************************************/
/** @jsx svg */
/* eslint-disable react/no-unknown-property */
/* eslint-disable max-len */

import { GGraph, GGraphView, GNode, RectangularNodeView, RenderingContext, RoundedCornerNodeView, svg } from '@eclipse-glsp/client';
import { ReactNode } from '@theia/core/shared/react';
import { injectable } from 'inversify';

import { VNode } from 'snabbdom';

/**
 * 工作流程图视图 - 渲染整个工作流程图
 * Workflow graph view - renders the entire workflow diagram
 */
@injectable()
export class WorkflowGraphView extends GGraphView {
    override render(model: Readonly<GGraph>, context: RenderingContext): VNode {
        const edgeRouting = this.edgeRouterRegistry.routeAllChildren(model);
        const transform = `scale(${model.zoom}) translate(${-model.scroll.x},${-model.scroll.y})`;
        const graph: any = (
            <svg class-sprotty-graph={true}>
                <g transform={transform}>{context.renderChildren(model, { edgeRouting }) as ReactNode}</g>
            </svg>
        );
        // 应用网格样式和渲染样式
        if (graph.data) {
            graph.data.style = { ...graph.data.style, ...this.getGridStyle(model, context), ...this.renderStyle(context) };
        }
        return graph;
    }

    protected renderStyle(context: RenderingContext): any {
        return {
            height: '100%'
        };
    }
}

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

// 生成六边形的点坐标（顺时针旋转90°）- 用于API节点
function generateHexagonPoints(centerX: number, centerY: number, radius: number): string {
    const points = [];
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + Math.PI / 2; // 添加90°旋转
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        points.push(`${x},${y}`);
    }
    return points.join(' ');
}

// 生成六边形的点坐标（逆时针旋转180°）- 用于SubProcess节点
function generateSubProcessHexagonPoints(centerX: number, centerY: number, radius: number): string {
    const points = [];
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI; // 减去180°旋转（逆时针）
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
                points: generateSubProcessHexagonPoints(centerX, centerY, radius)
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
