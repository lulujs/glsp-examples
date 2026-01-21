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

import { Connectable, IAnchorComputer, Point } from '@eclipse-glsp/client';
import { injectable } from 'inversify';
import { CIRCLE_ANCHOR_KIND, HEXAGON_ANCHOR_KIND } from './tasklist-models';

// Router kinds
const MANHATTAN_ROUTER_KIND = 'manhattan';
const POLYLINE_ROUTER_KIND = 'polyline';

/**
 * Anchor computer for hexagonal nodes with Manhattan routing.
 * Calculates anchor points on the hexagon edges based on the reference point direction.
 */
@injectable()
export class HexagonManhattanAnchorComputer implements IAnchorComputer {
    static readonly KIND = MANHATTAN_ROUTER_KIND + ':' + HEXAGON_ANCHOR_KIND;

    get kind(): string {
        return HexagonManhattanAnchorComputer.KIND;
    }

    getAnchor(connectable: Connectable, refPoint: Point, offset?: number): Point {
        const bounds = (connectable as any).bounds;
        const centerX = bounds.x + bounds.width / 2;
        const centerY = bounds.y + bounds.height / 2;
        const radius = Math.min(bounds.width / 2, bounds.height / 2) * 0.9;

        // 计算参考点相对于中心的方向向量
        const dx = refPoint.x - centerX;
        const dy = refPoint.y - centerY;

        // 如果参考点就在中心，返回右边缘点
        if (dx === 0 && dy === 0) {
            return { x: centerX + radius, y: centerY };
        }

        // 计算从中心到参考点的角度
        const angle = Math.atan2(dy, dx);

        // 六边形的6个顶点角度（从右边开始，逆时针）
        // 顶点角度：0°, 60°, 120°, 180°, 240°, 300°
        const hexVertices = [];
        for (let i = 0; i < 6; i++) {
            const vertexAngle = (i * Math.PI) / 3; // 每60度一个顶点
            hexVertices.push({
                angle: vertexAngle,
                x: centerX + radius * Math.cos(vertexAngle),
                y: centerY + radius * Math.sin(vertexAngle)
            });
        }

        // 找到与参考点方向最接近的两个相邻顶点
        let closestEdgeIndex = 0;
        let minAngleDiff = Math.PI * 2;

        for (let i = 0; i < 6; i++) {
            const nextI = (i + 1) % 6;
            const edgeAngle = (hexVertices[i].angle + hexVertices[nextI].angle) / 2;

            // 处理角度跨越问题
            let normalizedEdgeAngle = edgeAngle;
            if (hexVertices[nextI].angle < hexVertices[i].angle) {
                normalizedEdgeAngle = edgeAngle + Math.PI;
            }

            const angleDiff = Math.abs(this.normalizeAngle(angle - normalizedEdgeAngle));
            if (angleDiff < minAngleDiff) {
                minAngleDiff = angleDiff;
                closestEdgeIndex = i;
            }
        }

        // 计算与最近边的交点
        const vertex1 = hexVertices[closestEdgeIndex];
        const vertex2 = hexVertices[(closestEdgeIndex + 1) % 6];

        // 计算从中心到参考点的射线与六边形边的交点
        const intersectionPoint = this.getLineIntersection(
            centerX,
            centerY,
            refPoint.x,
            refPoint.y,
            vertex1.x,
            vertex1.y,
            vertex2.x,
            vertex2.y
        );

        return intersectionPoint || { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) };
    }

    /**
     * 计算两条线段的交点
     */
    private getLineIntersection(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        x3: number,
        y3: number,
        x4: number,
        y4: number
    ): Point | undefined {
        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (Math.abs(denom) < 1e-10) {
            return undefined;
        }

        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

        // 检查交点是否在线段上
        if (u >= 0 && u <= 1) {
            return {
                x: x1 + t * (x2 - x1),
                y: y1 + t * (y2 - y1)
            };
        }

        return undefined;
    }

    private normalizeAngle(angle: number): number {
        while (angle > Math.PI) {
            angle -= 2 * Math.PI;
        }
        while (angle < -Math.PI) {
            angle += 2 * Math.PI;
        }
        return angle;
    }
}

/**
 * Anchor computer for circular nodes with Manhattan routing.
 * Calculates anchor points on the circle edge based on the reference point direction.
 */
@injectable()
export class CircleManhattanAnchorComputer implements IAnchorComputer {
    static readonly KIND = MANHATTAN_ROUTER_KIND + ':' + CIRCLE_ANCHOR_KIND;

    get kind(): string {
        return CircleManhattanAnchorComputer.KIND;
    }

    getAnchor(connectable: Connectable, refPoint: Point, offset?: number): Point {
        const bounds = (connectable as any).bounds;
        const centerX = bounds.x + bounds.width / 2;
        const centerY = bounds.y + bounds.height / 2;
        const radius = Math.min(bounds.width / 2, bounds.height / 2) * 0.9;

        // 计算参考点相对于中心的方向向量
        const dx = refPoint.x - centerX;
        const dy = refPoint.y - centerY;

        // 如果参考点就在中心，返回右边缘点
        if (dx === 0 && dy === 0) {
            return { x: centerX + radius, y: centerY };
        }

        // 计算从中心到参考点的单位向量
        const distance = Math.sqrt(dx * dx + dy * dy);
        const unitX = dx / distance;
        const unitY = dy / distance;

        // 对于曼哈顿路由，我们希望锚点在4个主要方向之一（上、下、左、右）
        // 选择最接近参考点方向的主方向
        let manhattanX: number;
        let manhattanY: number;

        if (Math.abs(unitX) > Math.abs(unitY)) {
            // 水平方向占主导
            manhattanX = unitX > 0 ? 1 : -1;
            manhattanY = 0;
        } else {
            // 垂直方向占主导
            manhattanX = 0;
            manhattanY = unitY > 0 ? 1 : -1;
        }

        // 计算圆周上的锚点
        const anchorX = centerX + radius * manhattanX;
        const anchorY = centerY + radius * manhattanY;

        return {
            x: anchorX,
            y: anchorY
        };
    }
}

/**
 * Anchor computer for hexagonal nodes with Polyline routing.
 * Calculates anchor points on the hexagon edges based on the reference point direction.
 */
@injectable()
export class HexagonPolylineAnchorComputer implements IAnchorComputer {
    static readonly KIND = POLYLINE_ROUTER_KIND + ':' + HEXAGON_ANCHOR_KIND;

    get kind(): string {
        return HexagonPolylineAnchorComputer.KIND;
    }

    getAnchor(connectable: Connectable, refPoint: Point, offset?: number): Point {
        const bounds = (connectable as any).bounds;
        const centerX = bounds.x + bounds.width / 2;
        const centerY = bounds.y + bounds.height / 2;
        const radius = Math.min(bounds.width / 2, bounds.height / 2) * 0.9;

        // 计算参考点相对于中心的方向向量
        const dx = refPoint.x - centerX;
        const dy = refPoint.y - centerY;

        // 如果参考点就在中心，返回右边缘点
        if (dx === 0 && dy === 0) {
            return { x: centerX + radius, y: centerY };
        }

        // 计算从中心到参考点的角度
        const angle = Math.atan2(dy, dx);

        // 六边形的6个顶点角度（从右边开始，逆时针）
        // 顶点角度：0°, 60°, 120°, 180°, 240°, 300°
        const hexVertices = [];
        for (let i = 0; i < 6; i++) {
            const vertexAngle = (i * Math.PI) / 3; // 每60度一个顶点
            hexVertices.push({
                angle: vertexAngle,
                x: centerX + radius * Math.cos(vertexAngle),
                y: centerY + radius * Math.sin(vertexAngle)
            });
        }

        // 找到与参考点方向最接近的两个相邻顶点
        let closestEdgeIndex = 0;
        let minAngleDiff = Math.PI * 2;

        for (let i = 0; i < 6; i++) {
            const nextI = (i + 1) % 6;
            const edgeAngle = (hexVertices[i].angle + hexVertices[nextI].angle) / 2;

            // 处理角度跨越问题
            let normalizedEdgeAngle = edgeAngle;
            if (hexVertices[nextI].angle < hexVertices[i].angle) {
                normalizedEdgeAngle = edgeAngle + Math.PI;
            }

            const angleDiff = Math.abs(this.normalizeAngle(angle - normalizedEdgeAngle));
            if (angleDiff < minAngleDiff) {
                minAngleDiff = angleDiff;
                closestEdgeIndex = i;
            }
        }

        // 计算与最近边的交点
        const vertex1 = hexVertices[closestEdgeIndex];
        const vertex2 = hexVertices[(closestEdgeIndex + 1) % 6];

        // 计算从中心到参考点的射线与六边形边的交点
        const intersectionPoint = this.getLineIntersection(
            centerX,
            centerY,
            refPoint.x,
            refPoint.y,
            vertex1.x,
            vertex1.y,
            vertex2.x,
            vertex2.y
        );

        return intersectionPoint || { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) };
    }

    /**
     * 计算两条线段的交点
     */
    private getLineIntersection(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        x3: number,
        y3: number,
        x4: number,
        y4: number
    ): Point | undefined {
        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (Math.abs(denom) < 1e-10) {
            return undefined;
        }

        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

        // 检查交点是否在线段上
        if (u >= 0 && u <= 1) {
            return {
                x: x1 + t * (x2 - x1),
                y: y1 + t * (y2 - y1)
            };
        }

        return undefined;
    }

    private normalizeAngle(angle: number): number {
        while (angle > Math.PI) {
            angle -= 2 * Math.PI;
        }
        while (angle < -Math.PI) {
            angle += 2 * Math.PI;
        }
        return angle;
    }
}

/**
 * Anchor computer for circular nodes with Polyline routing.
 * Calculates anchor points on the circle edge based on the reference point direction.
 */
@injectable()
export class CirclePolylineAnchorComputer implements IAnchorComputer {
    static readonly KIND = POLYLINE_ROUTER_KIND + ':' + CIRCLE_ANCHOR_KIND;

    get kind(): string {
        return CirclePolylineAnchorComputer.KIND;
    }

    getAnchor(connectable: Connectable, refPoint: Point, offset?: number): Point {
        const bounds = (connectable as any).bounds;
        const centerX = bounds.x + bounds.width / 2;
        const centerY = bounds.y + bounds.height / 2;
        const radius = Math.min(bounds.width / 2, bounds.height / 2) * 0.9;

        // 计算参考点相对于中心的方向向量
        const dx = refPoint.x - centerX;
        const dy = refPoint.y - centerY;

        // 如果参考点就在中心，返回右边缘点
        if (dx === 0 && dy === 0) {
            return { x: centerX + radius, y: centerY };
        }

        // 计算从中心到参考点的单位向量
        const distance = Math.sqrt(dx * dx + dy * dy);
        const unitX = dx / distance;
        const unitY = dy / distance;

        // 计算圆周上的锚点（直接使用方向向量，不限制为4个方向）
        const anchorX = centerX + radius * unitX;
        const anchorY = centerY + radius * unitY;

        return {
            x: anchorX,
            y: anchorY
        };
    }
}
