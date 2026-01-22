/********************************************************************************
 * Copyright (c) 2022 Imixs Software Solutions GmbH and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
/** @jsx svg */
import { GEdge, IViewArgs, Point, PolylineEdgeView, RenderingContext, angleOfPoint, svg, toDegrees } from '@eclipse-glsp/client';
import { injectable } from 'inversify';
import { VNode } from 'snabbdom';

/****************************************************************************
 * 简化的Tasklist边视图，避免复杂的intersection处理
 ****************************************************************************/

// @ts-ignore - JSX is used by the @jsx pragma
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const JSX = { createElement: svg };

@injectable()
export class TasklistEdgeView extends PolylineEdgeView {
    /*
     * 渲染带圆角的边
     */
    protected override renderLine(edge: GEdge, segments: Point[], context: RenderingContext, args?: IViewArgs): VNode {
        const path = this.createPathForSegments(edge, segments, args);
        const vnode: any = <path class-sprotty-edge={true} class-line={true} d={path} />;
        return vnode;
    }

    /**
     * 为边段创建SVG路径，支持圆角
     */
    protected createPathForSegments(edge: GEdge, segments: Point[], args?: IViewArgs): string {
        let path = '';
        let radius = 8; // 默认圆角半径

        // 安全检查：确保segments数组不为空且所有点都有效
        if (!segments || segments.length === 0) {
            return '';
        }

        // 过滤掉无效的点
        const validSegments = segments.filter(p => p && typeof p.x === 'number' && typeof p.y === 'number' && !isNaN(p.x) && !isNaN(p.y));

        if (validSegments.length === 0) {
            return '';
        }

        for (let i = 0; i < validSegments.length; i++) {
            const p = validSegments[i];

            // 起始点
            if (i === 0) {
                path = `M ${p.x},${p.y}`;
                continue;
            }

            // 中间点 - 添加圆角
            if (i > 0 && i < validSegments.length - 1) {
                const plast = validSegments[i - 1];
                const pnext = validSegments[i + 1];

                // 安全检查：确保所有点都有效
                if (
                    plast &&
                    pnext &&
                    typeof plast.x === 'number' &&
                    typeof plast.y === 'number' &&
                    typeof pnext.x === 'number' &&
                    typeof pnext.y === 'number'
                ) {
                    // 计算安全的圆角半径
                    radius = this.computeSafeRadius(p, plast, pnext);

                    // 添加圆角路径
                    path += this.addRoundedCorner(p, plast, pnext, radius);
                } else {
                    // 如果点无效，使用直线
                    path += ` L ${p.x},${p.y}`;
                }
            } else {
                // 终点 - 直线连接
                path += ` L ${p.x},${p.y}`;
            }
        }

        return path;
    }

    /**
     * 计算安全的圆角半径
     */
    protected computeSafeRadius(current: Point, previous: Point, next: Point): number {
        const defaultRadius = 8;
        const minRadius = 2;

        try {
            // 计算到前一个点和下一个点的距离
            const distToPrev = Math.sqrt(Math.pow(current.x - previous.x, 2) + Math.pow(current.y - previous.y, 2));
            const distToNext = Math.sqrt(Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2));

            // 使用较短距离的30%作为最大半径
            const maxRadius = Math.min(distToPrev, distToNext) * 0.3;

            // 返回安全的半径值
            return Math.max(minRadius, Math.min(defaultRadius, maxRadius));
        } catch (error) {
            console.warn('Error computing radius:', error);
            return minRadius;
        }
    }

    /**
     * 添加圆角路径
     */
    protected addRoundedCorner(current: Point, previous: Point, next: Point, radius: number): string {
        try {
            // 计算方向向量
            const dx1 = current.x - previous.x;
            const dy1 = current.y - previous.y;
            const dx2 = next.x - current.x;
            const dy2 = next.y - current.y;

            // 如果是直线（没有转角），直接连接
            if ((dx1 === 0 && dx2 === 0) || (dy1 === 0 && dy2 === 0)) {
                return ` L ${current.x},${current.y}`;
            }

            // 计算圆角的起点和终点
            const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
            const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

            if (len1 === 0 || len2 === 0) {
                return ` L ${current.x},${current.y}`;
            }

            // 标准化方向向量
            const ux1 = dx1 / len1;
            const uy1 = dy1 / len1;
            const ux2 = dx2 / len2;
            const uy2 = dy2 / len2;

            // 计算圆角点
            const startX = current.x - ux1 * radius;
            const startY = current.y - uy1 * radius;
            const endX = current.x + ux2 * radius;
            const endY = current.y + uy2 * radius;

            return ` L ${startX},${startY} Q ${current.x},${current.y} ${endX},${endY}`;
        } catch (error) {
            console.warn('Error adding rounded corner:', error);
            return ` L ${current.x},${current.y}`;
        }
    }

    /**
     * 渲染箭头
     */
    protected override renderAdditionals(edge: GEdge, segments: Point[], context: RenderingContext): VNode[] {
        const additionals: VNode[] = [];

        if (segments.length >= 2) {
            try {
                // 获取最后两个有效点来计算箭头方向
                const validSegments = segments.filter(p => p && typeof p.x === 'number' && typeof p.y === 'number');

                if (validSegments.length >= 2) {
                    const target = validSegments[validSegments.length - 1];
                    const source = validSegments[validSegments.length - 2];

                    if (target && source) {
                        // 计算方向向量
                        const dx = target.x - source.x;
                        const dy = target.y - source.y;
                        const length = Math.sqrt(dx * dx + dy * dy);

                        // 安全检查：确保长度不为0且有效
                        if (length > 0 && !isNaN(length)) {
                            // 箭头偏移距离（像素）
                            const arrowOffset = 8;

                            // 计算箭头位置（稍微远离目标节点）
                            const arrowX = target.x - (dx / length) * arrowOffset;
                            const arrowY = target.y - (dy / length) * arrowOffset;

                            // 再次检查计算结果是否有效
                            if (!isNaN(arrowX) && !isNaN(arrowY)) {
                                const angle = toDegrees(angleOfPoint({ x: dx, y: dy }));

                                // 检查角度是否有效
                                if (!isNaN(angle)) {
                                    const arrowHead = svg('path', {
                                        class: { 'sprotty-edge': true, arrow: true },
                                        attrs: {
                                            d: 'M 0,-3 L 6,0 L 0,3 Z',
                                            transform: `rotate(${angle} ${arrowX} ${arrowY}) translate(${arrowX} ${arrowY})`
                                        }
                                    });
                                    additionals.push(arrowHead);
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.warn('Error rendering arrow:', error);
            }
        }

        return additionals;
    }
}
