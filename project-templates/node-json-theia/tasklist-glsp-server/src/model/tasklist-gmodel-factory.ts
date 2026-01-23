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
import { GEdge, GGraph, GLabel, GModelFactory, GNode, GPort } from '@eclipse-glsp/server';
import { inject, injectable } from 'inversify';
import { Task, TaskType, Transition } from './tasklist-model';
import { TaskListModelState } from './tasklist-model-state';
import { TaskListTypes } from './tasklist-types';

@injectable()
export class TaskListGModelFactory implements GModelFactory {
    @inject(TaskListModelState)
    protected modelState: TaskListModelState;

    createModel(): void {
        const taskList = this.modelState.sourceModel;
        this.modelState.index.indexTaskList(taskList);
        const childNodes = taskList.tasks.map(task => this.createTaskNode(task));
        const childEdges = taskList.transitions.map(transition => this.createTransitionEdge(transition));
        const newRoot = GGraph.builder() //
            .id(taskList.id)
            .addChildren(childNodes)
            .addChildren(childEdges)
            .build();
        this.modelState.updateRoot(newRoot);
    }

    protected createTaskNode(task: Task): GNode {
        const nodeType = this.getNodeType(task.type);
        const baseCssClass = this.getNodeCssClass(task.type);

        const size = task.size || Task.getDefaultSize(task.type);

        const builder = GNode.builder()
            .id(task.id)
            .type(nodeType)
            .addCssClass(baseCssClass)
            .add(GLabel.builder().text(task.name).id(`${task.id}_label`).build())
            .layout('hbox')
            .addLayoutOption('paddingLeft', 5)
            .position(task.position)
            .size(size.width, size.height); // 明确设置节点大小

        // 如果是 error-end 类型，添加额外的样式类
        if (task.subType === 'error-end') {
            builder.addCssClass('error-end');
        }

        // 为每个节点添加相应的ports
        const ports = this.createPortsForNode(task, size);
        ports.forEach(port => builder.add(port));

        return builder.build();
    }

    /**
     * 为不同类型的节点创建相应的ports
     */
    protected createPortsForNode(task: Task, size: { width: number; height: number }): GPort[] {
        const ports: GPort[] = [];
        const centerX = size.width / 2;
        const centerY = size.height / 2;

        switch (task.type) {
            case TaskType.TASK:
                // 矩形节点：上下左右4个ports + 四个顶点ports
                ports.push(
                    // 原有的上下左右ports
                    this.createPort(task.id, '_top', centerX, 0, TaskListTypes.RECTANGULAR_PORT),
                    this.createPort(task.id, '_right', size.width, centerY, TaskListTypes.RECTANGULAR_PORT),
                    this.createPort(task.id, '_bottom', centerX, size.height, TaskListTypes.RECTANGULAR_PORT),
                    this.createPort(task.id, '_left', 0, centerY, TaskListTypes.RECTANGULAR_PORT),
                    // 新增的四个顶点ports
                    this.createPort(task.id, '_top_left', 0, 0, TaskListTypes.RECTANGULAR_PORT), // 左上顶点
                    this.createPort(task.id, '_top_right', size.width, 0, TaskListTypes.RECTANGULAR_PORT), // 右上顶点
                    this.createPort(task.id, '_bottom_left', 0, size.height, TaskListTypes.RECTANGULAR_PORT), // 左下顶点
                    this.createPort(task.id, '_bottom_right', size.width, size.height, TaskListTypes.RECTANGULAR_PORT) // 右下顶点
                );
                break;

            case TaskType.START:
            case TaskType.END: {
                // 开始和结束节点：8个方向的ports（上、右上、右、右下、下、左下、左、左上）
                // 端口大小为10x10，需要让端口完全贴合在节点边缘
                const portSize = 5; // 端口半径

                // 上 - 端口底边贴合节点顶边
                const startEndTopX = centerX;
                const startEndTopY = -portSize + 3;

                // 右上 - 端口左下角贴合节点右上角附近
                const startEndTopRightX = size.width * 0.85;
                const startEndTopRightY = size.height * 0.15 - portSize;

                // 右 - 端口左边贴合节点右边
                const startEndRightX = size.width;
                const startEndRightY = centerY;

                // 右下 - 端口左上角贴合节点右下角附近
                const startEndBottomRightX = size.width * 0.85;
                const startEndBottomRightY = size.height * 0.85 + 5;

                // 下 - 端口顶边贴合节点底边
                const startEndBottomX = centerX;
                const startEndBottomY = size.height;

                // 左下 - 端口右上角贴合节点左下角附近
                const startEndBottomLeftX = size.width * 0.15 - portSize;
                const startEndBottomLeftY = size.height * 0.85 + 5;

                // 左 - 端口右边贴合节点左边
                const startEndLeftX = -portSize + 4;
                const startEndLeftY = centerY;

                // 左上 - 端口右下角贴合节点左上角附近
                const startEndTopLeftX = size.width * 0.15 - portSize;
                const startEndTopLeftY = size.height * 0.15 - portSize;

                ports.push(
                    this.createPort(task.id, '_top', startEndTopX, startEndTopY, TaskListTypes.RECTANGULAR_PORT),
                    this.createPort(task.id, '_top_right', startEndTopRightX, startEndTopRightY, TaskListTypes.RECTANGULAR_PORT),
                    this.createPort(task.id, '_right', startEndRightX, startEndRightY, TaskListTypes.RECTANGULAR_PORT),
                    this.createPort(task.id, '_bottom_right', startEndBottomRightX, startEndBottomRightY, TaskListTypes.RECTANGULAR_PORT),
                    this.createPort(task.id, '_bottom', startEndBottomX, startEndBottomY, TaskListTypes.RECTANGULAR_PORT),
                    this.createPort(task.id, '_bottom_left', startEndBottomLeftX, startEndBottomLeftY, TaskListTypes.RECTANGULAR_PORT),
                    this.createPort(task.id, '_left', startEndLeftX, startEndLeftY, TaskListTypes.RECTANGULAR_PORT),
                    this.createPort(task.id, '_top_left', startEndTopLeftX, startEndTopLeftY, TaskListTypes.RECTANGULAR_PORT)
                );
                break;
            }

            case TaskType.DECISION: {
                // 菱形节点：4个顶点上的ports + 4个边中点ports
                // 菱形渲染坐标：`${size / 2},0 ${size},${size / 2} ${size / 2},${size} 0,${size / 2}`
                const diamondSize = Math.min(size.width, size.height);
                const halfSize = diamondSize / 2;
                const quarterSize = diamondSize / 4;
                const threeQuarterSize = (diamondSize * 3) / 4;

                ports.push(
                    // 原有的4个顶点ports
                    this.createPort(task.id, '_top', halfSize, 0, TaskListTypes.DIAMOND_PORT),
                    this.createPort(task.id, '_right', diamondSize, halfSize, TaskListTypes.DIAMOND_PORT),
                    this.createPort(task.id, '_bottom', halfSize, diamondSize, TaskListTypes.DIAMOND_PORT),
                    this.createPort(task.id, '_left', 0, halfSize, TaskListTypes.DIAMOND_PORT),
                    // 新增的4个边中点ports（在每两个顶点之间）
                    this.createPort(task.id, '_top_right', threeQuarterSize, quarterSize, TaskListTypes.DIAMOND_PORT), // 上顶点和右顶点之间
                    this.createPort(task.id, '_bottom_right', threeQuarterSize, threeQuarterSize, TaskListTypes.DIAMOND_PORT), // 右顶点和下顶点之间
                    this.createPort(task.id, '_bottom_left', quarterSize, threeQuarterSize, TaskListTypes.DIAMOND_PORT), // 下顶点和左顶点之间
                    this.createPort(task.id, '_top_left', quarterSize, quarterSize, TaskListTypes.DIAMOND_PORT) // 左顶点和上顶点之间
                );
                break;
            }

            case TaskType.API: {
                // API节点六边形：顺时针旋转90°
                // 顶点角度：90°, 150°, 210°, 270°, 330°, 30°
                const radius = Math.min(centerX, centerY) * 0.8;

                // 计算6个顶点
                const vertices: Array<{ x: number; y: number }> = [];
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i + Math.PI / 2; // 添加90°旋转
                    vertices.push({
                        x: centerX + radius * Math.cos(angle),
                        y: centerY + radius * Math.sin(angle)
                    });
                }

                // 顶点索引：0=90°(上), 1=150°(左上), 2=210°(左下), 3=270°(下), 4=330°(右下), 5=30°(右上)
                // 上顶点：顶点0(90°)
                const apiTopX = vertices[0].x;
                const apiTopY = vertices[0].y;

                // 下顶点：顶点3(270°)
                const apiBottomX = vertices[3].x;
                const apiBottomY = vertices[3].y;

                // 左竖直边中间点：连接顶点1(150°)和顶点2(210°)的中点
                const apiLeftX = (vertices[1].x + vertices[2].x) / 2;
                const apiLeftY = (vertices[1].y + vertices[2].y) / 2;

                // 右竖直边中间点：连接顶点5(30°)和顶点4(330°)的中点
                const apiRightX = (vertices[5].x + vertices[4].x) / 2;
                const apiRightY = (vertices[5].y + vertices[4].y) / 2;

                ports.push(
                    this.createPort(task.id, '_top', apiTopX, apiTopY, TaskListTypes.HEXAGON_PORT),
                    this.createPort(task.id, '_right', apiRightX, apiRightY, TaskListTypes.HEXAGON_PORT),
                    this.createPort(task.id, '_bottom', apiBottomX, apiBottomY, TaskListTypes.HEXAGON_PORT),
                    this.createPort(task.id, '_left', apiLeftX, apiLeftY, TaskListTypes.HEXAGON_PORT)
                );
                break;
            }

            case TaskType.SUB_PROCESS: {
                // SubProcess六边形节点：上下水平边中间点、左右斜边顶点 + 4条斜角边中心点ports
                // SubProcess使用逆时针旋转180°的六边形
                // 注意：渲染代码中 centerX = width, centerY = height（不是width/2和height/2）
                const renderCenterX = size.width;
                const renderCenterY = size.height;
                const radius = Math.min(renderCenterX, renderCenterY) * 0.8; // 与渲染代码保持一致

                // 计算6个顶点
                const vertices: Array<{ x: number; y: number }> = [];
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i - Math.PI; // 减去180°旋转
                    vertices.push({
                        x: renderCenterX + radius * Math.cos(angle),
                        y: renderCenterY + radius * Math.sin(angle)
                    });
                }

                // 顶点索引：0=180°(左), 1=240°(左下), 2=300°(右下), 3=0°(右), 4=60°(右上), 5=120°(左上)
                // 原有的4个ports
                // 上水平边中间点：连接顶点5(120°)和顶点4(60°)的中点
                const topX = (vertices[5].x + vertices[4].x) / 2;
                const topY = (vertices[5].y + vertices[4].y) / 2;

                // 下水平边中间点：连接顶点1(240°)和顶点2(300°)的中点
                const bottomX = (vertices[1].x + vertices[2].x) / 2;
                const bottomY = (vertices[1].y + vertices[2].y) / 2;

                // 左斜边顶点：顶点0(180°)
                const leftX = vertices[0].x;
                const leftY = vertices[0].y;

                // 右斜边顶点：顶点3(0°)
                const rightX = vertices[3].x;
                const rightY = vertices[3].y;

                // 创建原有的4个ports
                ports.push(
                    this.createPort(task.id, '_top', topX, topY, TaskListTypes.HEXAGON_PORT),
                    this.createPort(task.id, '_right', rightX, rightY, TaskListTypes.HEXAGON_PORT),
                    this.createPort(task.id, '_bottom', bottomX, bottomY, TaskListTypes.HEXAGON_PORT),
                    this.createPort(task.id, '_left', leftX, leftY, TaskListTypes.HEXAGON_PORT)
                );

                // 新增的4条斜角边中心点ports
                // 六边形有6条边：2条水平边（已有ports）+ 4条斜角边（需要添加ports）
                // 左上斜边中心点：连接顶点0(180°)和顶点5(120°)的中点
                const topLeftX = (vertices[0].x + vertices[5].x) / 2;
                const topLeftY = (vertices[0].y + vertices[5].y) / 2;

                // 右上斜边中心点：连接顶点4(60°)和顶点3(0°)的中点
                const topRightX = (vertices[4].x + vertices[3].x) / 2;
                const topRightY = (vertices[4].y + vertices[3].y) / 2;

                // 右下斜边中心点：连接顶点3(0°)和顶点2(300°)的中点
                const bottomRightX = (vertices[3].x + vertices[2].x) / 2;
                const bottomRightY = (vertices[3].y + vertices[2].y) / 2;

                // 左下斜边中心点：连接顶点1(240°)和顶点0(180°)的中点
                const bottomLeftX = (vertices[1].x + vertices[0].x) / 2;
                const bottomLeftY = (vertices[1].y + vertices[0].y) / 2;

                ports.push(
                    this.createPort(task.id, '_top_left', topLeftX, topLeftY, TaskListTypes.HEXAGON_PORT),
                    this.createPort(task.id, '_top_right', topRightX, topRightY, TaskListTypes.HEXAGON_PORT),
                    this.createPort(task.id, '_bottom_right', bottomRightX, bottomRightY, TaskListTypes.HEXAGON_PORT),
                    this.createPort(task.id, '_bottom_left', bottomLeftX, bottomLeftY, TaskListTypes.HEXAGON_PORT)
                );
                break;
            }

            case TaskType.AUTO: {
                // 圆形节点：8个方向的ports（上、右上、右、右下、下、左下、左、左上）
                const radius = Math.min(centerX, centerY) - 5; // 圆的半径，留5px边距

                // 计算8个方向的ports（从上方开始，顺时针）
                // 上 (90°)
                const topX = centerX;
                const topY = centerY - radius;

                // 右上 (45°)
                const topRightX = centerX + radius * Math.cos(Math.PI / 4);
                const topRightY = centerY - radius * Math.sin(Math.PI / 4);

                // 右 (0°)
                const rightX = centerX + radius;
                const rightY = centerY;

                // 右下 (315° 或 -45°)
                const bottomRightX = centerX + radius * Math.cos(-Math.PI / 4);
                const bottomRightY = centerY - radius * Math.sin(-Math.PI / 4);

                // 下 (270° 或 -90°)
                const bottomX = centerX;
                const bottomY = centerY + radius;

                // 左下 (225° 或 -135°)
                const bottomLeftX = centerX + radius * Math.cos((-3 * Math.PI) / 4);
                const bottomLeftY = centerY - radius * Math.sin((-3 * Math.PI) / 4);

                // 左 (180°)
                const leftX = centerX - radius;
                const leftY = centerY;

                // 左上 (135°)
                const topLeftX = centerX + radius * Math.cos((3 * Math.PI) / 4);
                const topLeftY = centerY - radius * Math.sin((3 * Math.PI) / 4);

                ports.push(
                    this.createPort(task.id, '_top', topX, topY, TaskListTypes.CIRCLE_PORT),
                    this.createPort(task.id, '_top_right', topRightX, topRightY, TaskListTypes.CIRCLE_PORT),
                    this.createPort(task.id, '_right', rightX, rightY, TaskListTypes.CIRCLE_PORT),
                    this.createPort(task.id, '_bottom_right', bottomRightX, bottomRightY, TaskListTypes.CIRCLE_PORT),
                    this.createPort(task.id, '_bottom', bottomX, bottomY, TaskListTypes.CIRCLE_PORT),
                    this.createPort(task.id, '_bottom_left', bottomLeftX, bottomLeftY, TaskListTypes.CIRCLE_PORT),
                    this.createPort(task.id, '_left', leftX, leftY, TaskListTypes.CIRCLE_PORT),
                    this.createPort(task.id, '_top_left', topLeftX, topLeftY, TaskListTypes.CIRCLE_PORT)
                );
                break;
            }

            case TaskType.DECISION_TABLE: {
                // 计算八边形的8个顶点（从右边开始，逆时针）
                // 原有的4个主要方向ports（水平/垂直边的中心点）
                ports.push(
                    this.createPort(task.id, '_top', centerX, 5, TaskListTypes.OCTAGON_PORT),
                    this.createPort(task.id, '_right', size.width - 5, centerY, TaskListTypes.OCTAGON_PORT),
                    this.createPort(task.id, '_bottom', centerX, size.height - 5, TaskListTypes.OCTAGON_PORT),
                    this.createPort(task.id, '_left', 5, centerY, TaskListTypes.OCTAGON_PORT)
                );
                break;
            }
        }

        return ports;
    }

    /**
     * 创建单个port
     */
    protected createPort(nodeId: string, suffix: string, x: number, y: number, portType: string): GPort {
        return GPort.builder()
            .id(`${nodeId}${suffix}`)
            .type(portType)
            .position(x - 5, y - 5) // 10x10的port，居中定位
            .size(10, 10) // 增大port尺寸，更容易点击
            .build();
    }

    protected getNodeType(taskType: TaskType): string {
        switch (taskType) {
            case TaskType.TASK:
                return TaskListTypes.TASK_NODE;
            case TaskType.DECISION:
                return TaskListTypes.DECISION_NODE;
            case TaskType.START:
                return TaskListTypes.START_NODE;
            case TaskType.END:
                return TaskListTypes.END_NODE;
            case TaskType.API:
                return TaskListTypes.API_NODE;
            case TaskType.DECISION_TABLE:
                return TaskListTypes.DECISION_TABLE_NODE;
            case TaskType.AUTO:
                return TaskListTypes.AUTO_NODE;
            case TaskType.SUB_PROCESS:
                return TaskListTypes.SUB_PROCESS_NODE;
            default:
                return TaskListTypes.TASK_NODE;
        }
    }

    protected getNodeCssClass(taskType: TaskType): string {
        switch (taskType) {
            case TaskType.TASK:
                return 'tasklist-task';
            case TaskType.DECISION:
                return 'tasklist-decision';
            case TaskType.START:
                return 'tasklist-start';
            case TaskType.END:
                return 'tasklist-end';
            case TaskType.API:
                return 'tasklist-api';
            case TaskType.DECISION_TABLE:
                return 'tasklist-decision-table';
            case TaskType.AUTO:
                return 'tasklist-auto';
            case TaskType.SUB_PROCESS:
                return 'tasklist-subprocess';
            default:
                return 'tasklist-task';
        }
    }

    protected createTransitionEdge(transition: Transition): GEdge {
        const builder = GEdge.builder() //
            .id(transition.id)
            .type(TaskListTypes.TRANSITION_EDGE)
            .addCssClass('tasklist-transition')
            .sourceId(transition.sourceTaskId)
            .targetId(transition.targetTaskId)
            .routerKind('manhattan'); // 使用曼哈顿路由

        // 如果有保存的路由点，则添加它们
        if (transition.routingPoints && transition.routingPoints.length > 0) {
            transition.routingPoints.forEach(point => {
                builder.addRoutingPoint(point);
            });
        }

        return builder.build();
    }
}
